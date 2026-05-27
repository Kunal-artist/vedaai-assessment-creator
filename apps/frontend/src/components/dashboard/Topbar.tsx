"use client";

import { Bell, ChevronDown, Menu, Grid, ArrowLeft } from "lucide-react";
import { useAssignmentStore } from "../../store/useAssignmentStore";

export default function Topbar() {
  const { view, setView, assignments, selectedId } = useAssignmentStore();

  const selected = assignments.find((a) => a._id === selectedId);

  const breadcrumb =
    view === "create"
      ? "Create Assignment"
      : view === "output" && selected
      ? selected.title
      : "Assignments";

  return (
    <header className="topbar">
      {/* Mobile Logo */}
      <div className="mobile-topbar-logo">
        <img src="/logo.png" alt="VedaAI Logo" width={28} height={28} className="sidebar-logo-img" />
        <span className="sidebar-logo-text">VedaAI</span>
      </div>

      <div className="topbar-breadcrumb">
        <span className="breadcrumb-group">
          <button
            className="breadcrumb-back"
            onClick={() => setView("list")}
          >
            <ArrowLeft size={16} color="var(--text-primary)" />
          </button>
          <Grid size={16} color="var(--text-secondary)" />
          <span className="breadcrumb-title">Assignment</span>
        </span>
        {view !== "list" && (
          <>
            <span className="sep">›</span>
            <span className="current">{breadcrumb}</span>
          </>
        )}
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" id="notif-btn" aria-label="Notifications">
          <Bell size={16} />
          <span className="topbar-notif-dot" />
        </button>

        <div className="topbar-user" id="user-menu-btn">
          <img src="/avatar.png" alt="User Avatar" width={28} height={28} className="topbar-avatar-img" />
          <span className="topbar-username">John Doe</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
