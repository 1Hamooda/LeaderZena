"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Key, RefreshCw, Copy, CheckCircle, Check, X } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

interface AttendanceCode {
  id:              number;
  event:           number;
  event_title:     string;
  code:            string;
  is_active:       boolean;
  expires_at:      string | null;
  created_by_name: string | null;
  created_at:      string;
}

interface CheckInRow {
  id:            number;
  event:         number;
  event_title:   string;
  user:          number;
  user_name:     string;
  user_email:    string;
  checked_in_at: string;
}

interface Event {
  id:    number;
  title: string;
  emoji: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AdminAttendance() {
  const [codes,         setCodes]         = useState<AttendanceCode[]>([]);
  const [checkins,      setCheckins]      = useState<CheckInRow[]>([]);
  const [events,        setEvents]        = useState<Event[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState("");
  const [copiedId,      setCopiedId]      = useState<number | null>(null);
  const [genEventId,    setGenEventId]    = useState("");
  const [genLoading,    setGenLoading]    = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [codesRes, checkinsRes, eventsRes] = await Promise.all([
        api.get("/api/attendance/admin/codes/"),
        api.get("/api/attendance/admin/checkins/"),
        api.get("/api/events/admin/"),
      ]);
      setCodes(codesRes.data);
      setCheckins(checkinsRes.data.results);
      setEvents(eventsRes.data.results);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  async function handleGenerate() {
    if (!genEventId) { showToast("Please select an event."); return; }
    setGenLoading(true);
    try {
      const { data } = await api.post("/api/attendance/admin/generate-code/", { event_id: genEventId });
      showToast(data.message);
      setGenEventId("");
      fetchAll();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to generate code.");
    } finally {
      setGenLoading(false);
    }
  }

  async function handleDeactivate(id: number) {
    setActionLoading(id);
    try {
      const { data } = await api.post(`/api/attendance/admin/codes/${id}/deactivate/`);
      showToast(data.message);
      fetchAll();
    } catch {
      showToast("Failed to deactivate.");
    } finally {
      setActionLoading(null);
    }
  }

  function copyCode(code: AttendanceCode) {
    navigator.clipboard.writeText(code.code);
    setCopiedId(code.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function checkinCount(eventId: number): number {
    return checkins.filter((c) => c.event === eventId).length;
  }

  const activeCodes = codes.filter((c) => c.is_active);

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Toast */}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: "fixed", top: "24px", right: "24px", zIndex: 100, backgroundColor: "#0d0b08", color: "#ffffff", padding: "12px 20px", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "500", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Attendance Management</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Generate codes and monitor check-ins.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* ── Generate Code ── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} style={{ color: "#2e8673" }} /> Generate Code
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <select
                value={genEventId}
                onChange={(e) => setGenEventId(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
              >
                <option value="">Select event</option>
                {events.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>{ev.emoji} {ev.title}</option>
                ))}
              </select>
              <AnimatedButton
                variant="primary"
                fullWidth
                onClick={handleGenerate}
                disabled={genLoading || !genEventId}
                style={{ padding: "12px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <RefreshCw size={14} /> {genLoading ? "Generating..." : "Generate New Code"}
              </AnimatedButton>
            </div>

            {/* Active codes */}
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>Loading...</p>
              ) : activeCodes.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>No active codes yet.</p>
              ) : activeCodes.map((c, i) => (
                <motion.div key={c.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb", opacity: actionLoading === c.id ? 0.5 : 1 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0d0b08" }}>{c.event_title}</p>
                    <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.75rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>
                      {checkinCount(c.event)} checked in
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <code style={{ flex: 1, backgroundColor: "#ffffff", padding: "8px 12px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.875rem", letterSpacing: "0.1em", border: "1px solid #e5e7eb" }}>
                      {c.code}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => copyCode(c)}
                      title="Copy code"
                      style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {copiedId === c.id ? <Check size={14} /> : <Copy size={14} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeactivate(c.id)}
                      disabled={actionLoading === c.id}
                      title="Deactivate"
                      style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "8px" }}>Created: {formatDate(c.created_at)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Live Check-ins ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={18} style={{ color: "#2e8673" }} /> Live Check-ins
              {checkins.length > 0 && (
                <span style={{ marginLeft: "4px", backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.72rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                  {checkins.length}
                </span>
              )}
            </h2>

            {loading ? (
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Loading...</p>
            ) : checkins.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No check-ins yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Volunteer", "Time", "Event"].map((h) => (
                      <th key={h} style={{ padding: "8px 0", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkins.slice(0, 10).map((c, i) => (
                    <motion.tr key={c.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s" }}
                    >
                      <td style={{ padding: "12px 0", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{c.user_name}</td>
                      <td style={{ padding: "12px 0", fontSize: "0.875rem", color: "#6b7280", paddingRight: "12px" }}>{formatTime(c.checked_in_at)}</td>
                      <td style={{ padding: "12px 0" }}>
                        <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.72rem", fontWeight: "600", padding: "3px 8px", borderRadius: "20px" }}>
                          {c.event_title.length > 18 ? c.event_title.slice(0, 18) + "…" : c.event_title}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
            {checkins.length > 10 && (
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "12px" }}>
                Showing 10 of {checkins.length} check-ins
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}