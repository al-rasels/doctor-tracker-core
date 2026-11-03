import { Router } from "express";
import { PatientController } from "../controllers/patient.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
  patientIdParamSchema
} from "../validations/patient.validation.js";

const router = Router();

// Protect all patient routes
router.use(authenticate);

router
  .route("/")
  .get(validateRequest(patientQuerySchema), PatientController.getPatients)
  .post(validateRequest(createPatientSchema), PatientController.createPatient);

router
  .route("/:id")
  .get(validateRequest(patientIdParamSchema), PatientController.getPatientById)
  .put(validateRequest(updatePatientSchema), PatientController.updatePatient)
  .delete(validateRequest(patientIdParamSchema), PatientController.deletePatient);

export default router;
