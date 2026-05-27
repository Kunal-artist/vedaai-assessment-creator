"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Printer, ArrowLeft, AlertCircle, Edit2, Check, Key } from "lucide-react";
import { Assignment, Section, Question } from "../types";
import { api } from "../lib/api";
import { useAssignmentStore } from "../store/useAssignmentStore";

interface Props {
  assignment: Assignment;
  onRegenerate: () => void;
  onBack: () => void;
}

const DIFF_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Hard",
};

function DiffBadge({ difficulty }: { difficulty: string }) {
  const level = difficulty?.toLowerCase() as "easy" | "medium" | "hard";
  return (
    <span className={`diff-badge ${level}`}>
      {DIFF_LABELS[level] ?? difficulty}
    </span>
  );
}

function QuestionItem({ q, num }: { q: Question; num: number }) {
  return (
    <li className="question-item">
      <span className="question-num">{num}.</span>
      <div className="question-content">
        <p className="question-text">{q.text}</p>
        {q.options && q.options.length > 0 && (
          <ul className="question-options">
            {q.options.map((opt, i) => (
              <li key={i}>
                <span className="option-letter">{String.fromCharCode(97 + i)})</span> {opt}
              </li>
            ))}
          </ul>
        )}
        <div className="question-meta">
          <DiffBadge difficulty={q.difficulty} />
          <span className="marks-badge">[{q.marks} {q.marks === 1 ? "mark" : "marks"}]</span>
        </div>
      </div>
    </li>
  );
}

function PaperSection({ section, startNum }: { section: Section; startNum: number }) {
  return (
    <div className="paper-section">
      <div className="paper-section-header">
        <h3 className="paper-section-title">{section.title}</h3>
        <div className="paper-section-line" />
      </div>
      {section.instruction && (
        <p className="paper-section-instruction">{section.instruction}</p>
      )}
      {section.questions && section.questions.length > 0 ? (
        <ul className="question-list">
          {section.questions.map((q, idx) => (
            <QuestionItem key={idx} q={q} num={startNum + idx} />
          ))}
        </ul>
      ) : (
        <p style={{ fontStyle: "italic", fontSize: 13, color: "#94a3b8" }}>
          No questions were generated for this section.
        </p>
      )}
    </div>
  );
}

function GeneratingState({ status }: { status: string }) {
  if (status === "failed") {
    return (
      <div className="failed-state">
        <AlertCircle size={48} className="failed-icon" />
        <p className="failed-text">Generation Failed</p>
        <p className="failed-sub">
          The AI could not generate the question paper. Please try regenerating.
        </p>
      </div>
    );
  }
  return (
    <div className="generating-state">
      <div className="generating-spinner" />
      <p className="generating-text">Generating your question paper…</p>
      <p className="generating-sub">
        Our AI is crafting questions based on your settings. This may take a moment.
      </p>
    </div>
  );
}

