"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Search, Filter, Plus } from "lucide-react";

import { api } from "../lib/api";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { Assignment } from "../types";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import EmptyState from "../components/dashboard/EmptyState";
import MobileBottomNav from "../components/dashboard/MobileBottomNav";

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
    if (selected) {
      upsertAssignment({ ...selected, status: "queued" });
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar />

        <div className="page-body">
          {view === "list" && (
            <>
              {assignments.length > 0 && (
                <>
                  <div className="page-title-row">
                    <div className="page-title">
                      <span className="page-title-online" />
                      Assignments
                    </div>
                    <p className="page-subtitle">Manage and create assignments for your classes.</p>
                  </div>

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
                </>
              )}

              {filteredAssignments.length === 0 && (
                <EmptyState searchQuery={searchQuery} />
              )}

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
            </>
          )}

          {view === "create" && (
            <CreateAssignmentWizard
              onCreated={handleCreated}
              onCancel={() => setView("list")}
            />
          )}

          {view === "output" && selected && (
            <OutputPaper
              assignment={selected}
              onRegenerate={handleRegenerate}
              onBack={() => setView("list")}
            />
          )}

          {view === "output" && !selected && (
            <div className="empty-state-container">
              <div className="empty-state">
                <p className="empty-title">Assignment not found</p>
                <button className="empty-btn" onClick={() => setView("list")} id="back-to-list-btn">
                  Back to Assignments
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
      
      {/* Mobile FAB */}
      {view === "list" && (
        <button
          className="fab-create mobile-only"
          onClick={() => setView("create")}
          id="fab-create-btn"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}