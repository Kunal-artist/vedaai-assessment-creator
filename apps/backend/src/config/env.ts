import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5001"),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
