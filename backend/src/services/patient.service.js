import mongoose from "mongoose";
import { Patient as DefaultPatient } from "../models/patient.model.js";
import { Doctor as DefaultDoctor } from "../models/doctor.model.js";
import { AppError } from "../utils/AppError.js";
import { calculatePagination } from "../utils/pagination.js";

/**
 * Helper function to extract Patient and Doctor models passed from controller.
 * Defaults to the imported models if not explicitly provided.
 *
 * @param {Object|Function} models - Model or object containing { Patient, Doctor }
 * @returns {{ PatientModel: Function, DoctorModel: Function }}
 */
const resolveModels = (models) => {
  if (models && (models.Patient || models.Doctor)) {
    return {
      PatientModel: models.Patient || DefaultPatient,
      DoctorModel: models.Doctor || DefaultDoctor
    };
  }

  if (models && (models.schema || models.modelName || typeof models.findOne === "function")) {
    return {
      PatientModel: models,
      DoctorModel: DefaultDoctor
    };
  }

  return {
    PatientModel: DefaultPatient,
    DoctorModel: DefaultDoctor
  };
};

/**
 * Helper to adjust a doctor's active patient caseload counter.
 *
 * @param {Function} DoctorModel - Injected Doctor Mongoose Model
 * @param {string|mongoose.Types.ObjectId} doctorId - Doctor ObjectId
 * @param {number} delta - Number to increment (+1) or decrement (-1)
 */
const adjustDoctorPatientCount = async (DoctorModel, doctorId, delta) => {
  if (!doctorId || !DoctorModel) return;
  await DoctorModel.findByIdAndUpdate(doctorId, { $inc: { patientCount: delta } });
};

/**
 * Builds MongoDB search and filter conditions for patients query.
 *
 * @param {Object} query - Incoming search and filter parameters
 * @returns {Object} MongoDB query filter object
 */
const buildPatientFilter = (query = {}) => {
  const filter = {};

  // Keyword search across patient name, phone, or condition
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [
      { name: searchRegex },
      { phone: searchRegex },
      { condition: searchRegex }
    ];
  }

  // Filter by attending doctor
  if (query.doctorId) {
    filter.doctorId = new mongoose.Types.ObjectId(query.doctorId);
  }

  // Filter by clinical status (admitted, under_observation, recovered, discharged)
  if (query.status) {
    filter.status = query.status;
  }

  // Filter by medical condition / diagnosis (case-insensitive)
  if (query.condition) {
    filter.condition = new RegExp(`^${query.condition}$`, "i");
  }

  // Date-wise filtering on admission date
  if (query.startDate || query.endDate) {
    filter.admissionDate = {};

    if (query.startDate) {
      filter.admissionDate.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endOfDay = new Date(query.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filter.admissionDate.$lte = endOfDay;
    }
  }

  return filter;
};

/**
 * Create a new patient and associate them with a doctor.
 * Models { Patient, Doctor } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Patient, Doctor } models
 * @param {Object} patientData - Patient profile information
 * @returns {Promise<Object>} Created patient document
 */
export const createPatient = async (models, patientData) => {
  const { PatientModel, DoctorModel } = resolveModels(models);

  // If called as createPatient(data) directly without models parameter
  const data = patientData || (models && !models.find ? models : {});

  const doctor = await DoctorModel.findById(data.doctorId);
  if (!doctor) {
    throw AppError.notFound(`Doctor with ID ${data.doctorId} not found`);
  }

  const patient = await PatientModel.create({
    doctorId: doctor._id,
    name: data.name,
    age: data.age,
    gender: data.gender,
    phone: data.phone,
    condition: data.condition,
    status: data.status || "admitted",
    admissionDate: data.admissionDate || new Date()
  });

  // Increment doctor's patient caseload
  await adjustDoctorPatientCount(DoctorModel, doctor._id, 1);

  return patient;
};

/**
 * Fetch a paginated and filtered list of patients with populated doctor details.
 * Model 'Patient' is passed as a parameter from the controller.
 *
 * @param {Function} PatientModel - Injected Patient Mongoose Model
 * @param {Object} query - Query parameters (search, status, date filters, page, limit)
 * @returns {Promise<{ patients: Array, meta: Object }>}
 */
