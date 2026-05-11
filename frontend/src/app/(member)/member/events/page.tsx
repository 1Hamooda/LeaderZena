"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Search, Check, X } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

interface Event {
  id:               number;
  title:            string;
  category:         string;
  status:           string;
  emoji:            string;
  image_url:        string | null;
  location:         string;
  date:             string;
  time_start:       string | null;
  time_end:         string | null;
  max_participants: number;
  spots_remaining:  number;
}

interface EventDetail extends Event {
  description:     string;
  roles_available: string[];
  highlights:      string[];
}

interface MyApplication {
  id:     number;
  event:  number;
  status: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const categoryOptions = [
  { value: "",           label: "All Categories" },
  { value: "community",  label: "Community" },
  { value: "social",     label: "Social" },
  { value: "workshop",   label: "Workshop" },
  { value: "conference", label: "Conference" },
  { value: "leadership", label: "Leadership" },
  { value: "other",      label: "Other" },
];

export default function MemberEvents() {
  const [events,         setEvents]         = useState<Event[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [category,       setCategory]       = useState("");
  const [toast,          setToast]          = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeEvent,    setActiveEvent]    = useState<EventDetail | null>(null);
  const [preferredRole,  setPreferredRole]  = useState("");
  const [motivation,     setMotivation]     = useState("");
  const [applyLoading,   setApplyLoading]   = useState(false);
  const [applyError,     setApplyError]     = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function fetchData() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)   params.search   = search;
      if (category) params.category = category;
      const [eventsRes, appsRes] = await Promise.all([
        api.get("/api/events/", { params }),
        api.get("/api/events/my-applications/"),
      ]);
      setEvents(eventsRes.data.results);
      setMyApplications(appsRes.data);
    } catch { setError("Failed to load events."); }
    finally   { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [search, category]);

  function getApplicationStatus(eventId: number): string | null {
    const app = myApplications.find((a) => a.event === eventId);
    return app ? app.status : null;
  }

  async function openApplyModal(event: Event) {
    try {
      const { data } = await api.get(`/api/events/${event.id}/`);
      setActiveEvent(data);
      setPreferredRole(""); setMotivation(""); setApplyError("");
      setShowApplyModal(true);
    } catch { showToast("Failed to load event details."); }
  }

  function closeModal() {
    setShowApplyModal(false); setActiveEvent(null);
    setPreferredRole(""); setMotivation(""); setApplyError("");
  }

  async function handleApply() {
    if (!activeEvent) return;
    setApplyError(""); setApplyLoading(true);
    try {
      const { data } = await api.post(`/api/events/${activeEvent.id}/apply/`, {
        preferred_role: preferredRole.trim(), motivation: motivation.trim(),
      });
      showToast(data.message); closeModal(); fetchData();
    } catch (err: any) {
      setApplyError(err?.response?.data?.error || "Failed to submit application.");
    } finally { setApplyLoading(false); }
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

        {/* Apply Modal */}
        {showApplyModal && activeEvent && (
          <div onClick={closeModal}
            style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08" }}>Apply to Event</h2>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
              </div>

              {/* Image or emoji title */}
              {activeEvent.image_url ? (
                <img src={activeEvent.image_url} alt={activeEvent.title}
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "12px", marginBottom: "12px" }} />
              ) : null}
              <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "#2e8673", marginBottom: "4px" }}>
                {!activeEvent.image_url && `${activeEvent.emoji} `}{activeEvent.title}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "20px" }}>
                {formatDate(activeEvent.date)} · {activeEvent.location}
              </p>

              {applyError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", color: "#dc2626", fontSize: "0.8rem", marginBottom: "16px" }}>{applyError}</div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Preferred Role</label>
                {activeEvent.roles_available && activeEvent.roles_available.length > 0 ? (
                  <select value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }}>
                    <option value="">Select a role...</option>
                    {activeEvent.roles_available.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <input value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}
                    placeholder="e.g. Volunteer, Coordinator"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Why do you want to participate? <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                </label>
                <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share your motivation, relevant experience, or what you hope to contribute..." rows={4}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                  onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <AnimatedButton variant="outline" onClick={closeModal} disabled={applyLoading} style={{ flex: 1, padding: "11px", borderRadius: "10px" }}>Cancel</AnimatedButton>
                <AnimatedButton variant="primary" onClick={handleApply} disabled={applyLoading} style={{ flex: 1, padding: "11px", borderRadius: "10px" }}>
                  {applyLoading ? "Submitting..." : "Submit Application"}
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Browse Events</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Find events and apply for roles that interest you.</p>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
            {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </motion.div>

        {loading ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "40px 0" }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0" }}>
            <Calendar size={32} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
            <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No events available right now.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {events.map((event, i) => {
              const appStatus = getApplicationStatus(event.id);
              const isFull    = event.spots_remaining === 0;
              return (
                <motion.div key={event.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #f0f0f0" }}>

                  {/* Card header — image or gradient+emoji */}
                  <div style={{ height: "112px", position: "relative", overflow: "hidden" }}>
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #f0f9f7 0%, #e8f5f2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                        {event.emoji}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <h3 style={{ fontWeight: "700", fontSize: "1.05rem", color: "#0d0b08" }}>{event.title}</h3>
                        <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#f3f4f6", color: "#6b7280", fontWeight: "600", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                          {event.category}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.8rem", color: "#6b7280", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={13} />{formatDate(event.date)}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={13} />{event.location}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={13} />{event.spots_remaining}/{event.max_participants} spots</span>
                      </div>
                    </div>
                    <div>
                      {appStatus ? (
                        <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: appStatus === "approved" ? "#dcfce7" : appStatus === "rejected" ? "#fee2e2" : "#fef9c3", color: appStatus === "approved" ? "#15803d" : appStatus === "rejected" ? "#b91c1c" : "#a16207", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          {appStatus === "approved" && <Check size={16} />}
                          {appStatus === "rejected" && <X size={16} />}
                          Application {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                        </div>
                      ) : isFull || event.status === "closed" ? (
                        <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#f3f4f6", color: "#6b7280", fontSize: "0.85rem", fontWeight: "600", textAlign: "center" }}>
                          {isFull ? "Event Full" : "Applications Closed"}
                        </div>
                      ) : (
                        <AnimatedButton variant="primary" onClick={() => openApplyModal(event)} fullWidth
                          style={{ padding: "11px", fontSize: "0.875rem", borderRadius: "12px" }}>
                          Apply Now
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}