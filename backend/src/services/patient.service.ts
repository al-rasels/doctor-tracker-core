import mongoose from "mongoose";
import { Patient, IPatient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { AppError } from "../utils/AppError.js";
import { calculatePagination } from "../utils/pagination.js";
import {
  CreatePatientInput,
  UpdatePatientInput,
  PatientQueryParams
} from "../validations/patient.validation.js";

export class PatientService {
  static async createPatient(input: CreatePatientInput): Promise<IPatient> {
    const doctor = await Doctor.findById(input.doctorId);
    if (!doctor) {
      throw AppError.notFound(`Doctor with ID ${input.doctorId} not found`);
    }

    const patient = await Patient.create({
      doctorId: doctor._id,
      name: input.name,
      age: input.age,
      gender: input.gender,
      phone: input.phone,
      condition: input.condition,
      status: input.status || "admitted",
      admissionDate: input.admissionDate || new Date()
    });

    await Doctor.findByIdAndUpdate(doctor._id, { $inc: { patientCount: 1 } });

    return patient;
  }

  static async getPatients(query: PatientQueryParams) {
    const filter: Record<string, any> = {};

    // Search query across patient name, phone, or condition
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { condition: searchRegex }
      ];
    }

    // Filter by specific doctor
    if (query.doctorId) {
      filter.doctorId = new mongoose.Types.ObjectId(query.doctorId);
    }

    // Filter by clinical status
    if (query.status) {
      filter.status = query.status;
    }

    // Filter by condition / diagnosis
    if (query.condition) {
      filter.condition = new RegExp(`^${query.condition}$`, "i");
    }

    // Date-wise filtering on admissionDate
    if (query.startDate || query.endDate) {
      filter.admissionDate = {};
      if (query.startDate) {
        filter.admissionDate.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.admissionDate.$lte = end;
      }
    }

    const totalCount = await Patient.countDocuments(filter);
    const { page, limit, skip, meta } = calculatePagination(
      { page: query.page, limit: query.limit },
      totalCount
    );

    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sortField = query.sortBy || "admissionDate";

    const patients = await Patient.find(filter)
      .populate("doctorId", "name specialization hospital email")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return { patients, meta };
  }

  static async getPatientById(id: string): Promise<IPatient> {
    const patient = await Patient.findById(id)
      .populate("doctorId", "name specialization hospital email phone")
      .lean();

    if (!patient) {
      throw AppError.notFound(`Patient with ID ${id} not found`);
    }

    return patient as unknown as IPatient;
  }

  static async updatePatient(id: string, input: UpdatePatientInput): Promise<IPatient> {
    const existingPatient = await Patient.findById(id);
    if (!existingPatient) {
      throw AppError.notFound(`Patient with ID ${id} not found`);
    }

    // If reassigned to a different doctor
    if (input.doctorId && input.doctorId !== existingPatient.doctorId.toString()) {
      const newDoctor = await Doctor.findById(input.doctorId);
      if (!newDoctor) {
        throw AppError.notFound(`New Doctor with ID ${input.doctorId} not found`);
      }

      // Decrement count on old doctor, increment on new doctor
      await Promise.all([
        Doctor.findByIdAndUpdate(existingPatient.doctorId, { $inc: { patientCount: -1 } }),
        Doctor.findByIdAndUpdate(newDoctor._id, { $inc: { patientCount: 1 } })
      ]);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, runValidators: true }
    )
      .populate("doctorId", "name specialization hospital")
      .lean();

    return updatedPatient as unknown as IPatient;
  }

  static async deletePatient(id: string): Promise<void> {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      throw AppError.notFound(`Patient with ID ${id} not found`);
    }

    // Decrement patient count on associated doctor
    await Doctor.findByIdAndUpdate(patient.doctorId, {
      $inc: { patientCount: -1 }
    });
  }
}
