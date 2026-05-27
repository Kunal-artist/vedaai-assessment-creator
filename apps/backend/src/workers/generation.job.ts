import { Assignment } from "../models/assignment.model.js";
import { buildPrompt } from "../utils/prompt.js";
import { generateQuestionPaper } from "../services/ai.service.js";
import { emitAssignmentUpdate } from "../sockets/index.js";

export const runGenerationJob = async (assignmentId: string) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return;

  try {
    assignment.status = "processing";
    await assignment.save();
    emitAssignmentUpdate(String(assignment._id), { status: "processing" });

    const prompt = buildPrompt({
      title: assignment.title,
      subject: (assignment as any).subject,
      className: (assignment as any).className,
      dueDate: assignment.dueDate.toISOString(),
      instructions: assignment.instructions,
      sourceText: assignment.sourceText,
      questionTypes: assignment.questionTypes,
    });

    let sections;
    let retries = 5;
    let delay = 10000; // start with 10s delay to handle 15 RPM limits better
    while (retries > 0) {
      try {
        sections = await generateQuestionPaper(prompt);
        break;
      } catch (e: any) {
        if (e?.status === 429 && retries > 1) {
          console.warn(`⚠️ Rate limited (429). Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          retries--;
          delay *= 1.5; // 10s, 15s, 22.5s, 33s
        } else {
          throw e;
        }
      }
    }
    assignment.result = { sections };
    assignment.status = "done";
    await assignment.save();

    emitAssignmentUpdate(String(assignment._id), {
      status: "done",
      result: assignment.result,
    });
  } catch (err) {
    console.error("Generation job error:", err);
    assignment.status = "failed";
    await assignment.save();
    emitAssignmentUpdate(String(assignment._id), { status: "failed" });
  }
};
