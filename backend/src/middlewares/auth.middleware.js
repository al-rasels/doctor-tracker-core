import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/user.model.js";

export const authenticate = async (req, _res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Authentication token is missing");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user || !user.isActive) {
      throw AppError.unauthorized("The user belonging to this token no longer exists or is inactive");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized("Invalid authentication token"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized("Authentication token has expired"));
    }
    next(error);
  }
};

