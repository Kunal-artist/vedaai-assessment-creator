import { Router } from "express";
import {
  createAssignment,
  getAssignment,
  listAssignments,
  deleteAssignment,
  regenerateAssignment,
  updateAssignment,
} from "../controllers/assignment.controller.js";

export const assignmentRouter = Router();

assignmentRouter.get("/", listAssignments);
assignmentRouter.post("/", createAssignment);
assignmentRouter.get("/:id", getAssignment);
assignmentRouter.patch("/:id", updateAssignment);
assignmentRouter.delete("/:id", deleteAssignment);
assignmentRouter.post("/:id/regenerate", regenerateAssignment);