"use client";

import { Home, FileText, Library, Cpu } from "lucide-react";
import { useAssignmentStore } from "../../store/useAssignmentStore";

export default function MobileBottomNav() {
  const { view, setView } = useAssignmentStore();

  return (
    <nav className="mobile-bottom-nav">
      <button className="bottom-nav-item">
        <Home size={20} />
        <span>Home</span>
      </button>
      <button 
        className="bottom-nav-item active"
        onClick={() => setView("list")}
      >
        <FileText size={20} />
        <span>Assignments</span>
      </button>
      <button className="bottom-nav-item">
        <Library size={20} />
        <span>Library</span>
      </button>
      <button className="bottom-nav-item">
        <Cpu size={20} />
        <span>AI Toolkit</span>
      </button>
    </nav>
  );
}
