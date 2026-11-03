import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { PatientService } from "../services/patient.service.js";

export class PatientController {
  static createPatient = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.createPatient(req.body);
    return ApiResponse.success(res, patient, "Patient created successfully", 201);
  });

  static getPatients = asyncHandler(async (req: Request, res: Response) => {
    const { patients, meta } = await PatientService.getPatients(req.query as any);
    return ApiResponse.success(res, patients, "Patients retrieved successfully", 200, meta);
  });

  static getPatientById = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.getPatientById(req.params.id);
    return ApiResponse.success(res, patient, "Patient retrieved successfully", 200);
  });

  static updatePatient = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.updatePatient(req.params.id, req.body);
    return ApiResponse.success(res, patient, "Patient updated successfully", 200);
  });

  static deletePatient = asyncHandler(async (req: Request, res: Response) => {
    await PatientService.deletePatient(req.params.id);
    return ApiResponse.success(res, { id: req.params.id }, "Patient record deleted successfully", 200);
  });
}
