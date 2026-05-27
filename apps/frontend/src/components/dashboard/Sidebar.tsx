"use client";

import {
  Home,
  Users,
  FileText,
  Cpu,
  Library,
  Settings,
} from "lucide-react";
import { useAssignmentStore } from "../../store/useAssignmentStore";
import CreateAssignmentButton from "./CreateAssignmentButton";
import UserProfileCard from "./UserProfileCard";

const NAV_ITEMS = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Users, label: "My Groups", id: "groups" },
  { icon: FileText, label: "Assignments", id: "assignments", badge: true },
  { icon: Cpu, label: "AI Teacher's Toolkit", id: "toolkit" },
  { icon: Library, label: "My Library", id: "library" },
];

export default function Sidebar() {
  const { view, setView, assignments } = useAssignmentStore();
  const activeItem = view === "create" || view === "output" ? "assignments" : "assignments";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="VedaAI Logo" width={32} height={32} className="sidebar-logo-img" />
        <span className="sidebar-logo-text">VedaAI</span>
      </div>

      <CreateAssignmentButton />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                if (item.id === "assignments") setView("list");
              }}
              id={`nav-${item.id}`}
            >
              <Icon className="nav-icon" size={16} />
              <span>{item.label}</span>
              {item.badge && assignments.length > 0 && (
                <span className="nav-badge">{assignments.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <button className="nav-item" id="nav-settings">
        <Settings className="nav-icon" size={16} />
        <span>Settings</span>
      </button>

      <UserProfileCard />
    </aside>
  );
}
