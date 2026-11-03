import mongoose from "mongoose";
import { Doctor, IDoctor } from "../models/doctor.model.js";
import { Patient, IPatient } from "../models/patient.model.js";
import { AppError } from "../utils/AppError.js";
import { calculatePagination } from "../utils/pagination.js";
import {
  CreateDoctorInput,
  UpdateDoctorInput,
  DoctorQueryParams
} from "../validations/doctor.validation.js";
import { CreateDoctorPatientInput } from "../validations/patient.validation.js";

export class DoctorService {
  static async createDoctor(input: CreateDoctorInput): Promise<IDoctor> {
    const existingDoctor = await Doctor.findOne({ email: input.email.toLowerCase() });
    if (existingDoctor) {
      throw AppError.conflict("A doctor with this email address already exists");
    }

    const doctor = await Doctor.create({
      name: input.name,
      specialization: input.specialization,
      hospital: input.hospital,
      phone: input.phone,
      email: input.email.toLowerCase()
    });

    return doctor;
  }

  static async getDoctors(query: DoctorQueryParams) {
    const filter: Record<string, any> = {};

    // Search query (across name, specialization, hospital, email)
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { hospital: searchRegex },
        { email: searchRegex }
      ];
    }

    // Specialization filter
    if (query.specialization) {
      filter.specialization = new RegExp(`^${query.specialization}$`, "i");
    }

    // Date range filter on createdAt
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const totalCount = await Doctor.countDocuments(filter);
    const { page, limit, skip, meta } = calculatePagination(
      { page: query.page, limit: query.limit },
      totalCount
    );

    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sortField = query.sortBy || "createdAt";

    const doctors = await Doctor.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return { doctors, meta };
  }

  static async getDoctorById(id: string): Promise<IDoctor> {
    const doctor = await Doctor.findById(id).lean();
    if (!doctor) {
      throw AppError.notFound(`Doctor with ID ${id} not found`);
    }
    return doctor as unknown as IDoctor;
  }

  static async updateDoctor(id: string, input: UpdateDoctorInput): Promise<IDoctor> {
    if (input.email) {
      const existing = await Doctor.findOne({
        email: input.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existing) {
        throw AppError.conflict("A doctor with this email address already exists");
      }
      input.email = input.email.toLowerCase();
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true }).lean();
    if (!doctor) {
      throw AppError.notFound(`Doctor with ID ${id} not found`);
    }
    return doctor as unknown as IDoctor;
  }

  static async deleteDoctor(id: string): Promise<void> {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw AppError.notFound(`Doctor with ID ${id} not found`);
    }

    // Delete associated patients to prevent orphaned patient records
    await Patient.deleteMany({ doctorId: id });
    await Doctor.findByIdAndDelete(id);
  }

  static async getDoctorPatients(doctorId: string, queryParams: { page?: number; limit?: number; search?: string }) {
    await this.getDoctorById(doctorId);

    const filter: Record<string, any> = { doctorId };
    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, "i");
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }, { condition: searchRegex }];
    }

    const totalCount = await Patient.countDocuments(filter);
    const { page, limit, skip, meta } = calculatePagination(queryParams, totalCount);

    const patients = await Patient.find(filter)
      .sort({ admissionDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return { patients, meta };
  }

  static async addPatientToDoctor(doctorId: string, input: CreateDoctorPatientInput): Promise<IPatient> {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw AppError.notFound(`Doctor with ID ${doctorId} not found`);
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

    await Doctor.findByIdAndUpdate(doctorId, { $inc: { patientCount: 1 } });

    return patient;
  }

  static async removePatientFromDoctor(doctorId: string, patientId: string): Promise<void> {
    await this.getDoctorById(doctorId);

    const patient = await Patient.findOneAndDelete({ _id: patientId, doctorId });
    if (!patient) {
      throw AppError.notFound(`Patient with ID ${patientId} not found under doctor ${doctorId}`);
    }

    await Doctor.findByIdAndUpdate(doctorId, {
      $inc: { patientCount: -1 }
    });
  }
}
