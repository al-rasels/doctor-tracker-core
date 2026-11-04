import { Doctor as DefaultDoctor } from "../models/doctor.model.js";
import { Patient as DefaultPatient } from "../models/patient.model.js";
import { AppError } from "../utils/AppError.js";
import { calculatePagination } from "../utils/pagination.js";

/**
 * Helper function to extract Doctor and Patient models passed from controller.
 * Defaults to the imported models if not explicitly provided.
 *
 * @param {Object|Function} models - Model or object containing { Doctor, Patient }
 * @returns {{ DoctorModel: Function, PatientModel: Function }}
 */
const resolveModels = (models) => {
  if (models && (models.Doctor || models.Patient)) {
    return {
      DoctorModel: models.Doctor || DefaultDoctor,
      PatientModel: models.Patient || DefaultPatient
    };
  }

  if (models && (models.schema || models.modelName || typeof models.findOne === "function")) {
    return {
      DoctorModel: models,
      PatientModel: DefaultPatient
    };
  }

  return {
    DoctorModel: DefaultDoctor,
    PatientModel: DefaultPatient
  };
};

/**
 * Builds MongoDB search and filter conditions for doctors query.
 *
 * @param {Object} query - Incoming search and filter parameters
 * @returns {Object} MongoDB query filter object
 */
const buildDoctorFilter = (query = {}) => {
  const filter = {};

  // Text search across name, specialization, hospital, and email
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { name: searchRegex },
      { specialization: searchRegex },
      { hospital: searchRegex },
      { email: searchRegex }
    ];
  }

  // Exact specialization match (case-insensitive)
  if (query.specialization) {
    filter.specialization = new RegExp(`^${query.specialization}$`, "i");
  }

  // Date range filter for creation date
  if (query.startDate || query.endDate) {
    filter.createdAt = {};

    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endOfDay = new Date(query.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endOfDay;
    }
  }

  return filter;
};

/**
 * Create and save a new doctor.
 * Model is passed as a parameter from the controller.
 *
 * @param {Function} DoctorModel - Injected Doctor Mongoose Model
 * @param {Object} doctorData - Doctor profile information
 * @returns {Promise<Object>} Created doctor record
 */
export const createDoctor = async (DoctorModel = DefaultDoctor, doctorData) => {
  // Support both (DoctorModel, doctorData) and (doctorData)
  let Model = DoctorModel;
  let data = doctorData;

  if (!doctorData && DoctorModel && !DoctorModel.findOne) {
    data = DoctorModel;
    Model = DefaultDoctor;
  }

  const normalizedEmail = data.email.toLowerCase().trim();

  // Check if a doctor with this email already exists
  const existingDoctor = await Model.findOne({ email: normalizedEmail });
  if (existingDoctor) {
    throw AppError.conflict("A doctor with this email address already exists");
  }

  // Create new doctor
  const doctor = await Model.create({
    name: data.name,
    specialization: data.specialization,
    hospital: data.hospital,
    phone: data.phone,
    email: normalizedEmail
  });

  return doctor;
};

/**
 * Fetch paginated list of doctors with optional search and filters.
 * Model is passed as a parameter from the controller.
 *
 * @param {Function} DoctorModel - Injected Doctor Mongoose Model
 * @param {Object} query - Query options (search, specialization, pagination, sorting)
 * @returns {Promise<{ doctors: Array, meta: Object }>}
 */
export const getDoctors = async (DoctorModel = DefaultDoctor, query = {}) => {
  let Model = DoctorModel;
  let queryParams = query;

  if (DoctorModel && !DoctorModel.find && !DoctorModel.countDocuments) {
    queryParams = DoctorModel;
    Model = DefaultDoctor;
  }

  const filter = buildDoctorFilter(queryParams);

  const totalCount = await Model.countDocuments(filter);
  const { skip, limit, meta } = calculatePagination(
    { page: queryParams.page, limit: queryParams.limit },
    totalCount
  );

  const sortOrder = queryParams.sortOrder === "asc" ? 1 : -1;
  const sortField = queryParams.sortBy || "createdAt";

  const doctors = await Model.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  return { doctors, meta };
};

/**
 * Find a single doctor by their unique database ID.
 * Model is passed as a parameter from the controller.
 *
 * @param {Function} DoctorModel - Injected Doctor Mongoose Model
 * @param {string} id - Doctor ObjectId
 * @returns {Promise<Object>} Doctor document
 */
export const getDoctorById = async (DoctorModel = DefaultDoctor, id) => {
  let Model = DoctorModel;
  let doctorId = id;

  if (!id && typeof DoctorModel === "string") {
    doctorId = DoctorModel;
    Model = DefaultDoctor;
  }

  const doctor = await Model.findById(doctorId).lean();
  if (!doctor) {
    throw AppError.notFound(`Doctor with ID ${doctorId} not found`);
  }

  return doctor;
};

