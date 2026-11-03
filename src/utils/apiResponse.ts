import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Request successful",
    statusCode = 200,
    meta?: PaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      ...(meta && { meta })
    });
  }

  static error(
    res: Response,
    message = "An error occurred",
    statusCode = 500,
    details?: unknown
  ): Response {
    const errorBody: Record<string, unknown> = { message };
    if (details !== undefined) {
      errorBody.details = details;
    }

    return res.status(statusCode).json({
      success: false,
      statusCode,
      error: errorBody
    });
  }
}
