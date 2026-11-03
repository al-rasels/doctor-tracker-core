import { z } from "zod";

export const patientStatusEnum = z.enum(["admitted", "under_observation", "recovered", "discharged"]);
export const genderEnum = z.enum(["male", "female", "other"]);

export const patientIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format")
  })
});

export const doctorPatientParamsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format")
  })
});

export const createPatientSchema = z.object({
  body: z.object({
    doctorId: z
      .string({ required_error: "Doctor ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format"),
    name: z
      .string({ required_error: "Patient name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name cannot exceed 120 characters"),
    age: z.coerce
      .number({ required_error: "Age is required" })
      .int("Age must be an integer")
      .min(0, "Age cannot be negative")
      .max(130, "Age cannot exceed 130"),
    gender: genderEnum,
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(6, "Phone must be at least 6 characters"),
    condition: z
      .string({ required_error: "Condition is required" })
      .trim()
      .min(2, "Condition must be at least 2 characters"),
    status: patientStatusEnum.default("admitted"),
    admissionDate: z.coerce.date().optional()
  })
});

export const createDoctorPatientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format")
  }),
  body: z.object({
    name: z
      .string({ required_error: "Patient name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name cannot exceed 120 characters"),
    age: z.coerce
      .number({ required_error: "Age is required" })
      .int("Age must be an integer")
      .min(0, "Age cannot be negative")
      .max(130, "Age cannot exceed 130"),
    gender: genderEnum,
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(6, "Phone must be at least 6 characters"),
    condition: z
      .string({ required_error: "Condition is required" })
      .trim()
      .min(2, "Condition must be at least 2 characters"),
    status: patientStatusEnum.default("admitted"),
    admissionDate: z.coerce.date().optional()
  })
});

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Patient ID format")
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      age: z.coerce.number().int().min(0).max(130).optional(),
      gender: genderEnum.optional(),
      phone: z.string().trim().min(6).optional(),
      condition: z.string().trim().min(2).optional(),
      status: patientStatusEnum.optional(),
      doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format").optional(),
      admissionDate: z.coerce.date().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update"
    })
});

export const patientQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: patientStatusEnum.optional(),
    condition: z.string().trim().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(["name", "admissionDate", "createdAt", "age"]).default("admissionDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>["body"];
export type CreateDoctorPatientInput = z.infer<typeof createDoctorPatientSchema>["body"];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>["body"];
export type PatientQueryParams = z.infer<typeof patientQuerySchema>["query"];
