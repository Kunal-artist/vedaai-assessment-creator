"use client";

import { useState, useRef } from "react";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { Assignment } from "../types";

interface Props {
  assignment: Assignment;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

const STATUS_ICONS: Record<string, string> = {
  queued: "⏳",
  processing: "⚡",
  done: "✅",
  failed: "❌",
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AssignmentCard({
  assignment,
  onView,
  onDelete,
  isSelected,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onView(assignment._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(assignment._id);
  };

  return (
    <article
      className={`assignment-card fade-in ${isSelected ? "selected" : ""}`}
      onClick={() => onView(assignment._id)}
      id={`card-${assignment._id}`}
    >
      <div className="card-header">
        <h3 className="card-title">{assignment.title}</h3>
        <div style={{ position: "relative" }}>
          <button
            className="card-menu-btn"
            onClick={handleMenuClick}
            id={`card-menu-${assignment._id}`}
            aria-label="Card menu"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="card-dropdown" ref={menuRef}>
              <button className="card-dropdown-item" onClick={handleView} id={`view-${assignment._id}`}>
                <Eye size={14} />
                View Assignment
              </button>
              <button className="card-dropdown-item danger" onClick={handleDelete} id={`delete-${assignment._id}`}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-dates">
        <div className="card-date-row">
          <span className="card-date-label">Assigned on</span>
          <span className="card-date-value">{fmt(assignment.createdAt)}</span>
        </div>
        <div className="card-date-row">
          <span className="card-date-label">Due</span>
          <span className="card-date-value">{fmt(assignment.dueDate)}</span>
        </div>
      </div>

      <div className="card-status-row">
        <span className={`status-badge ${assignment.status}`}>
          {STATUS_ICONS[assignment.status]} {assignment.status}
        </span>
      </div>
    </article>
  );
}
