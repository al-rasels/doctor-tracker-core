import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { DoctorService } from "../services/doctor.service.js";

export class DoctorController {
  static createDoctor = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.createDoctor(req.body);
    return ApiResponse.success(res, doctor, "Doctor created successfully", 201);
  });

  static getDoctors = asyncHandler(async (req: Request, res: Response) => {
    const { doctors, meta } = await DoctorService.getDoctors(req.query as any);
    return ApiResponse.success(res, doctors, "Doctors retrieved successfully", 200, meta);
  });

  static getDoctorById = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.getDoctorById(req.params.id);
    return ApiResponse.success(res, doctor, "Doctor retrieved successfully", 200);
  });

  static updateDoctor = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
    return ApiResponse.success(res, doctor, "Doctor updated successfully", 200);
  });

  static deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
    await DoctorService.deleteDoctor(req.params.id);
    return ApiResponse.success(res, { id: req.params.id }, "Doctor and associated records deleted", 200);
  });

  static getDoctorPatients = asyncHandler(async (req: Request, res: Response) => {
    const { patients, meta } = await DoctorService.getDoctorPatients(req.params.id, req.query as any);
    return ApiResponse.success(res, patients, "Doctor patients retrieved successfully", 200, meta);
  });

  static addPatientToDoctor = asyncHandler(async (req: Request, res: Response) => {
    const patient = await DoctorService.addPatientToDoctor(req.params.id, req.body);
    return ApiResponse.success(res, patient, "Patient added to doctor successfully", 201);
  });

  static removePatientFromDoctor = asyncHandler(async (req: Request, res: Response) => {
    await DoctorService.removePatientFromDoctor(req.params.id, req.params.patientId);
    return ApiResponse.success(res, { patientId: req.params.patientId }, "Patient removed from doctor successfully", 200);
  });
}
