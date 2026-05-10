"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Clock, ArrowLeft, ArrowRight, Share2, Bookmark, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface EventDetail {
  id:               number;
  title:            string;
  description:      string;
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
  roles_available:  string[];
  highlights:       string[];
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  upcoming: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  open:     { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" },
  closed:   { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  archived: { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  community:  "linear-gradient(135deg, #2e8673 0%, #469d8b 100%)",
  social:     "linear-gradient(135deg, #469d8b 0%, #57ad9b 100%)",
  workshop:   "linear-gradient(135deg, #0d0b08 0%, #2e8673 100%)",
  conference: "linear-gradient(135deg, #0d0b08 0%, #333133 40%, #2e8673 100%)",
  leadership: "linear-gradient(135deg, #1d4ed8 0%, #2e8673 100%)",
  other:      "linear-gradient(135deg, #2e8673 0%, #211f21 100%)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(start: string | null, end: string | null): string {
  if (!start) return "TBD";
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

// Shared hero text — reused in both image and gradient variants
function HeroContent({ event, statusCfg, bookmarked, setBookmarked }: {
  event: EventDetail;
  statusCfg: { bg: string; color: string; dot: string };
  bookmarked: boolean;
  setBookmarked: (v: boolean) => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "28px" }}>
          <ArrowLeft size={15} /> Back to Events
        </Link>
      </motion.div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.06em", backdropFilter: "blur(4px)" }}>
              {event.category.toUpperCase()}
            </span>
            <span style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ height: "6px", width: "6px", borderRadius: "50%", backgroundColor: statusCfg.dot }} />
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: "900", color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.02em", maxWidth: "600px" }}>
            {event.title}
          </h1>
        </motion.div>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setBookmarked(!bookmarked)}
          style={{ padding: "10px", borderRadius: "12px", border: "none", backgroundColor: bookmarked ? "#ffffff" : "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", cursor: "pointer", color: bookmarked ? "#2e8673" : "#ffffff", flexShrink: 0 }}>
          <Bookmark size={20} fill={bookmarked ? "#2e8673" : "none"} />
        </motion.button>
      </div>
    </>
  );
}

