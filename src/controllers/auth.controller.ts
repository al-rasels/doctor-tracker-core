import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, "Login successful", 200);
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.getMe(req.user!.id);
    return ApiResponse.success(res, result, "Profile retrieved", 200);
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, { loggedOut: true }, "Logged out successfully", 200);
  });
}
