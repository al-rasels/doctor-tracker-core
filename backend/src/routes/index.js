import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";
import doctorRoutes from "./doctor.routes.js";
import patientRoutes from "./patient.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = Router();

// Health Check Endpoint
router.get("/health", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Mount module routes
router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/analytics", analyticsRoutes);

export default router;

