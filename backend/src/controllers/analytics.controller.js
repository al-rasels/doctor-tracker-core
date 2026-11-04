import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as analyticsService from "../services/analytics.service.js";

/**
 * Get comprehensive dashboard analytics (KPIs, workloads, timelines, conditions).
 * Models { Doctor, Patient } are passed as parameters into the service.
 * GET /api/analytics/dashboard
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "30d";
  const data = await analyticsService.getDashboardMetrics({ Doctor, Patient }, timeframe);
  return sendSuccess(res, data, "Dashboard analytics retrieved successfully", 200);
});

export const AnalyticsController = {
  getDashboardAnalytics
};
