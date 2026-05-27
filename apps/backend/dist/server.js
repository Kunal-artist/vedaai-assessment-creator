import express from "express";
import cors from "cors";
import { createServer } from "http";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { assignmentRouter } from "./routes/assignment.routes.js";
import { initSocket } from "./sockets/index.js";
import { startGenerationWorker } from "./workers/generation.worker.js";
const app = express();
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json({ limit: "5mb" }));
app.use("/api/assignments", assignmentRouter);
const server = createServer(app);
initSocket(server);
connectDb().then(() => {
    startGenerationWorker();
    server.listen(env.PORT, () => console.log(`backend on ${env.PORT}`));
});
