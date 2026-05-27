"use client";

import { Plus } from "lucide-react";
import { useAssignmentStore } from "../../store/useAssignmentStore";

interface EmptyStateProps {
  searchQuery: string;
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  const { setView } = useAssignmentStore();

  return (
    <div className="empty-state-container fade-in">
      <div className="empty-state">
        <svg
          className="empty-icon"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background decorations */}
          <path d="M20 40 Q 30 20 45 35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M100 80 Q 110 90 95 105" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="25" cy="85" r="3" fill="#60a5fa" />
          <circle cx="95" cy="35" r="2" fill="#f43f5e" />
          <circle cx="45" cy="15" r="4" fill="#fbbf24" />
          <circle cx="105" cy="65" r="3" fill="#a78bfa" />
          
          {/* Clipboard body */}
          <rect x="40" y="25" width="48" height="64" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
          <rect x="52" y="20" width="24" height="10" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="3" />
          
          {/* Clipboard lines */}
          <rect x="50" y="45" width="28" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="50" y="55" width="20" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="50" y="65" width="24" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="50" y="75" width="16" height="3" rx="1.5" fill="#cbd5e1" />
          
          {/* Magnifying Glass with Red Cross */}
          <g transform="translate(65, 60)">
            <circle cx="12" cy="12" r="16" fill="white" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="24" y1="24" x2="36" y2="36" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
            <line x1="24" y1="24" x2="36" y2="36" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Red Cross */}
            <circle cx="12" cy="12" r="10" fill="#fee2e2" />
            <path d="M8 8 L16 16 M16 8 L8 16" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
        
        <h2 className="empty-title">
          {searchQuery ? "No assignments found" : "No assignments yet"}
        </h2>
        
        <p className="empty-desc">
          {searchQuery
            ? `No assignments match "${searchQuery}". Try a different search.`
            : "Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading."}
        </p>
        
        {!searchQuery && (
          <button
            className="empty-btn"
            onClick={() => setView("create")}
            id="create-first-btn"
          >
            <Plus size={15} />
            Create Your First Assignment
          </button>
        )}
      </div>
    </div>
  );
}