export default function EventDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const eventId = params?.id as string;

  const [event,        setEvent]        = useState<EventDetail | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [bookmarked,   setBookmarked]   = useState(false);
  const [applied,      setApplied]      = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError,   setApplyError]   = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [motivation,   setMotivation]   = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        const { data } = await api.get(`/api/events/${eventId}/`);
        setEvent(data);
      } catch { setNotFound(true); }
      finally   { setLoading(false); }
    }
    if (eventId) fetchEvent();
  }, [eventId]);

  async function handleApply() {
    if (!event || !selectedRole) return;
    setApplyError(""); setApplyLoading(true);
    try {
      await api.post(`/api/events/${event.id}/apply/`, { preferred_role: selectedRole, motivation: motivation.trim() });
      setApplied(true); setShowModal(false);
    } catch (err: any) {
      setApplyError(err?.response?.data?.error || "Failed to submit application.");
      if (err?.response?.status === 401 || err?.response?.status === 403) router.push("/login");
    } finally { setApplyLoading(false); }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af" }}>Loading event...</p>
    </div>
  );

  if (notFound || !event) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <p style={{ fontSize: "3rem" }}>🔍</p>
      <p style={{ color: "#6b7280" }}>Event not found.</p>
      <Link href="/events" style={{ color: "#2e8673", fontWeight: "600", textDecoration: "none" }}>Back to Events</Link>
    </div>
  );

  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const gradient  = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.other;
  const isClosed  = event.status === "closed" || event.status === "archived" || event.spots_remaining === 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

      {/* Apply Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08" }}>Confirm Application</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "20px" }}>
              Applying for <strong style={{ color: "#2e8673" }}>{selectedRole}</strong> at <strong style={{ color: "#0d0b08" }}>{event.title}</strong>.
            </p>
            {applyError && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", color: "#dc2626", fontSize: "0.8rem", marginBottom: "16px" }}>{applyError}</div>}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                Motivation <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
              </label>
              <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)}
                placeholder="Share why you want to participate..." rows={4}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#374151", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleApply} disabled={applyLoading}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #2e8673, #469d8b)", color: "#ffffff", fontSize: "0.875rem", fontWeight: "700", cursor: "pointer" }}>
                {applyLoading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hero — image with overlay OR gradient+emoji */}
      {event.image_url ? (
        <div style={{ position: "relative", height: "360px", overflow: "hidden" }}>
          <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, padding: "48px 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
              <HeroContent event={event} statusCfg={statusCfg} bookmarked={bookmarked} setBookmarked={setBookmarked} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: gradient, padding: "48px 24px 80px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)" }} />
          <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ fontSize: "4rem", marginBottom: "16px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{event.emoji}</div>
            </motion.div>
            <HeroContent event={event} statusCfg={statusCfg} bookmarked={bookmarked} setBookmarked={setBookmarked} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: event.image_url ? "0 auto" : "-32px auto 0", padding: "32px 24px 80px", position: "relative" }}>

        {/* Info cards */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { icon: Calendar, label: "Date",     value: formatDate(event.date) },
            { icon: Clock,    label: "Time",     value: formatTime(event.time_start, event.time_end) },
            { icon: MapPin,   label: "Location", value: event.location },
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "18px", border: "1px solid #f0f0f0", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ height: "40px", width: "40px", borderRadius: "12px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon size={18} style={{ color: "#2e8673" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.04em" }}>{item.label.toUpperCase()}</p>
                <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0d0b08", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "28px", alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "28px", border: "1px solid #f0f0f0" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08", marginBottom: "14px" }}>About This Event</h2>
              <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.75 }}>{event.description || "No description provided."}</p>
            </motion.div>

            {event.highlights && event.highlights.length > 0 && (
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
                style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "28px", border: "1px solid #f0f0f0" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0d0b08", marginBottom: "16px" }}>What to Expect</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {event.highlights.map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", backgroundColor: "#f0f9f7" }}>
                      <div style={{ height: "22px", width: "22px", borderRadius: "50%", backgroundColor: "#2e8673", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={12} style={{ color: "#ffffff" }} />
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#0d0b08" }}>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Apply card */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
            style={{ position: "sticky", top: "24px", backgroundColor: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #f0f0f0", boxShadow: "0 8px 32px rgba(46,134,115,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
              <Users size={16} style={{ color: "#2e8673" }} />
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                <strong style={{ color: "#0d0b08" }}>{event.spots_remaining}</strong> of {event.max_participants} spots remaining
              </span>
            </div>

            {event.roles_available && event.roles_available.length > 0 && (
              <>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0d0b08", marginBottom: "14px" }}>Choose a Role</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {event.roles_available.map((role) => (
                    <motion.button key={role} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                      onClick={() => !isClosed && !applied && setSelectedRole(role)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "12px", cursor: isClosed || applied ? "default" : "pointer", border: selectedRole === role ? "1.5px solid #2e8673" : "1.5px solid #e5e7eb", backgroundColor: selectedRole === role ? "#f0f9f7" : "#ffffff", color: selectedRole === role ? "#2e8673" : "#4b5563", fontSize: "0.875rem", fontWeight: selectedRole === role ? "700" : "500", transition: "all 0.2s" }}>
                      {role}
                      <AnimatePresence>
                        {selectedRole === role && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            style={{ height: "20px", width: "20px", borderRadius: "50%", backgroundColor: "#2e8673", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={11} style={{ color: "#ffffff" }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {applied ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ height: "48px", width: "48px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <Check size={22} style={{ color: "#15803d" }} />
                  </div>
                  <p style={{ fontWeight: "800", color: "#0d0b08", fontSize: "0.95rem" }}>Application Sent!</p>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px" }}>We will notify you once reviewed.</p>
                </motion.div>
              ) : isClosed ? (
                <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ textAlign: "center", padding: "14px", borderRadius: "14px", backgroundColor: "#f3f4f6" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#6b7280" }}>
                      {event.spots_remaining === 0 ? "Event Full" : "Applications Closed"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="apply" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.button
                    whileHover={selectedRole ? { scale: 1.02, boxShadow: "0 8px 24px rgba(46,134,115,0.25)" } : {}}
                    whileTap={selectedRole ? { scale: 0.97 } : {}}
                    onClick={() => selectedRole && setShowModal(true)}
                    style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "none", background: selectedRole ? "linear-gradient(135deg, #2e8673, #469d8b)" : "#f3f4f6", color: selectedRole ? "#ffffff" : "#9ca3af", fontSize: "0.95rem", fontWeight: "700", cursor: selectedRole ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
                    Apply Now <ArrowRight size={15} />
                  </motion.button>
                  {!selectedRole && event.roles_available && event.roles_available.length > 0 && (
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginTop: "8px" }}>Select a role to continue</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ backgroundColor: "#f0f9f7" }} whileTap={{ scale: 0.97 }}
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              style={{ width: "100%", marginTop: "12px", padding: "10px", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#6b7280", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background-color 0.2s" }}>
              <Share2 size={14} /> Share Event
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}