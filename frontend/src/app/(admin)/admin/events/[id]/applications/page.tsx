"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  pending:  { bg: "#fef9c3", color: "#a16207" },
  approved: { bg: "#dcfce7", color: "#15803d" },
  rejected: { bg: "#fee2e2", color: "#b91c1c" },
};

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
  status:           string;
  reviewed_by_name: string | null;
  reviewed_at:      string | null;
  created_at:       string;
}

interface EventDetail {
  id:               number;
  title:            string;
  date:             string;
  location:         string;
  emoji:            string;
  spots_remaining:  number;
  max_participants: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminEventApplications() {
  const params  = useParams();
  const eventId = params?.id as string;

  const [event,         setEvent]         = useState<EventDetail | null>(null);
  const [applications,  setApplications]  = useState<Application[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast,         setToast]         = useState("");
  const [error,         setError]         = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [search,        setSearch]        = useState("");

  // Approve modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingApp,     setApprovingApp]     = useState<Application | null>(null);
  const [assignedRole,     setAssignedRole]     = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [eventRes, appsRes] = await Promise.all([
        api.get(`/api/events/${eventId}/`),
        api.get("/api/events/admin/applications/", { params: { event_id: eventId } }),
      ]);
      setEvent(eventRes.data);
      setApplications(appsRes.data.results);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Open approve modal
  function openApproveModal(app: Application) {
    setApprovingApp(app);
    setAssignedRole(app.preferred_role || "");
    setShowApproveModal(true);
  }

  function closeApproveModal() {
    setShowApproveModal(false);
    setApprovingApp(null);
    setAssignedRole("");
  }

  // Approve with optional assigned role
  async function handleApprove() {
    if (!approvingApp) return;
    setActionLoading(approvingApp.id);
    try {
      const { data } = await api.post(
        `/api/events/admin/applications/${approvingApp.id}/approve/`,
        { assigned_role: assignedRole.trim() }
      );
      showToast(data.message);
      closeApproveModal();
      fetchData();
    } catch {
      showToast("Failed to approve application.");
    } finally {
      setActionLoading(null);
    }
  }

  // Reject
  async function handleReject(id: number) {
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

  // Filter applications
  const filtered = applications.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.user_name.toLowerCase().includes(q) || a.user_email.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const stats = {
    total:    applications.length,
    pending:  applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
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

        {/* Approve Modal */}
        {showApproveModal && approvingApp && (
          <div
            onClick={closeApproveModal}
            style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08" }}>Approve Application</h2>
                <button onClick={closeApproveModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "20px" }}>
                Approving <strong style={{ color: "#0d0b08" }}>{approvingApp.user_name}</strong> for <strong style={{ color: "#0d0b08" }}>{approvingApp.event_title}</strong>.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Assigned Role
                </label>
                <input
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  placeholder={approvingApp.preferred_role || "e.g. Coordinator"}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                  onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")}
                />
                {approvingApp.preferred_role && (
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px" }}>
                    Preferred: {approvingApp.preferred_role}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={closeApproveModal}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#374151", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading === approvingApp.id}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#2e8673", color: "#ffffff", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}
                >
                  {actionLoading === approvingApp.id ? "Approving..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/admin/events"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "0.875rem", textDecoration: "none", width: "fit-content" }}
        >
          <ArrowLeft size={14} /> Back to events
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>
            {event ? `${event.emoji} ${event.title}` : "Applications"}
          </h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>
            Review applications for this event. FR-A4.
            {event && (
              <span style={{ marginLeft: "8px" }}>
                · {formatDate(event.date)} · {event.location} · {event.spots_remaining}/{event.max_participants} spots remaining
              </span>
            )}
          </p>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}
        >
          {[
            { label: "Total",    value: stats.total,    color: "#0d0b08", bg: "#f9fafb" },
            { label: "Pending",  value: stats.pending,  color: "#a16207", bg: "#fef9c3" },
            { label: "Approved", value: stats.approved, color: "#15803d", bg: "#dcfce7" },
            { label: "Rejected", value: stats.rejected, color: "#b91c1c", bg: "#fee2e2" },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "16px", border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: "600", color: s.color, backgroundColor: s.bg, padding: "2px 10px", borderRadius: "20px", display: "inline-block" }}>
                {s.label}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0d0b08", marginTop: "8px" }}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </motion.div>

        {/* Applications list */}
        {loading ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "40px 0" }}>Loading applications...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0" }}>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
              {applications.length === 0 ? "No applications yet." : "No applications match the filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((app, i) => {
              const isActioning = actionLoading === app.id;
              const styles = statusStyles[app.status];

              return (
                <motion.div
                  key={app.id}
                  custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #f0f0f0", opacity: isActioning ? 0.5 : 1 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    {/* Left: applicant info */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <p style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08" }}>{app.user_name}</p>
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#f0f9f7", color: "#2e8673", fontWeight: "600", textTransform: "capitalize" }}>
                          {app.user_role}
                        </span>
                        <span style={{ backgroundColor: styles.bg, color: styles.color, fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{app.user_email}</p>

                      <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.8rem" }}>
                        {app.preferred_role && (
                          <p style={{ color: "#6b7280" }}>
                            <strong style={{ color: "#374151" }}>Preferred role:</strong> {app.preferred_role}
                          </p>
                        )}
                        {app.assigned_role && (
                          <p style={{ color: "#6b7280" }}>
                            <strong style={{ color: "#374151" }}>Assigned:</strong> {app.assigned_role}
                          </p>
                        )}
                      </div>

                      {app.motivation && (
                        <div style={{ marginTop: "12px", padding: "12px 14px", backgroundColor: "#f9fafb", borderRadius: "10px", fontSize: "0.8rem", color: "#4b5563", lineHeight: "1.5" }}>
                          {app.motivation}
                        </div>
                      )}

                      <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "10px" }}>
                        Applied {formatDate(app.created_at)}
                        {app.reviewed_by_name && ` · Reviewed by ${app.reviewed_by_name}`}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      {app.status === "pending" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => openApproveModal(app)} disabled={isActioning}
                            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", backgroundColor: "#dcfce7", color: "#15803d", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <Check size={14} /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(app.id)} disabled={isActioning}
                            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <X size={14} /> Reject
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right" }}>
            Showing {filtered.length} of {applications.length} applications
          </p>
        )}
      </div>
    </PageWrapper>
  );
}