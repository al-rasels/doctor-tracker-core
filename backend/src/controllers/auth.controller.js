import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as authService from "../services/auth.service.js";

/**
 * Handle administrative login request.
 * Model 'User' is injected as a parameter into the service layer.
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(User, req.body);
  return sendSuccess(res, result, "Login successful", 200);
});

/**
 * Get current authenticated user profile.
 * Model 'User' is injected as a parameter into the service layer.
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(User, req.user.id);
  return sendSuccess(res, result, "Profile retrieved", 200);
});

/**
 * Log out current session.
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { loggedOut: true }, "Logged out successfully", 200);
});

export const AuthController = {
  login,
  getMe,
  logout
};
