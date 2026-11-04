export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Functional error creators
export const createAppError = (message, statusCode = 500, details = null) =>
  new AppError(message, statusCode, details);

export const badRequest = (message, details = null) =>
  new AppError(message, 400, details);

export const unauthorized = (message = "Unauthorized access") =>
  new AppError(message, 401);

export const forbidden = (message = "Forbidden access") =>
  new AppError(message, 403);

export const notFound = (message = "Resource not found") =>
  new AppError(message, 404);

export const conflict = (message) =>
  new AppError(message, 409);

export const internal = (message = "Internal server error") =>
  new AppError(message, 500);

// Attach helper functions to AppError for flexible usage
AppError.badRequest = badRequest;
AppError.unauthorized = unauthorized;
AppError.forbidden = forbidden;
AppError.notFound = notFound;
AppError.conflict = conflict;
AppError.internal = internal;

