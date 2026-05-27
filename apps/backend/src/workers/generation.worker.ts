import { Worker } from "bullmq";
import { runGenerationJob } from "./generation.job.js";

export const startGenerationWorker = (redisConn: any) =>
  new Worker(
    "generation",
    async (job) => {
      await runGenerationJob(job.data.assignmentId);
    },
    { connection: redisConn }
  );
