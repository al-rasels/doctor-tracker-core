import mongoose from "mongoose";

const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Attending Doctor ID is required"],
      index: true
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [120, "Name cannot exceed 120 characters"]
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [130, "Age cannot exceed 130"]
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    condition: {
      type: String,
      required: [true, "Diagnostic condition is required"],
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ["admitted", "under_observation", "recovered", "discharged"],
      default: "admitted",
      index: true
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound and search indexes for query optimization
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ status: 1, admissionDate: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });
patientSchema.index({ admissionDate: -1 });
patientSchema.index(
  { name: "text", phone: "text", condition: "text" },
  { weights: { name: 5, condition: 3, phone: 2 }, name: "patient_text_search" }
);

export const Patient = mongoose.model("Patient", patientSchema);

