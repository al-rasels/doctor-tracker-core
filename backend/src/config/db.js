import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";

// Ensure Node's DNS resolver can resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Gracefully fallback to system default if restricted
}

export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB connected successfully to database: ${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB runtime connection error:", err);
});

