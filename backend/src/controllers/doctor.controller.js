import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as doctorService from "../services/doctor.service.js";

/**
 * Register a new doctor.
 * Model 'Doctor' is passed as a parameter into the service.
 * POST /api/doctors
 */
export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(Doctor, req.body);
  return sendSuccess(res, doctor, "Doctor created successfully", 201);
});

/**
 * Get paginated list of doctors with search and filter.
 * Model 'Doctor' is passed as a parameter into the service.
 * GET /api/doctors
 */
export const getDoctors = asyncHandler(async (req, res) => {
  const { doctors, meta } = await doctorService.getDoctors(Doctor, req.query);
  return sendSuccess(res, doctors, "Doctors retrieved successfully", 200, meta);
});

/**
 * Get single doctor by ID.
 * Model 'Doctor' is passed as a parameter into the service.
 * GET /api/doctors/:id
 */
export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(Doctor, req.params.id);
  return sendSuccess(res, doctor, "Doctor retrieved successfully", 200);
});

/**
 * Update doctor profile.
 * Model 'Doctor' is passed as a parameter into the service.
 * PUT /api/doctors/:id
 */
export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(Doctor, req.params.id, req.body);
  return sendSuccess(res, doctor, "Doctor updated successfully", 200);
});

/**
 * Delete doctor and all associated patients.
 * Models { Doctor, Patient } are passed as parameters into the service.
 * DELETE /api/doctors/:id
 */
export const deleteDoctor = asyncHandler(async (req, res) => {
  await doctorService.deleteDoctor({ Doctor, Patient }, req.params.id);
  return sendSuccess(res, { id: req.params.id }, "Doctor and associated records deleted", 200);
});

/**
 * Get patients assigned to a specific doctor.
 * Models { Doctor, Patient } are passed as parameters into the service.
 * GET /api/doctors/:id/patients
 */
export const getDoctorPatients = asyncHandler(async (req, res) => {
  const { patients, meta } = await doctorService.getDoctorPatients(
    { Doctor, Patient },
    req.params.id,
    req.query
  );
  return sendSuccess(res, patients, "Doctor patients retrieved successfully", 200, meta);
});

/**
 * Add a new patient under a specific doctor.
 * Models { Doctor, Patient } are passed as parameters into the service.
 * POST /api/doctors/:id/patients
 */
export const addPatientToDoctor = asyncHandler(async (req, res) => {
  const patient = await doctorService.addPatientToDoctor(
    { Doctor, Patient },
    req.params.id,
    req.body
  );
  return sendSuccess(res, patient, "Patient added to doctor successfully", 201);
});

/**
 * Remove a patient from a doctor's active patient list.
 * Models { Doctor, Patient } are passed as parameters into the service.
 * DELETE /api/doctors/:id/patients/:patientId
 */
export const removePatientFromDoctor = asyncHandler(async (req, res) => {
  await doctorService.removePatientFromDoctor(
    { Doctor, Patient },
    req.params.id,
    req.params.patientId
  );
  return sendSuccess(
    res,
    { patientId: req.params.patientId },
    "Patient removed from doctor successfully",
    200
  );
});

export const DoctorController = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  removePatientFromDoctor
};
