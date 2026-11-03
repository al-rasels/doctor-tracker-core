import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/user.model.js";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw AppError.unauthorized("Authentication token is missing");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

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
