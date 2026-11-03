import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { LoginInput } from "../validations/auth.validation.js";

export class AuthService {
  static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw AppError.forbidden("This account has been deactivated. Please contact support.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as any
      }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw AppError.notFound("User not found");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin
    };
  }
}
