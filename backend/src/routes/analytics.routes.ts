import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all analytics endpoints
router.use(authenticate);

router.get("/dashboard", AnalyticsController.getDashboardAnalytics);

export default router;
