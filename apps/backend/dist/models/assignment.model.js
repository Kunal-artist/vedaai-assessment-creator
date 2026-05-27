import { Schema, model } from "mongoose";
const questionTypeSchema = new Schema({
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
}, { _id: false });
const assignmentSchema = new Schema({
    title: { type: String, required: true },
    subject: { type: String, default: "" },
    className: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    instructions: { type: String, default: "" },
    sourceText: { type: String, default: "" },
    questionTypes: { type: [questionTypeSchema], required: true },
    status: {
        type: String,
        enum: ["queued", "processing", "done", "failed"],
        default: "queued",
    },
    result: { type: Object },
    regeneratedAt: { type: Date },
}, { timestamps: true });
export const Assignment = model("Assignment", assignmentSchema);
