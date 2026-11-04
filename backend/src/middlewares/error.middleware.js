import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export const globalErrorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected internal server error occurred";
  let details = err.details;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : "";
    message = `Duplicate value '${duplicatedValue}' for field '${duplicatedField}'. A record with this value already exists.`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  if (env.NODE_ENV === "development" && !(err instanceof AppError)) {
    console.error("💥 Unhandled Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, _res, next) => {
  next(AppError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`));
};

