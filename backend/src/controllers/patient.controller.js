import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as patientService from "../services/patient.service.js";

/**
 * Register a new patient.
 * Models { Patient, Doctor } are passed as parameters into the service.
 * POST /api/patients
 */
export const createPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient({ Patient, Doctor }, req.body);
  return sendSuccess(res, patient, "Patient created successfully", 201);
});

/**
 * Get paginated list of patients with search, status, and date filters.
 * Model 'Patient' is passed as a parameter into the service.
 * GET /api/patients
 */
export const getPatients = asyncHandler(async (req, res) => {
  const { patients, meta } = await patientService.getPatients(Patient, req.query);
  return sendSuccess(res, patients, "Patients retrieved successfully", 200, meta);
});

/**
 * Get single patient by ID with doctor details.
 * Model 'Patient' is passed as a parameter into the service.
 * GET /api/patients/:id
 */
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(Patient, req.params.id);
  return sendSuccess(res, patient, "Patient retrieved successfully", 200);
});

/**
 * Update patient information (status, diagnosis, doctor assignment).
 * Models { Patient, Doctor } are passed as parameters into the service.
 * PUT /api/patients/:id
 */
export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(
    { Patient, Doctor },
    req.params.id,
    req.body
  );
  return sendSuccess(res, patient, "Patient updated successfully", 200);
});

/**
 * Delete a patient record.
 * Models { Patient, Doctor } are passed as parameters into the service.
 * DELETE /api/patients/:id
 */
export const deletePatient = asyncHandler(async (req, res) => {
  await patientService.deletePatient({ Patient, Doctor }, req.params.id);
  return sendSuccess(res, { id: req.params.id }, "Patient record deleted successfully", 200);
});

export const PatientController = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
