import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
  doctorIdParamSchema
} from "../validations/doctor.validation.js";
import {
  createDoctorPatientSchema,
  doctorPatientParamsSchema
} from "../validations/patient.validation.js";

const router = Router();

// Protect all doctor routes
router.use(authenticate);

router
  .route("/")
  .get(validateRequest(doctorQuerySchema), DoctorController.getDoctors)
  .post(validateRequest(createDoctorSchema), DoctorController.createDoctor);

router
  .route("/:id")
  .get(validateRequest(doctorIdParamSchema), DoctorController.getDoctorById)
  .put(validateRequest(updateDoctorSchema), DoctorController.updateDoctor)
  .delete(validateRequest(doctorIdParamSchema), DoctorController.deleteDoctor);

// Nested Doctor-Patient endpoints
router
  .route("/:id/patients")
  .get(validateRequest(doctorIdParamSchema), DoctorController.getDoctorPatients)
  .post(validateRequest(createDoctorPatientSchema), DoctorController.addPatientToDoctor);

router
  .route("/:id/patients/:patientId")
  .delete(validateRequest(doctorPatientParamsSchema), DoctorController.removePatientFromDoctor);

export default router;
