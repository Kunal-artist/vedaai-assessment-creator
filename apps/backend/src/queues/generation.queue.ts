import { runGenerationJob } from "../workers/generation.job.js";

// Force in-process processing since Redis is unstable on this Windows dev environment
export const initQueue = async (_redisUrl: string) => {
  console.log("ℹ️  Running with in-process queue (Redis/BullMQ bypassed)");
};

export const enqueueGenerationJob = async (assignmentId: string) => {
  console.log(`[Queue] Enqueueing assignment ${assignmentId} for in-process generation`);
  // Fire-and-forget in-process
  setImmediate(() => runGenerationJob(assignmentId));
};
