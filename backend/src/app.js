import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { allowedOrigins, env } from "./config/env.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import apiRouter from "./routes/index.js";

const app = express();

// Security HTTP headers with cross-origin resource policy enabled
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

/**
 * Checks if the request origin is permitted by CORS policies.
 * Dynamically allows configured CLIENT_URL origins, Netlify production & deploy preview domains,
 * and local development hosts.
 */
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, curl, server-to-server)
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return true;

  // Automatically allow Netlify domains (*.netlify.app)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)?netlify\.app$/.test(origin)) return true;

  // Automatically allow local development ports
  if (/^http:\/\/localhost:[0-9]+$/.test(origin) || /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Gracefully reject without throwing an unhandled 500 error
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};

// Enable CORS with preflight support across all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP Request logging
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Global API rate limiter
app.use("/api", apiRateLimiter);

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Doctor Tracker Core API",
    version: "1.0.0",
    status: "online",
    paradigm: "functional-programming",
    docs: "/api/health"
  });
});

// Mount API routes
app.use("/api", apiRouter);

// 404 Not Found Middleware
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
