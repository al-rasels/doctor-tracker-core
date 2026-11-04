import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

export default router;

