import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export const validateRequest = (schema) => {
  return async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join(".").replace(/^(body|query|params)\./, ""),
          message: err.message
        }));

        return next(AppError.badRequest("Validation failed", formattedErrors));
      }
      next(error);
    }
  };
};

