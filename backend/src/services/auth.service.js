import jwt from "jsonwebtoken";
import { User as DefaultUser } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

/**
 * Creates a signed JWT for the authenticated user.
 * @param {Object} user - User document
 * @returns {string} Signed JWT Bearer token
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Formats user entity to omit sensitive fields.
 * @param {Object} user
 * @returns {Object} Safe public user profile
 */
const formatUserProfile = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  lastLogin: user.lastLogin
});

/**
 * Authenticates user credentials and returns a session JWT.
 * Receives UserModel as an injected parameter from the controller.
 *
 * @param {Object} UserModel - Injected Mongoose User model
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{ token: string, user: Object }>}
 */
export const login = async (UserModel = DefaultUser, { email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select hashed password
  const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw AppError.forbidden("This account has been deactivated. Please contact support.");
  }

  // Verify bcrypt hash
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  // Update last active timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate bearer token
  const token = generateAuthToken(user);

  return {
    token,
    user: formatUserProfile(user)
  };
};

/**
 * Retrieves the current authenticated user's profile.
 * Receives UserModel as an injected parameter from the controller.
 *
 * @param {Object} UserModel - Injected Mongoose User model
 * @param {string} userId - User ObjectId
 * @returns {Promise<Object>} Safe profile data
 */
export const getMe = async (UserModel = DefaultUser, userId) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) {
    throw AppError.notFound("User not found");
  }

  return formatUserProfile(user);
};

export const AuthService = {
  login,
  getMe
};
