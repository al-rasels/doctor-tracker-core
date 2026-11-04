import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb://localhost:27017/doctor_tracker"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long").default("super_secret_jwt_key_doctor_tracker_2026_dev_mode_change_in_prod"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:3000,http://localhost:3001,https://doctor-tracker-rasel.netlify.app")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables configuration:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

export const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());
