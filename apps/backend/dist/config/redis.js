// @ts-ignore - ioredis CJS interop under NodeNext module resolution
import IORedis from "ioredis";
import { env } from "./env.js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RedisClass = IORedis.default ?? IORedis;
export const redis = new RedisClass(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
        if (times > 3) {
            console.error("❌ Redis connection failed after 3 retries. Is Redis running?");
            return null; // stop retrying
        }
        return Math.min(times * 100, 3000);
    },
});
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.warn("⚠️  Redis error:", err.message));
