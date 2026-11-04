import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
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
  .get(validateRequest(doctorQuerySchema), doctorController.getDoctors)
  .post(validateRequest(createDoctorSchema), doctorController.createDoctor);

router
  .route("/:id")
  .get(validateRequest(doctorIdParamSchema), doctorController.getDoctorById)
  .put(validateRequest(updateDoctorSchema), doctorController.updateDoctor)
  .delete(validateRequest(doctorIdParamSchema), doctorController.deleteDoctor);

// Nested Doctor-Patient endpoints
router
  .route("/:id/patients")
  .get(validateRequest(doctorIdParamSchema), doctorController.getDoctorPatients)
  .post(validateRequest(createDoctorPatientSchema), doctorController.addPatientToDoctor);

router
  .route("/:id/patients/:patientId")
  .delete(validateRequest(doctorPatientParamsSchema), doctorController.removePatientFromDoctor);

export default router;

