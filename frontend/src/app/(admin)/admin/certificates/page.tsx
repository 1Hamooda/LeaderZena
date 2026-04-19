"use client";

import { motion } from "framer-motion";
import { Award, Download, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

interface Certificate {
  id:             number;
  uuid:           string;
  user_name:      string;
  user_email:     string;
  event_title:    string;
  status:         string;
  issued_by_name: string;
  issued_at:      string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 50,
  backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
};

const modalBox: React.CSSProperties = {
  backgroundColor: "#ffffff", borderRadius: "20px",
  padding: "32px", width: "100%", maxWidth: "420px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};

export default function AdminCertificates() {
  const [certificates,  setCertificates]  = useState<Certificate[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast,         setToast]         = useState("");
  const [error,         setError]         = useState("");
  const [eventFilter,   setEventFilter]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueUserId,    setIssueUserId]    = useState("");
  const [issueEventId,   setIssueEventId]   = useState("");
  const [issueLoading,   setIssueLoading]   = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkEventId,   setBulkEventId]   = useState("");
  const [bulkLoading,   setBulkLoading]   = useState(false);

  const eventTitles = [...new Set(certificates.map((c) => c.event_title))];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchCertificates() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/api/certificates/admin/", { params });
      let results = data.results as Certificate[];
      if (eventFilter) results = results.filter((c) => c.event_title === eventFilter);
      setCertificates(results);
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCertificates(); }, [statusFilter, eventFilter]);

  async function handleIssueSingle() {
    if (!issueUserId || !issueEventId) { showToast("Please enter both User ID and Event ID."); return; }
    setIssueLoading(true);
    try {
      const { data } = await api.post("/api/certificates/admin/issue/", {
        user_id: parseInt(issueUserId), event_id: parseInt(issueEventId),
      });
      showToast(data.message);
      setShowIssueModal(false); setIssueUserId(""); setIssueEventId("");
      fetchCertificates();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to issue certificate.");
    } finally { setIssueLoading(false); }
  }

  async function handleBulkIssue() {
    if (!bulkEventId) { showToast("Please enter an Event ID."); return; }
    setBulkLoading(true);
    try {
      const { data } = await api.post("/api/certificates/admin/issue-bulk/", {
        event_id: parseInt(bulkEventId),
      });
      showToast(data.message);
      setShowBulkModal(false); setBulkEventId("");
      fetchCertificates();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to issue certificates.");
    } finally { setBulkLoading(false); }
  }

  async function handleRevoke(id: number) {
    setActionLoading(id);
    try {
      const { data } = await api.post(`/api/certificates/admin/${id}/revoke/`);
      showToast(data.message); fetchCertificates();
    } catch { showToast("Failed to revoke certificate."); }
    finally { setActionLoading(null); }
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: "fixed", top: "24px", right: "24px", zIndex: 100, backgroundColor: "#0d0b08", color: "#ffffff", padding: "12px 20px", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "500", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            {toast}
          </motion.div>
        )}

        {/* Issue Single Modal */}
        {showIssueModal && (
          <div style={modalOverlay} onClick={() => setShowIssueModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08" }}>Issue Certificate</h2>
                <button onClick={() => setShowIssueModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>User ID</label>
                  <input type="number" value={issueUserId} onChange={(e) => setIssueUserId(e.target.value)} placeholder="e.g. 5"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2e8673")} onBlur={(e) => (e.target.style.borderColor = "#d1d5db")} />
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Event ID</label>
                  <input type="number" value={issueEventId} onChange={(e) => setIssueEventId(e.target.value)} placeholder="e.g. 3"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2e8673")} onBlur={(e) => (e.target.style.borderColor = "#d1d5db")} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Will be replaced with dropdowns once the events app is ready.</p>
                <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                  <AnimatedButton variant="outline" onClick={() => setShowIssueModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>Cancel</AnimatedButton>
                  <AnimatedButton variant="primary" onClick={handleIssueSingle} disabled={issueLoading} style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>
                    {issueLoading ? "Issuing..." : "Issue"}
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Issue Modal */}
        {showBulkModal && (
          <div style={modalOverlay} onClick={() => setShowBulkModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08" }}>Generate All Certificates</h2>
                <button onClick={() => setShowBulkModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Issues certificates to all checked-in volunteers for an event.</p>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Event ID</label>
                  <input type="number" value={bulkEventId} onChange={(e) => setBulkEventId(e.target.value)} placeholder="e.g. 3"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2e8673")} onBlur={(e) => (e.target.style.borderColor = "#d1d5db")} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Will be replaced with an event dropdown once the events app is ready.</p>
                <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                  <AnimatedButton variant="outline" onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>Cancel</AnimatedButton>
                  <AnimatedButton variant="primary" onClick={handleBulkIssue} disabled={bulkLoading} style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>
                    {bulkLoading ? "Generating..." : "Generate All"}
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Certificate Management</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Generate and distribute participation certificates.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <AnimatedButton variant="outline" onClick={() => setShowIssueModal(true)}
              style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={14} /> Issue Single
            </AnimatedButton>
            <AnimatedButton variant="primary" onClick={() => setShowBulkModal(true)}
              style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Award size={14} /> Generate All
            </AnimatedButton>
          </div>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
            <option value="">All Events</option>
            {eventTitles.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb" }}>
                {["Participant", "Event", "Issued By", "Issued On", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>Loading certificates...</td></tr>
              ) : certificates.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No certificates found.</td></tr>
              ) : certificates.map((c, i) => {
                const isActioning = actionLoading === c.id;
                return (
                  <motion.tr key={c.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s", opacity: isActioning ? 0.5 : 1 }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{c.user_name}</p>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{c.user_email}</p>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{c.event_title}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{c.issued_by_name}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{formatDate(c.issued_at)}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ backgroundColor: c.status === "issued" ? "#dcfce7" : "#fee2e2", color: c.status === "issued" ? "#15803d" : "#b91c1c", fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                        <a href={`${API_BASE}/api/certificates/${c.uuid}/download/`} download style={{ textDecoration: "none" }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Download size={13} /> Download
                          </motion.button>
                        </a>
                        {c.status === "issued" && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleRevoke(c.id)} disabled={isActioning}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                            <X size={13} /> Revoke
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {!loading && certificates.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right" }}>
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </PageWrapper>
  );
}