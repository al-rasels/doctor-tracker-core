import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/login", authRateLimiter, validateRequest(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", authenticate, AuthController.logout);

export default router;
