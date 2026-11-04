import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all analytics endpoints
router.use(authenticate);

router.get("/dashboard", analyticsController.getDashboardAnalytics);

export default router;

