import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Patient, PatientStatus, Gender } from "../models/patient.model.js";

const doctorsData = [
  {
    name: "Dr. Sarah Mitchell",
    specialization: "Cardiology",
    hospital: "Central Heart & Vascular Institute",
    phone: "+880 1711 112233",
    email: "dr.sarah.mitchell@careguide.com"
  },
  {
    name: "Dr. Farhan Ahmed",
    specialization: "Neurology",
    hospital: "City Neuro Science Hospital",
    phone: "+880 1812 223344",
    email: "dr.farhan.ahmed@careguide.com"
  },
  {
    name: "Dr. Rebecca Lin",
    specialization: "Pediatrics",
    hospital: "Metropolitan Children's Hospital",
    phone: "+880 1913 334455",
    email: "dr.rebecca.lin@careguide.com"
  },
  {
    name: "Dr. Tariqul Islam",
    specialization: "Orthopedics",
    hospital: "Apex Orthopedic & Trauma Center",
    phone: "+880 1614 445566",
    email: "dr.tariqul.islam@careguide.com"
  },
  {
    name: "Dr. Ananya Roy",
    specialization: "Oncology",
    hospital: "National Cancer Care Center",
    phone: "+880 1515 556677",
    email: "dr.ananya.roy@careguide.com"
  },
  {
    name: "Dr. Marcus Vance",
    specialization: "General Surgery",
    hospital: "United Healthcare Complex",
    phone: "+880 1716 667788",
    email: "dr.marcus.vance@careguide.com"
  },
  {
    name: "Dr. Nusrat Parvin",
    specialization: "Dermatology",
    hospital: "Skin & Laser Medical Clinic",
    phone: "+880 1817 778899",
    email: "dr.nusrat.parvin@careguide.com"
  },
  {
    name: "Dr. David Kim",
    specialization: "Endocrinology",
    hospital: "Care Guide Metabolic Hospital",
    phone: "+880 1918 889900",
    email: "dr.david.kim@careguide.com"
  }
];

const patientNames = [
  { name: "Kamal Hossain", gender: "male" as Gender, age: 52 },
  { name: "Fatima Begum", gender: "female" as Gender, age: 41 },
  { name: "Sabbir Rahman", gender: "male" as Gender, age: 29 },
  { name: "Ayesha Siddiqua", gender: "female" as Gender, age: 34 },
  { name: "Tanvir Hasan", gender: "male" as Gender, age: 63 },
  { name: "Nusrat Jahan", gender: "female" as Gender, age: 26 },
  { name: "Mahmudul Haque", gender: "male" as Gender, age: 47 },
  { name: "Shireen Akhter", gender: "female" as Gender, age: 38 },
  { name: "Arif Chowdhury", gender: "male" as Gender, age: 58 },
  { name: "Mehnaz Kabir", gender: "female" as Gender, age: 22 },
  { name: "Zubair Al Mamun", gender: "male" as Gender, age: 31 },
  { name: "Rokeya Sultana", gender: "female" as Gender, age: 67 },
  { name: "Imran Hossain", gender: "male" as Gender, age: 45 },
  { name: "Sadia Afrin", gender: "female" as Gender, age: 33 },
  { name: "Nazmul Huda", gender: "male" as Gender, age: 55 },
  { name: "Samira Khan", gender: "female" as Gender, age: 28 },
  { name: "Shahidul Alam", gender: "male" as Gender, age: 61 },
  { name: "Nasreen Akter", gender: "female" as Gender, age: 50 },
  { name: "Babar Azam", gender: "male" as Gender, age: 37 },
  { name: "Farhana Islam", gender: "female" as Gender, age: 43 }
];

const conditionsBySpecialty: Record<string, string[]> = {
  Cardiology: ["Hypertension", "Angina Pectoris", "Arrhythmia", "Coronary Artery Disease"],
  Neurology: ["Migraine with Aura", "Epilepsy", "Peripheral Neuropathy", "Multiple Sclerosis"],
  Pediatrics: ["Acute Bronchiolitis", "Asthma Flare", "Viral Gastroenteritis", "Febrile Seizure"],
  Orthopedics: ["Lumbar Disc Herniation", "Knee Osteoarthritis", "Rotator Cuff Tear", "Ankle Fracture"],
  Oncology: ["Lymphoma Stage II", "Breast Neoplasm Evaluation", "Colorectal Screening", "Chemotherapy Follow-up"],
  "General Surgery": ["Acute Appendicitis", "Cholecystitis", "Inguinal Hernia", "Post-Op Wound Care"],
  Dermatology: ["Severe Psoriasis", "Atopic Eczema", "Cystic Acne", "Contact Dermatitis"],
  Endocrinology: ["Type 2 Diabetes Mellitus", "Hypothyroidism", "Metabolic Syndrome", "Adrenal Fatigue"]
};

const statuses: PatientStatus[] = ["admitted", "under_observation", "recovered", "discharged"];

async function seed() {
  console.log("🌱 Starting Doctor Tracker Database Seeding...");
  await connectDatabase();

  // Clear existing collections
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  console.log("🧹 Cleaned existing users, doctors, and patients.");

  // 1. Seed Admin User
  const adminUser = await User.create({
    name: "Care Guide Admin",
    email: "admin@careguide.com",
    password: "Admin123456!",
    role: "admin",
    isActive: true
  });
  console.log(`👤 Admin created: ${adminUser.email} (Password: Admin123456!)`);

  // 2. Seed Doctors
  const createdDoctors = await Doctor.insertMany(doctorsData);
  console.log(`👨‍⚕️ Inserted ${createdDoctors.length} doctors.`);

  // 3. Seed Patients and bind to Doctors
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  let patientIndex = 0;
  for (const doc of createdDoctors) {
    // Assign 2 to 4 patients per doctor
    const countForDoc = 2 + (patientIndex % 3);
    for (let i = 0; i < countForDoc; i++) {
      const patientMeta = patientNames[patientIndex % patientNames.length];
      const conditionList = conditionsBySpecialty[doc.specialization] || ["General Health Examination"];
      const condition = conditionList[i % conditionList.length];
      const status = statuses[(patientIndex + i) % statuses.length];

      // Spread dates over the last 20 days
      const daysAgo = (patientIndex * 3 + i * 2) % 20;
      const admissionDate = new Date(now - daysAgo * DAY_MS);

      await Patient.create({
        doctorId: doc._id,
        name: patientMeta.name,
        age: patientMeta.age,
        gender: patientMeta.gender,
        phone: `+880 1700 ${100000 + patientIndex * 37}`,
        condition,
        status,
        admissionDate
      });

      patientIndex++;
    }

    // Update doctor's patientCount
    await Doctor.findByIdAndUpdate(doc._id, { patientCount: countForDoc });
  }

  console.log(`🏥 Seeded ${patientIndex} patients assigned across doctors.`);
  console.log("🎉 Database seeding completed successfully!");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
