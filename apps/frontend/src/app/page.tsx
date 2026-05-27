"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Bell, Search, Filter, Plus, ChevronDown } from "lucide-react";

import { api } from "../lib/api";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { Assignment } from "../types";

import Sidebar from "../components/Sidebar";
import AssignmentCard from "../components/AssignmentCard";
import CreateAssignmentWizard from "../components/CreateAssignmentWizard";
import OutputPaper from "../components/OutputPaper";

export default function HomePage() {
  const {
    assignments,
    setAssignments,
    upsertAssignment,
    removeAssignment,
    selectedId,
    setSelected,
    view,
    setView,
  } = useAssignmentStore();

  const [searchQuery, setSearchQuery] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const selected = assignments.find((a) => a._id === selectedId);

  // ── Load assignments ──────────────────────────────────────────
  const loadAssignments = async () => {
    try {
      const res = await api.get<Assignment[]>("/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.error("Load failed:", err);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // ── WebSocket – stable connection ────────────────────────────
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5001";

    const socket = io(socketUrl, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("assignment:update", async (payload: Partial<Assignment> & { status?: string }) => {
      // Reload to get the latest from DB
      await loadAssignments();
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join socket rooms whenever assignments change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    assignments.forEach((a) => socket.emit("join-assignment", a._id));
  }, [assignments]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleCreated = (assignment: Assignment) => {
    upsertAssignment(assignment);
    setSelected(assignment._id);
    setView("output");
    // Join socket room for this new assignment
    socketRef.current?.emit("join-assignment", assignment._id);
  };

  const handleViewAssignment = (id: string) => {
    setSelected(id);
    setView("output");
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Delete this assignment? This action cannot be undone.")) return;
    try {
      await api.delete(`/assignments/${id}`);
      removeAssignment(id);
      if (selectedId === id) {
        setSelected(undefined);
        setView("list");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRegenerate = () => {
    // After triggering regenerate, update the local state optimistically
    if (selected) {
      upsertAssignment({ ...selected, status: "queued" });
    }
  };

  // ── Filtered assignments ─────────────────────────────────────
  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Breadcrumb label ─────────────────────────────────────────
  const breadcrumb =
    view === "create"
      ? "Create Assignment"
      : view === "output" && selected
      ? selected.title
      : "Assignments";

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span>
              {view !== "list" ? (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onClick={() => setView("list")}
                  id="breadcrumb-back-btn"
                >
                  Assignment
                </button>
              ) : (
                <span>Assignment</span>
              )}
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
              <div className="topbar-avatar">J</div>
              <span className="topbar-username">John Doe</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="page-body">
          {/* ── LIST VIEW ─────────────────────────────────────── */}
          {view === "list" && (
            <>
              <div className="page-title-row">
                <div className="page-title">
                  <span className="page-title-online" />
                  Assignments
                </div>
                <p className="page-subtitle">Manage and create assignments for your classes.</p>
              </div>

              {/* Toolbar */}
              <div className="assignments-toolbar">
                <button className="toolbar-filter-btn" id="filter-btn">
                  <Filter size={13} />
                  Filter by
                </button>
                <div className="toolbar-search">
                  <Search size={15} className="search-icon" />
                  <input
                    placeholder="Search Assignment"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="search-input"
                  />
                </div>
              </div>

              {/* Empty State */}
              {filteredAssignments.length === 0 && (
                <div className="empty-state">
                  {/* Inline SVG for the empty state illustration */}
                  <svg
                    className="empty-icon"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
                    <rect x="35" y="30" width="50" height="60" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                    <rect x="42" y="42" width="36" height="3" rx="1.5" fill="#e5e7eb" />
                    <rect x="42" y="50" width="28" height="3" rx="1.5" fill="#e5e7eb" />
                    <rect x="42" y="58" width="32" height="3" rx="1.5" fill="#e5e7eb" />
                    <circle cx="75" cy="78" r="15" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="68" y1="71" x2="82" y2="85" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <line x1="82" y1="71" x2="68" y2="85" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
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
              )}

              {/* Cards Grid */}
              {filteredAssignments.length > 0 && (
                <div className="cards-grid" id="assignments-grid">
                  {filteredAssignments.map((a) => (
                    <AssignmentCard
                      key={a._id}
                      assignment={a}
                      onView={handleViewAssignment}
                      onDelete={handleDeleteAssignment}
                      isSelected={a._id === selectedId}
                    />
                  ))}
                </div>
              )}

              {/* FAB */}
              {assignments.length > 0 && (
                <button
                  className="fab-create"
                  onClick={() => setView("create")}
                  id="fab-create-btn"
                >
                  <Plus size={15} />
                  Create Assignment
                </button>
              )}
            </>
          )}

          {/* ── CREATE VIEW ───────────────────────────────────── */}
          {view === "create" && (
            <CreateAssignmentWizard
              onCreated={handleCreated}
              onCancel={() => setView("list")}
            />
          )}

          {/* ── OUTPUT VIEW ───────────────────────────────────── */}
          {view === "output" && selected && (
            <OutputPaper
              assignment={selected}
              onRegenerate={handleRegenerate}
              onBack={() => setView("list")}
            />
          )}

          {/* Fallback if output selected but no assignment */}
          {view === "output" && !selected && (
            <div className="empty-state">
              <p className="empty-title">Assignment not found</p>
              <button className="empty-btn" onClick={() => setView("list")} id="back-to-list-btn">
                Back to Assignments
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}