import { Request, Response } from "express";
import { z } from "zod";
import { Assignment } from "../models/assignment.model.js";
import { enqueueGenerationJob } from "../queues/generation.queue.js";

const schema = z.object({
  title: z.string().min(1),
  subject: z.string().optional(),
  className: z.string().optional(),
  dueDate: z.string().min(1),
  instructions: z.string().optional(),
  sourceText: z.string().optional(),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().min(1),
        marks: z.number().int().min(1),
      })
    )
    .min(1),
});

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const payload = schema.parse(req.body);
    const assignment = await Assignment.create({ ...payload, status: "queued" });
    await enqueueGenerationJob(String(assignment._id));
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Bad request" });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Not found" });
  res.json(assignment);
};

export const listAssignments = async (_req: Request, res: Response) => {
  const data = await Assignment.find().sort({ createdAt: -1 }).limit(50);
  res.json(data);
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};

export const regenerateAssignment = async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Not found" });

  assignment.status = "queued";
  assignment.regeneratedAt = new Date();
  await assignment.save();

  await enqueueGenerationJob(String(assignment._id));
  res.json({ ok: true });
};