/**
 * Update an existing doctor profile.
 * Model is passed as a parameter from the controller.
 *
 * @param {Function} DoctorModel - Injected Doctor Mongoose Model
 * @param {string} id - Doctor ObjectId
 * @param {Object} updateData - Updated profile fields
 * @returns {Promise<Object>} Updated doctor document
 */
export const updateDoctor = async (DoctorModel = DefaultDoctor, id, updateData) => {
  let Model = DoctorModel;
  let doctorId = id;
  let data = updateData;

  if (typeof DoctorModel === "string") {
    doctorId = DoctorModel;
    data = id;
    Model = DefaultDoctor;
  }

  // If email is changing, verify it is not already taken by another doctor
  if (data.email) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await Model.findOne({
      email: normalizedEmail,
      _id: { $ne: doctorId }
    });

    if (existing) {
      throw AppError.conflict("A doctor with this email address already exists");
    }

    data.email = normalizedEmail;
  }

  const doctor = await Model.findByIdAndUpdate(
    doctorId,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!doctor) {
    throw AppError.notFound(`Doctor with ID ${doctorId} not found`);
  }

  return doctor;
};

/**
 * Delete a doctor and clean up their associated patients.
 * Models { Doctor, Patient } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Doctor, Patient } models
 * @param {string} id - Doctor ObjectId
 */
export const deleteDoctor = async (models, id) => {
  const { DoctorModel, PatientModel } = resolveModels(models);

  const doctor = await DoctorModel.findById(id);
  if (!doctor) {
    throw AppError.notFound(`Doctor with ID ${id} not found`);
  }

  // Remove associated patients to keep data clean and avoid orphaned rows
  await PatientModel.deleteMany({ doctorId: id });
  await DoctorModel.findByIdAndDelete(id);
};

/**
 * Get all patients belonging to a specific doctor.
 * Models { Doctor, Patient } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Doctor, Patient } models
 * @param {string} doctorId - Doctor ObjectId
 * @param {Object} query - Pagination and search query parameters
 * @returns {Promise<{ patients: Array, meta: Object }>}
 */
export const getDoctorPatients = async (models, doctorId, query = {}) => {
  const { DoctorModel, PatientModel } = resolveModels(models);

  // Verify the doctor exists
  await getDoctorById(DoctorModel, doctorId);

  const filter = { doctorId };
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { condition: searchRegex }
    ];
  }

  const totalCount = await PatientModel.countDocuments(filter);
  const { skip, limit, meta } = calculatePagination(query, totalCount);

  const patients = await PatientModel.find(filter)
    .sort({ admissionDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return { patients, meta };
};

/**
 * Add a new patient assigned directly under a specific doctor.
 * Models { Doctor, Patient } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Doctor, Patient } models
 * @param {string} doctorId - Doctor ObjectId
 * @param {Object} patientData - Patient profile information
 * @returns {Promise<Object>} Created patient document
 */
export const addPatientToDoctor = async (models, doctorId, patientData) => {
  const { DoctorModel, PatientModel } = resolveModels(models);

  const doctor = await DoctorModel.findById(doctorId);
  if (!doctor) {
    throw AppError.notFound(`Doctor with ID ${doctorId} not found`);
  }

  const patient = await PatientModel.create({
    doctorId: doctor._id,
    name: patientData.name,
    age: patientData.age,
    gender: patientData.gender,
    phone: patientData.phone,
    condition: patientData.condition,
    status: patientData.status || "admitted",
    admissionDate: patientData.admissionDate || new Date()
  });

  // Increment the doctor's patient count
  await DoctorModel.findByIdAndUpdate(doctorId, { $inc: { patientCount: 1 } });

  return patient;
};

/**
 * Remove a patient from a doctor's active patient list.
 * Models { Doctor, Patient } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Doctor, Patient } models
 * @param {string} doctorId - Doctor ObjectId
 * @param {string} patientId - Patient ObjectId
 */
export const removePatientFromDoctor = async (models, doctorId, patientId) => {
  const { DoctorModel, PatientModel } = resolveModels(models);

  await getDoctorById(DoctorModel, doctorId);

  const patient = await PatientModel.findOneAndDelete({ _id: patientId, doctorId });
  if (!patient) {
    throw AppError.notFound(`Patient with ID ${patientId} not found under doctor ${doctorId}`);
  }

  // Decrement the doctor's patient count
  await DoctorModel.findByIdAndUpdate(doctorId, { $inc: { patientCount: -1 } });
};

export const DoctorService = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  removePatientFromDoctor
};
