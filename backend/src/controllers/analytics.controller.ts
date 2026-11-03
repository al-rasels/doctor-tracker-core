import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  static getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const timeframe = (req.query.timeframe as string) || "30d";
    const data = await AnalyticsService.getDashboardMetrics(timeframe);
    return ApiResponse.success(res, data, "Dashboard analytics retrieved successfully", 200);
  });
}
