import mongoose from "mongoose";
import { env } from "./env.js";
export const connectDb = async () => mongoose.connect(env.MONGODB_URI);
