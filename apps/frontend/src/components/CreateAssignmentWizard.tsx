"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Upload,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { api } from "../lib/api";
import { Assignment } from "../types";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False Questions",
  "Fill in the Blanks",
  "Match the Following",
];

interface Props {
  onCreated: (assignment: Assignment) => void;
  onCancel: () => void;
}

export default function CreateAssignmentWizard({ onCreated, onCancel }: Props) {
  const {
    form,
    setForm,
    addQuestionType,
    updateQuestionType,
    removeQuestionType,
    resetForm,
  } = useAssignmentStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totals = {
    q: form.questionTypes.reduce((s, q) => s + q.count, 0),
    m: form.questionTypes.reduce((s, q) => s + q.count * q.marks, 0),
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm("sourceText", (e.target?.result as string) ?? "");
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const validateStep1 = () => {
    if (!form.title.trim()) return "Please enter a title for the assignment.";
    if (!form.dueDate) return "Please select a due date.";
    return null;
  };

  const validateStep2 = () => {
    if (form.questionTypes.length === 0) return "Add at least one question type.";
    const invalid = form.questionTypes.find((q) => !q.type || q.count < 1 || q.marks < 1);
    if (invalid) return "All question types must have a valid type, count ≥ 1, and marks ≥ 1.";
    return null;
  };

  const goNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  };

  const submit = async () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<Assignment>("/assignments", {
        title: form.title,
        subject: form.subject,
        className: form.className,
        dueDate: form.dueDate,
        sourceText: form.sourceText,
        instructions: form.instructions,
        questionTypes: form.questionTypes,
      });
      resetForm();
      onCreated(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="wizard-header">
        <h2 className="wizard-title">Create Assignment</h2>
        <p className="wizard-subtitle">Set up a new assignment for your students</p>
      </div>

      {/* Stepper */}
      <div className="wizard-stepper">
        <div className={`step-dot ${step === 1 ? "active" : "done"}`}>
          {step > 1 ? <Check size={14} /> : "1"}
        </div>
        <div className={`step-line ${step > 1 ? "done" : ""}`} />
        <div className={`step-dot ${step === 2 ? "active" : step > 2 ? "done" : "inactive"}`}>
          2
        </div>
      </div>

      <div className="wizard-card">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <h3 className="wizard-section-title">Assignment Details</h3>
            <p className="wizard-section-sub">Basic information about your assignment</p>

            {/* File Upload */}
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              id="upload-zone"
            >
              <Upload size={32} className="upload-icon" />
              <p className="upload-text">Choose a file or drag &amp; drop it here</p>
              <p className="upload-hint">PNG, JPEG, PDF, upto 10MB</p>
              <span className="upload-btn">
                <Upload size={13} />
                Browse Files
              </span>
              {fileName && <p className="upload-filename">📎 {fileName}</p>}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={handleFileInput}
                id="file-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="title-input">Assignment Title *</label>
                <input
                  id="title-input"
                  className="form-input"
                  placeholder="e.g. Quiz on Electricity"
                  value={form.title}
                  onChange={(e) => setForm("title", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="due-date-input">Due Date *</label>
                <input
                  id="due-date-input"
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  onChange={(e) => setForm("dueDate", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="subject-input">Subject</label>
                <input
                  id="subject-input"
                  className="form-input"
                  placeholder="e.g. Science, Mathematics"
                  value={form.subject}
                  onChange={(e) => setForm("subject", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="class-input">Class / Grade</label>
                <input
                  id="class-input"
                  className="form-input"
                  placeholder="e.g. Class 9, Grade 10"
                  value={form.className}
                  onChange={(e) => setForm("className", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <h3 className="wizard-section-title">Question Type</h3>
            <p className="wizard-section-sub">Configure question types, counts, and marks</p>

            <div className="qt-list" id="question-types-list">
              {form.questionTypes.map((q, idx) => (
                <div key={idx} className="qt-row">
                  <select
                    className="qt-select"
                    value={q.type}
                    onChange={(e) => updateQuestionType(idx, "type", e.target.value)}
                    id={`qt-type-${idx}`}
                  >
                    {QUESTION_TYPE_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>

                  {/* Questions counter */}
                  <div className="qt-counter">
                    <span className="qt-counter-label">Qs</span>
                    <button
                      className="qt-counter-btn"
                      onClick={() => updateQuestionType(idx, "count", Math.max(1, q.count - 1))}
                      id={`qt-count-dec-${idx}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qt-counter-val">{q.count}</span>
                    <button
                      className="qt-counter-btn"
                      onClick={() => updateQuestionType(idx, "count", q.count + 1)}
                      id={`qt-count-inc-${idx}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Marks counter */}
                  <div className="qt-counter">
                    <span className="qt-counter-label">Marks</span>
                    <button
                      className="qt-counter-btn"
                      onClick={() => updateQuestionType(idx, "marks", Math.max(1, q.marks - 1))}
                      id={`qt-marks-dec-${idx}`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qt-counter-val">{q.marks}</span>
                    <button
                      className="qt-counter-btn"
                      onClick={() => updateQuestionType(idx, "marks", q.marks + 1)}
                      id={`qt-marks-inc-${idx}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    className="qt-remove-btn"
                    onClick={() => removeQuestionType(idx)}
                    id={`qt-remove-${idx}`}
                    aria-label="Remove question type"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button className="add-qt-btn" onClick={addQuestionType} id="add-qt-btn">
              <Plus size={14} />
              Add Question Type
            </button>

            <p className="qt-totals">
              Total Questions: <span>{totals.q}</span> &nbsp;|&nbsp; Total Marks: <span>{totals.m}</span>
            </p>

            {/* Additional instructions */}
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label" htmlFor="instructions-input">
                Additional Information (For better output)
              </label>
              <textarea
                id="instructions-input"
                className="form-input form-textarea"
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                value={form.instructions}
                onChange={(e) => setForm("instructions", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12, fontWeight: 500 }}>
            ⚠ {error}
          </p>
        )}

        {/* Navigation */}
        <div className="wizard-nav">
          <button
            className="btn-secondary"
            onClick={step === 1 ? onCancel : () => { setError(null); setStep(1); }}
            id="wizard-back-btn"
          >
            <ChevronLeft size={16} />
            {step === 1 ? "Cancel" : "Previous"}
          </button>

          {step === 1 ? (
            <button className="btn-primary" onClick={goNext} id="wizard-next-btn">
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-brand"
              onClick={submit}
              disabled={submitting}
              id="wizard-generate-btn"
            >
              {submitting ? (
                <>
                  <span className="generating-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate with AI
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
