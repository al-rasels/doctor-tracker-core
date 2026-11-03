import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [120, "Name cannot exceed 120 characters"]
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      index: true
    },
    hospital: {
      type: String,
      required: [true, "Hospital is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    patientCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound and search indexes
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index(
  { name: "text", specialization: "text", hospital: "text" },
  { weights: { name: 5, specialization: 3, hospital: 2 }, name: "doctor_text_search" }
);

export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);
