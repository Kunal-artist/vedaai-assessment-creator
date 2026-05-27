import { Queue } from "bullmq";
import { redis } from "../config/redis.js";
export const generationQueue = new Queue("generation", { connection: redis });
