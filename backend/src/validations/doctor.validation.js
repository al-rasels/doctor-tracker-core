import { z } from "zod";

export const doctorIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format")
  })
});

export const createDoctorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Doctor name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name cannot exceed 120 characters"),
    specialization: z
      .string({ required_error: "Specialization is required" })
      .trim()
      .min(2, "Specialization must be at least 2 characters"),
    hospital: z
      .string({ required_error: "Hospital is required" })
      .trim()
      .min(2, "Hospital must be at least 2 characters"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(6, "Phone must be at least 6 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Please provide a valid email address")
  })
});

export const updateDoctorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Doctor ID format")
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      specialization: z.string().trim().min(2).optional(),
      hospital: z.string().trim().min(2).optional(),
      phone: z.string().trim().min(6).optional(),
      email: z.string().trim().email().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update"
    })
});

export const doctorQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    specialization: z.string().trim().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(["name", "createdAt", "patientCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
});