export const getPatients = async (PatientModel = DefaultPatient, query = {}) => {
  let Model = PatientModel;
  let queryParams = query;

  if (PatientModel && !PatientModel.find && !PatientModel.countDocuments) {
    queryParams = PatientModel;
    Model = DefaultPatient;
  }

  const filter = buildPatientFilter(queryParams);

  const totalCount = await Model.countDocuments(filter);
  const { skip, limit, meta } = calculatePagination(
    { page: queryParams.page, limit: queryParams.limit },
    totalCount
  );

  const sortOrder = queryParams.sortOrder === "asc" ? 1 : -1;
  const sortField = queryParams.sortBy || "admissionDate";

  const patients = await Model.find(filter)
    .populate("doctorId", "name specialization hospital email")
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();

  return { patients, meta };
};

/**
 * Find a single patient by ID with doctor details.
 * Model 'Patient' is passed as a parameter from the controller.
 *
 * @param {Function} PatientModel - Injected Patient Mongoose Model
 * @param {string} id - Patient ObjectId
 * @returns {Promise<Object>} Patient document with doctor details
 */
export const getPatientById = async (PatientModel = DefaultPatient, id) => {
  let Model = PatientModel;
  let patientId = id;

  if (!id && typeof PatientModel === "string") {
    patientId = PatientModel;
    Model = DefaultPatient;
  }

  const patient = await Model.findById(patientId)
    .populate("doctorId", "name specialization hospital email phone")
    .lean();

  if (!patient) {
    throw AppError.notFound(`Patient with ID ${patientId} not found`);
  }

  return patient;
};

/**
 * Update patient record.
 * Handles doctor caseload rebalancing if reassigned to another doctor.
 * Models { Patient, Doctor } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Patient, Doctor } models
 * @param {string} id - Patient ObjectId
 * @param {Object} updateData - Updated patient data
 * @returns {Promise<Object>} Updated patient document
 */
export const updatePatient = async (models, id, updateData) => {
  const { PatientModel, DoctorModel } = resolveModels(models);

  let targetId = id;
  let data = updateData;

  // Support direct call updatePatient(id, updateData)
  if (typeof models === "string") {
    targetId = models;
    data = id;
  }

  const existingPatient = await PatientModel.findById(targetId);
  if (!existingPatient) {
    throw AppError.notFound(`Patient with ID ${targetId} not found`);
  }

  // Handle re-assignment between doctors if doctorId changed
  const hasDoctorChanged =
    data.doctorId &&
    data.doctorId !== existingPatient.doctorId.toString();

  if (hasDoctorChanged) {
    const newDoctor = await DoctorModel.findById(data.doctorId);
    if (!newDoctor) {
      throw AppError.notFound(`New Doctor with ID ${data.doctorId} not found`);
    }

    // Decrement from old doctor, increment for new doctor
    await Promise.all([
      adjustDoctorPatientCount(DoctorModel, existingPatient.doctorId, -1),
      adjustDoctorPatientCount(DoctorModel, newDoctor._id, 1)
    ]);
  }

  const updatedPatient = await PatientModel.findByIdAndUpdate(
    targetId,
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate("doctorId", "name specialization hospital")
    .lean();

  return updatedPatient;
};

/**
 * Delete a patient and decrement the associated doctor's patient count.
 * Models { Patient, Doctor } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Patient, Doctor } models
 * @param {string} id - Patient ObjectId
 */
export const deletePatient = async (models, id) => {
  const { PatientModel, DoctorModel } = resolveModels(models);

  let targetId = id;
  if (typeof models === "string") {
    targetId = models;
  }

  const patient = await PatientModel.findByIdAndDelete(targetId);
  if (!patient) {
    throw AppError.notFound(`Patient with ID ${targetId} not found`);
  }

  // Decrement doctor's caseload
  await adjustDoctorPatientCount(DoctorModel, patient.doctorId, -1);
};

export const PatientService = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
