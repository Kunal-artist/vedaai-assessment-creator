"use client";

import { useState, useRef, ChangeEvent, useMemo, useCallback } from "react";
import {
  Upload,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Mic,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { api } from "../lib/api";
import { Assignment } from "../types";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
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
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Reactive totals ──────────────────────────────────────── */
  const totals = useMemo(
    () => ({
      q: form.questionTypes.reduce((s, q) => s + q.count, 0),
      m: form.questionTypes.reduce((s, q) => s + q.count * q.marks, 0),
    }),
    [form.questionTypes]
  );

  /* ── File handling ────────────────────────────────────────── */
  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const isText = file.type === "text/plain" || file.name.endsWith(".txt");

    if (isText) {
      // Plain text: read as text and store in sourceText
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm("sourceText", (e.target?.result as string) ?? "");
        setSourceBase64(null);
        setSourceMimeType(null);
      };
      reader.readAsText(file);
    } else {
      // Images (PNG/JPG/JPEG) or PDFs: read as base64 and send to Gemini vision
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // dataUrl is like "data:image/png;base64,XXXX" – strip the prefix
        const base64 = dataUrl.split(",")[1] ?? "";
        setSourceBase64(base64);
        setSourceMimeType(file.type || "application/octet-stream");
        setForm("sourceText", ""); // clear plain text
      };
      reader.readAsDataURL(file);
    }
  }, [setForm]);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  /* ── Validation ───────────────────────────────────────────── */
  const validateStep1 = () => {
    if (!form.dueDate) return "Please select a due date.";
    if (form.questionTypes.length === 0) return "Add at least one question type.";
    const invalid = form.questionTypes.find(
      (q) => !q.type || q.count < 1 || q.marks < 1
    );
    if (invalid)
      return "All question types must have a valid type, count ≥ 1, and marks ≥ 1.";
    return null;
  };

  const goNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  /* ── Submit ───────────────────────────────────────────────── */
  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<Assignment>("/assignments", {
        title: form.title || "Untitled Assignment",
        subject: form.subject,
        className: form.className,
        dueDate: form.dueDate,
        sourceText: form.sourceText,
        instructions: form.instructions,
        questionTypes: form.questionTypes,
        // Include base64 file data when an image or PDF was uploaded
        ...(sourceBase64 ? { sourceBase64, sourceMimeType } : {}),
      });
      resetForm();
      setSourceBase64(null);
      setSourceMimeType(null);
      setFileName(null);
      onCreated(res.data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Failed to create assignment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Counter Component ────────────────────────────────────── */
  const Counter = ({
    label,
    value,
    onDec,
    onInc,
    decId,
    incId,
  }: {
    label: string;
    value: number;
    onDec: () => void;
    onInc: () => void;
    decId: string;
    incId: string;
  }) => (
    <div className="qt-counter-group">
      <span className="qt-counter-header">{label}</span>
      <div className="qt-counter">
        <button className="qt-counter-btn" onClick={onDec} id={decId}>
          <Minus size={12} />
        </button>
        <span className="qt-counter-val">{value}</span>
        <button className="qt-counter-btn" onClick={onInc} id={incId}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="wizard-wrapper fade-in">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="wizard-header">
        <button className="wizard-back-btn mobile-only" onClick={onCancel} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className="wizard-header-dot desktop-only" />
        <div className="wizard-header-text">
          <h2 className="wizard-title">Create Assignment</h2>
          <p className="wizard-subtitle desktop-only">
            Set up a new assignment for your students
          </p>
        </div>
        <div className="wizard-header-right mobile-only" />
      </div>

      {/* ── Progress Bar ────────────────────────────────── */}
      <div className="wizard-progress">
        <div
          className="wizard-progress-fill"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      {/* ── Form Card ───────────────────────────────────── */}
      <div className="wizard-card">
        {/* ── Step 1: Assignment Configuration ─────────── */}
        {step === 1 && (
          <>
            <h3 className="wizard-section-title">Assignment Details</h3>
            <p className="wizard-section-sub">
              Basic information about your assignment
            </p>

            {/* Upload Zone */}
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              id="upload-zone"
            >
              <Upload size={28} className="upload-icon" />
              <p className="upload-text">
                Choose a file or drag &amp; drop it here
              </p>
              <p className="upload-hint">TXT, PDF, JPEG, PNG — up to 10 MB</p>
              <span className="upload-btn">
                Browse Files
              </span>
              {fileName && (
                <p className="upload-filename">📎 {fileName}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                onChange={handleFileInput}
                id="file-input"
              />
            </div>

            <p className="upload-helper-text">
              Upload images of your preferred document/image
            </p>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="due-date-input">
                Due Date
              </label>
              <div className="form-input-wrapper">
                <input
                  id="due-date-input"
                  type="date"
                  className="form-input"
                  placeholder="DD-MM-YYYY"
                  value={form.dueDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Reset time to midnight
                      
                      if (selectedDate < today) {
                        alert("Due date cannot be set in the past. Please select a valid future date.");
                        setForm("dueDate", "");
                        return;
                      }
                    }
                    setForm("dueDate", value);
                  }}
                />
                <CalendarDays size={16} className="form-input-icon" />
              </div>
            </div>

            {/* Question Types */}
            <div className="qt-section">
              <div className="qt-section-header">
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Question Type
                </span>
              </div>

              <div className="qt-list" id="question-types-list">
                {form.questionTypes.map((q, idx) => (
                  <div key={idx} className="qt-row">
                    <div className="qt-row-top">
                      <select
                        className="qt-select"
                        value={q.type}
                        onChange={(e) =>
                          updateQuestionType(idx, "type", e.target.value)
                        }
                        id={`qt-type-${idx}`}
                      >
                        {QUESTION_TYPE_OPTIONS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>

                      <button
                        className="qt-remove-btn"
                        onClick={() => removeQuestionType(idx)}
                        id={`qt-remove-${idx}`}
                        aria-label="Remove question type"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="qt-row-counters">
                      <Counter
                        label="No. of Questions"
                        value={q.count}
                        onDec={() =>
                          updateQuestionType(
                            idx,
                            "count",
                            Math.max(1, q.count - 1)
                          )
                        }
                        onInc={() =>
                          updateQuestionType(idx, "count", q.count + 1)
                        }
                        decId={`qt-count-dec-${idx}`}
                        incId={`qt-count-inc-${idx}`}
                      />
                      <Counter
                        label="Marks"
                        value={q.marks}
                        onDec={() =>
                          updateQuestionType(
                            idx,
                            "marks",
                            Math.max(1, q.marks - 1)
                          )
                        }
                        onInc={() =>
                          updateQuestionType(idx, "marks", q.marks + 1)
                        }
                        decId={`qt-marks-dec-${idx}`}
                        incId={`qt-marks-inc-${idx}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="add-qt-btn"
                onClick={addQuestionType}
                id="add-qt-btn"
              >
                <div className="add-qt-icon">
                  <Plus size={14} />
                </div>
                Add Question Type
              </button>

              <div className="qt-totals">
                <span>
                  Total Questions : <strong>{totals.q}</strong>
                </span>
                <span>
                  Total Marks : <strong>{totals.m}</strong>
                </span>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label" htmlFor="instructions-input">
                Additional Information (For better output)
              </label>
              <div className="form-textarea-wrapper">
                <textarea
                  id="instructions-input"
                  className="form-input form-textarea"
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  value={form.instructions}
                  onChange={(e) =>
                    setForm("instructions", e.target.value)
                  }
                />
                <button
                  className="textarea-mic-btn"
                  type="button"
                  aria-label="Voice input"
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Review & Generate ──────────────────── */}
        {step === 2 && (
          <>
            <h3 className="wizard-section-title">Review & Generate</h3>
            <p className="wizard-section-sub">
              Review your configuration before generating
            </p>

            <div className="review-card">
              <div className="review-row">
                <span className="review-label">Due Date</span>
                <span className="review-value">{form.dueDate || "—"}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Question Types</span>
                <span className="review-value">
                  {form.questionTypes.length} types
                </span>
              </div>
              <div className="review-row">
                <span className="review-label">Total Questions</span>
                <span className="review-value">{totals.q}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Total Marks</span>
                <span className="review-value">{totals.m}</span>
              </div>
              {form.sourceText && (
                <div className="review-row">
                  <span className="review-label">Source File</span>
                  <span className="review-value">
                    {fileName || "Uploaded"}
                  </span>
                </div>
              )}
              {form.instructions && (
                <div className="review-row">
                  <span className="review-label">Instructions</span>
                  <span className="review-value review-instructions">
                    {form.instructions}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <p className="wizard-error">⚠ {error}</p>
        )}
      </div>

      {/* ── Bottom Navigation ───────────────────────────── */}
      <div className="wizard-nav">
        <button
          className="btn-secondary"
          onClick={
            step === 1
              ? onCancel
              : () => {
                  setError(null);
                  setStep(1);
                }
          }
          id="wizard-back-btn"
        >
          <ChevronLeft size={16} />
          {step === 1 ? "Previous" : "Previous"}
        </button>

        {step === 1 ? (
          <button
            className="btn-primary"
            onClick={goNext}
            id="wizard-next-btn"
          >
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
                <span
                  className="generating-spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />
                Generating...
              </>
            ) : (
              <>✨ Generate with AI</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
