import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
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
  .get(validateRequest(patientQuerySchema), patientController.getPatients)
  .post(validateRequest(createPatientSchema), patientController.createPatient);

router
  .route("/:id")
  .get(validateRequest(patientIdParamSchema), patientController.getPatientById)
  .put(validateRequest(updatePatientSchema), patientController.updatePatient)
  .delete(validateRequest(patientIdParamSchema), patientController.deletePatient);

export default router;

