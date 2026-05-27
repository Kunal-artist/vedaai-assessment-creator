import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { Assignment } from "../models/assignment.model.js";
import { buildPrompt } from "../utils/prompt.js";
import { generateQuestionPaper } from "../services/ai.service.js";
import { emitAssignmentUpdate } from "../sockets/index.js";
export const startGenerationWorker = () => new Worker("generation", async (job) => {
    const assignment = await Assignment.findById(job.data.assignmentId);
    if (!assignment)
        return;
    try {
        assignment.status = "processing";
        await assignment.save();
        emitAssignmentUpdate(String(assignment._id), { status: "processing" });
        const prompt = buildPrompt({
            title: assignment.title,
            subject: assignment.subject,
            className: assignment.className,
            dueDate: assignment.dueDate.toISOString(),
            instructions: assignment.instructions,
            sourceText: assignment.sourceText,
            questionTypes: assignment.questionTypes,
        });
        const sections = await generateQuestionPaper(prompt);
        assignment.result = { sections };
        assignment.status = "done";
        await assignment.save();
        emitAssignmentUpdate(String(assignment._id), {
            status: "done",
            result: assignment.result,
        });
    }
    catch (err) {
        console.error("Generation worker error:", err);
        assignment.status = "failed";
        await assignment.save();
        emitAssignmentUpdate(String(assignment._id), { status: "failed" });
    }
}, { connection: redis });