export default function OutputPaper({ assignment, onRegenerate, onBack }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleVal, setTitleVal] = useState(assignment.title);
  const [showAnswers, setShowAnswers] = useState(false);
  const { upsertAssignment } = useAssignmentStore();

  const sections = assignment.result?.sections ?? [];
  const isDone = assignment.status === "done" && sections.length > 0;
  const totalMarks = sections.reduce(
    (sum, sec) => sum + (sec.questions || []).reduce((s, q) => s + q.marks, 0),
    0
  );
  const totalQuestions = sections.reduce((sum, sec) => sum + (sec.questions || []).length, 0);

  useEffect(() => {
    if (isDone) {
      const orig = document.title;
      document.title = assignment.title ? `${assignment.title} - VedaAI Assessment` : "VedaAI Generated Assessment";
      return () => { document.title = orig; };
    }
  }, [isDone, assignment.title]);

  const handleSaveTitle = async () => {
    if (!titleVal.trim() || titleVal === assignment.title) {
      setIsEditing(false);
      setTitleVal(assignment.title);
      return;
    }
    try {
      const res = await api.patch(`/assignments/${assignment._id}`, { title: titleVal });
      upsertAssignment(res.data);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegenerate = async () => {
    try {
      await api.post(`/assignments/${assignment._id}/regenerate`);
      onRegenerate();
    } catch (e) {
      console.error("Regenerate failed:", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fade-in">
      {/* Action Bar */}
      <div className="output-action-bar">
        <div className="output-action-left">
          <button className="btn-secondary" onClick={onBack} id="output-back-btn">
            <ArrowLeft size={15} />
            Back
          </button>
          <div>
            {isEditing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input 
                  autoFocus
                  value={titleVal} 
                  onChange={(e) => setTitleVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                  style={{ 
                    fontWeight: 700, 
                    fontSize: 16, 
                    border: "1px solid var(--border)", 
                    borderRadius: 4, 
                    padding: "2px 6px",
                    outline: "none"
                  }}
                />
                <button 
                  onClick={handleSaveTitle} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand)", padding: 0 }}
                >
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                {assignment.title}
                <button 
                  onClick={() => setIsEditing(true)} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
                  aria-label="Rename"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>
              {assignment.subject} {assignment.className ? `• ${assignment.className}` : ""}
            </div>
          </div>
        </div>

        {(isDone || assignment.status === "failed") && (
          <div className="output-action-right">
            <button className="btn-outline" onClick={handleRegenerate} id="regenerate-btn">
              <RefreshCw size={14} />
              Regenerate
            </button>
            {isDone && (
              <>
                <button 
                  className={showAnswers ? "btn-primary" : "btn-outline"} 
                  onClick={() => setShowAnswers(!showAnswers)} 
                  id="toggle-answers-btn"
                  style={{ minWidth: 140 }}
                >
                  <Key size={14} />
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </button>
                <button className="btn-primary" onClick={handlePrint} id="print-btn">
                  <Printer size={14} />
                  Download / Print
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Paper */}
      <div className="paper">
        {/* School Header */}
        <div className="paper-school-header">
          <div className="paper-school-name">Delhi Public School, Sector-4, Bokaro</div>
          {assignment.subject && (
            <div className="paper-subject-line">Subject: {assignment.subject}</div>
          )}
          {assignment.className && (
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
              Class: {assignment.className}
            </div>
          )}
          <div className="paper-meta-row">
            <div className="paper-meta-item">
              <span>⏱</span>
              <span>Time Allowed: 3 Hours</span>
            </div>
            <div className="paper-meta-item">
              <span>📝</span>
              <span>Maximum Marks: {totalMarks}</span>
            </div>
            {totalQuestions > 0 && (
              <div className="paper-meta-item">
                <span>❓</span>
                <span>Total Questions: {totalQuestions}</span>
              </div>
            )}
          </div>
        </div>

        <div className="paper-body">
          {/* Student Info */}
          <div className="student-info-section">
            <div className="student-info-field">
              <span className="student-info-label">Name</span>
              <div className="student-info-line" />
            </div>
            <div className="student-info-field">
              <span className="student-info-label">Roll Number</span>
              <div className="student-info-line" />
            </div>
            <div className="student-info-field">
              <span className="student-info-label">Section</span>
              <div className="student-info-line" />
            </div>
          </div>

          {/* Instructions */}
          {isDone && (
            <div
              style={{
                background: "#fef9c3",
                border: "1px solid #fde047",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: 12,
                color: "#854d0e",
                marginBottom: 20,
              }}
            >
              ⚠ All questions are compulsory unless stated otherwise. Attempt all questions in the given sections.
            </div>
          )}

          {/* Content */}
          {!isDone ? (
            <GeneratingState status={assignment.status} />
          ) : sections.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <p style={{ fontWeight: 500 }}>No sections generated.</p>
              <p style={{ fontSize: 13 }}>Please regenerate the paper or modify your configuration.</p>
            </div>
          ) : (
            (() => {
              let questionCounter = 1;
              return sections.map((section, idx) => {
                const startNum = questionCounter;
                questionCounter += (section.questions || []).length;
                return (
                  <PaperSection
                    key={idx}
                    section={section}
                    startNum={startNum}
                  />
                );
              });
            })()
          )}

          {isDone && showAnswers && sections.length > 0 && (
            <div className="answer-key-section" style={{ pageBreakBefore: "always", breakInside: "avoid" }}>
              <h3 className="paper-section-title" style={{ marginBottom: 20 }}>Answer Key</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {(() => {
                  let globalNum = 1;
                  return sections.map((sec, sIdx) => {
                    const startNum = globalNum;
                    const qs = sec.questions || [];
                    globalNum += qs.length;
                    
                    if (qs.length === 0) return null;

                    return (
                      <div key={`ans-sec-${sIdx}`}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {sec.title}
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                          {qs.map((q, qIdx) => (
                            <li key={`ans-${qIdx}`} style={{ fontSize: 13, display: "flex", gap: 8, lineHeight: 1.5, breakInside: "avoid" }}>
                              <span style={{ fontWeight: 600, minWidth: 24, color: "#0f172a", textAlign: "right" }}>{startNum + qIdx}.</span>
                              <span style={{ color: "#334155" }}>
                                {q.answer || <em style={{ color: "#94a3b8" }}>No answer provided</em>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {isDone && (
            <>
              <hr className="paper-divider" />
              <p className="paper-footer" style={{ borderTop: "none", color: "#94a3b8", fontSize: 10 }}>
                Generated by VedaAI
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
