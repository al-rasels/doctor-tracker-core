import http from "http";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import mongoose from "mongoose";

const server = http.createServer(app);

async function startServer() {
  await connectDatabase();

  server.listen(env.PORT, () => {
    console.log(`🚀 Doctor Tracker Core API running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`📡 Local endpoint: http://localhost:${env.PORT}/api/health`);
  });
}

function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔒 HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      console.log("🔌 MongoDB connection closed gracefully.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });

  // Force close if graceful shutdown exceeds 10s
  setTimeout(() => {
    console.error("⚠️ Forced shutdown timeout exceeded. Exiting immediately.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

process.on("unhandledRejection", (reason: any) => {
  console.error("💥 Unhandled Rejection at Promise:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error("💥 Uncaught Exception thrown:", error);
  process.exit(1);
});

startServer();
