"use client";

import { Sparkles } from "lucide-react";
import { useAssignmentStore } from "../../store/useAssignmentStore";

export default function CreateAssignmentButton() {
  const { setView } = useAssignmentStore();

  return (
    <button
      className="sidebar-create-btn"
      onClick={() => setView("create")}
      id="sidebar-create-btn"
    >
      <Sparkles size={16} color="white" fill="white" />
      <span>Create Assignment</span>
    </button>
  );
}
