"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Check, X, ChevronDown, Search,
  Users, Calendar, MapPin, Filter, Eye
} from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

type AppStatus = "pending" | "approved" | "rejected";

interface Application {
  id:               number;
  event:            number;
  event_title:      string;
  user:             number;
  user_name:        string;
  user_email:       string;
  user_role:        string;
  preferred_role:   string;
  assigned_role:    string;
  motivation:       string;
  status:           AppStatus;
  reviewed_by_name: string | null;
  reviewed_at:      string | null;
  created_at:       string;
}

interface Event {
  id:    number;
  title: string;
  date:  string;
  location: string;
}

const STATUS_CONFIG: Record<AppStatus, { bg: string; color: string; dot: string; label: string }> = {
  pending:  { bg: "#fef9c3", color: "#a16207", dot: "#eab308", label: "Pending" },
  approved: { bg: "#dcfce7", color: "#15803d", dot: "#22c55e", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444", label: "Rejected" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function AdminApplications() {
  const [apps,         setApps]         = useState<Application[]>([]);
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast,        setToast]        = useState("");
  const [error,        setError]        = useState("");

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all");
  const [eventFilter,  setEventFilter]  = useState("all");
  const [expandedId,   setExpandedId]   = useState<number | null>(null);
  const [roleAssigning, setRoleAssigning] = useState<Record<number, string>>({});

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [appsRes, eventsRes] = await Promise.all([
        api.get("/api/events/admin/applications/"),
        api.get("/api/events/admin/"),
      ]);
      setApps(appsRes.data.results);
      setEvents(eventsRes.data.results);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Approve with assigned role
  async function approveWithRole(id: number) {
    const role = roleAssigning[id] || "";
    setActionLoading(id);
    try {
      const { data } = await api.post(
        `/api/events/admin/applications/${id}/approve/`,
        { assigned_role: role }
      );
      showToast(data.message);
      setRoleAssigning((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchData();
    } catch {
      showToast("Failed to approve application.");
    } finally {
      setActionLoading(null);
    }
  }

  // Approve without role (just decision)
  async function approveSimple(id: number, app: Application) {
    setActionLoading(id);
    try {
      const { data } = await api.post(
        `/api/events/admin/applications/${id}/approve/`,
        { assigned_role: app.preferred_role || "" }
      );
      showToast(data.message);
      fetchData();
    } catch {
      showToast("Failed to approve application.");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectApp(id: number) {
    setActionLoading(id);
    try {
      const { data } = await api.post(`/api/events/admin/applications/${id}/reject/`);
      showToast(data.message);
      fetchData();
    } catch {
      showToast("Failed to reject application.");
    } finally {
      setActionLoading(null);
    }
  }

  // Filter
  const filtered = apps.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.user_name.toLowerCase().includes(q) ||
      a.user_email.toLowerCase().includes(q) ||
      a.event_title.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchEvent  = eventFilter === "all" || String(a.event) === eventFilter;
    return matchSearch && matchStatus && matchEvent;
  });

  const counts = {
    pending:  apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: "fixed", top: "24px", right: "24px", zIndex: 100, backgroundColor: "#0d0b08", color: "#ffffff", padding: "12px 20px", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "500", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Applications</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Review event applications and assign volunteer roles. FR-A4.</p>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {(["pending", "approved", "rejected"] as AppStatus[]).map((s, i) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <motion.div
                key={s} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(46,134,115,0.1)" }}
                onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ backgroundColor: statusFilter === s ? cfg.bg : "#ffffff", borderRadius: "14px", padding: "18px 20px", border: `1.5px solid ${statusFilter === s ? cfg.color : "#f0f0f0"}`, cursor: "pointer", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: cfg.color, letterSpacing: "0.04em" }}>{cfg.label.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0d0b08" }}>{counts[s]}</p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>application{counts[s] !== 1 ? "s" : ""}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              placeholder="Search by name, email, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", backgroundColor: "#ffffff" }}
              onFocus={(e) => { e.target.style.borderColor = "#2e8673"; e.target.style.boxShadow = "0 0 0 3px rgba(46,134,115,0.1)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Filter size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{ padding: "10px 16px 10px 32px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff", cursor: "pointer" }}
            >
              <option value="all">All Events</option>
              {events.map((e) => <option key={e.id} value={String(e.id)}>{e.title}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Applications List */}
        {loading ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "40px 0" }}>Loading applications...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📭</div>
                  <p>No applications match your filters.</p>
                </motion.div>
              ) : filtered.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status];
                const isExpanded  = expandedId === app.id;
                const isActioning = actionLoading === app.id;

                return (
                  <motion.div
                    key={app.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    layout
                    style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: `1px solid ${isExpanded ? "#2e8673" : "#f0f0f0"}`, overflow: "hidden", transition: "border-color 0.2s", opacity: isActioning ? 0.5 : 1 }}
                  >
                    {/* Row */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", cursor: "pointer" }}
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    >
                      {/* Avatar */}
                      <div style={{ height: "40px", width: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.75rem", fontWeight: "800", flexShrink: 0 }}>
                        {getInitials(app.user_name)}
                      </div>

                      {/* Name + Event */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "#0d0b08" }}>{app.user_name}</p>
                        <p style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.event_title}</p>
                      </div>

                      {/* Requested role */}
                      {app.preferred_role && (
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", padding: "4px 12px", borderRadius: "20px", backgroundColor: "#f0f9f7", color: "#2e8673", flexShrink: 0 }}>
                          {app.preferred_role}
                        </span>
                      )}

                      {/* Status */}
                      <span style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                        <span style={{ height: "6px", width: "6px", borderRadius: "50%", backgroundColor: cfg.dot }} />
                        {cfg.label}
                      </span>

                      {/* Expand */}
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} style={{ color: "#9ca3af" }} />
                      </motion.div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f0f0f0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", paddingTop: "18px" }}>

                              {/* Left: info */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {[
                                    { icon: Users,    label: "Email",    value: app.user_email },
                                    { icon: Users,    label: "Role",     value: app.user_role.charAt(0).toUpperCase() + app.user_role.slice(1) },
                                    { icon: Calendar, label: "Applied",  value: formatDate(app.created_at) },
                                    { icon: Eye,      label: "Reviewed", value: app.reviewed_by_name || "Not yet" },
                                  ].map((item) => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                      <div style={{ height: "28px", width: "28px", borderRadius: "8px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <item.icon size={13} style={{ color: "#2e8673" }} />
                                      </div>
                                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", width: "70px", flexShrink: 0 }}>{item.label}</span>
                                      <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#374151" }}>{item.value}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Motivation */}
                                {app.motivation && (
                                  <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "12px 14px", borderLeft: "3px solid #2e8673" }}>
                                    <p style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: "600", marginBottom: "4px" }}>MOTIVATION</p>
                                    <p style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.5 }}>{app.motivation}</p>
                                  </div>
                                )}
                              </div>

                              {/* Right: actions */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                                {/* Assign Role + Approve (only for pending) */}
                                {app.status === "pending" && (
                                  <div>
                                    <p style={{ fontSize: "0.78rem", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Assign Role & Approve</p>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      <input
                                        type="text"
                                        value={roleAssigning[app.id] ?? app.preferred_role}
                                        onChange={(e) => setRoleAssigning((prev) => ({ ...prev, [app.id]: e.target.value }))}
                                        placeholder="Role name"
                                        style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "0.8rem", outline: "none", backgroundColor: "#ffffff" }}
                                      />
                                      <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => approveWithRole(app.id)}
                                        disabled={isActioning}
                                        style={{ padding: "9px 16px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2e8673, #469d8b)", color: "#ffffff", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                                      >
                                        Assign + Approve
                                      </motion.button>
                                    </div>
                                  </div>
                                )}

                                {/* Approved info */}
                                {app.assigned_role && app.status === "approved" && (
                                  <p style={{ fontSize: "0.78rem", color: "#15803d", fontWeight: "600", padding: "8px 12px", backgroundColor: "#dcfce7", borderRadius: "8px" }}>
                                    ✓ Assigned: {app.assigned_role}
                                  </p>
                                )}

                                {/* Approve / Reject quick buttons */}
                                {app.status === "pending" && (
                                  <div>
                                    <p style={{ fontSize: "0.78rem", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Quick Decision</p>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      <motion.button
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => approveSimple(app.id, app)}
                                        disabled={isActioning}
                                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                                      >
                                        <Check size={14} /> Approve as-is
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => rejectApp(app.id)}
                                        disabled={isActioning}
                                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                                      >
                                        <X size={14} /> Reject
                                      </motion.button>
                                    </div>
                                  </div>
                                )}

                                {/* Already reviewed */}
                                {app.status !== "pending" && (
                                  <p style={{ fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic", textAlign: "center", padding: "8px" }}>
                                    Already {app.status}. {app.reviewed_at && `Reviewed ${formatDate(app.reviewed_at)}.`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}