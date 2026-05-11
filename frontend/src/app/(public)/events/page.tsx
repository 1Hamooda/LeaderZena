"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, MapPin, Search, ArrowRight } from "lucide-react";
import api from "@/services/api";

interface Event {
  id:               number;
  title:            string;
  category:         string;
  status:           string;
  emoji:            string;
  image_url:        string | null;
  location:         string;
  date:             string;
  max_participants: number;
  spots_remaining:  number;
}

const CATEGORIES = ["All", "Conference", "Workshop", "Social", "Community", "Leadership", "Other"];

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
  conference: "linear-gradient(135deg, #211f21 0%, #2e8673 100%)",
  leadership: "linear-gradient(135deg, #1d4ed8 0%, #2e8673 100%)",
  other:      "linear-gradient(135deg, #2e8673 0%, #211f21 100%)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EventsPage() {
  const [events,          setEvents]          = useState<Event[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (debouncedSearch)          params.search   = debouncedSearch;
        if (activeCategory !== "All") params.category = activeCategory.toLowerCase();
        const { data } = await api.get("/api/events/", { params });
        setEvents(data.results);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [debouncedSearch, activeCategory]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0d0b08 0%, #2e8673 60%, #469d8b 100%)", padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 14px", borderRadius: "20px", letterSpacing: "0.08em", backdropFilter: "blur(4px)" }}>
              OUR EVENTS
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", color: "#ffffff", marginTop: "16px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Discover &amp; Join<br />
              <span style={{ color: "#66bdab" }}>MENA Initiatives</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", marginTop: "14px", maxWidth: "480px" }}>
              From community clean-ups to youth forums — find the event that matches your passion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            style={{ marginTop: "32px", display: "flex", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "14px", padding: "12px 18px", maxWidth: "420px", gap: "10px" }}
          >
            <Search size={18} style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
            <input type="text" placeholder="Search events..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: "0.95rem", width: "100%" }} />
          </motion.div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#ffffff", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button key={cat} onClick={() => setActiveCategory(cat)}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 20px", fontSize: "0.875rem", fontWeight: isActive ? "700" : "500", border: "none", background: "transparent", cursor: "pointer", flexShrink: 0, color: isActive ? "#2e8673" : "#6b7280", borderBottom: isActive ? "2px solid #2e8673" : "2px solid transparent", transition: "all 0.2s" }}>
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {loading ? "Loading..." : <>Showing <strong style={{ color: "#0d0b08" }}>{events.length}</strong> event{events.length !== 1 ? "s" : ""}</>}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              <p>Loading events...</p>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontSize: "1rem" }}>
                {search ? <>No events found for &ldquo;<strong>{search}</strong>&rdquo;</> : "No events available right now."}
              </p>
            </motion.div>
          ) : (
            <motion.div key="grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {events.map((event, i) => {
                const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
                const gradient  = CATEGORY_GRADIENTS[event.category] || CATEGORY_GRADIENTS.other;
                return (
                  <motion.div key={event.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(46,134,115,0.14)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    style={{ backgroundColor: "#ffffff", borderRadius: "20px", overflow: "hidden", border: "1px solid #f0f0f0" }}>

                    {/* Card Header — image or gradient+emoji fallback */}
                    <div style={{ height: "160px", position: "relative", overflow: "hidden" }}>
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ background: gradient, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "3.5rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{event.emoji}</span>
                        </div>
                      )}
                      <span style={{
                        position: "absolute", top: "14px", right: "14px",
                        backgroundColor: statusCfg.bg, color: statusCfg.color,
                        fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px",
                        display: "flex", alignItems: "center", gap: "5px",
                      }}>
                        <span style={{ height: "6px", width: "6px", borderRadius: "50%", backgroundColor: statusCfg.dot, flexShrink: 0 }} />
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: "20px" }}>
                      <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.04em" }}>
                        {event.category.toUpperCase()}
                      </span>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08", marginTop: "10px", lineHeight: 1.3 }}>{event.title}</h3>
                      <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#6b7280" }}>
                          <Calendar size={13} style={{ color: "#2e8673" }} /> {formatDate(event.date)}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#6b7280" }}>
                          <MapPin size={13} style={{ color: "#2e8673" }} /> {event.location}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f5f5f5" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#6b7280" }}>
                          <Users size={13} style={{ color: "#2e8673" }} />
                          {event.spots_remaining}/{event.max_participants} spots
                        </span>
                        <Link href={`/events/${event.id}`}>
                          <motion.button whileHover={{ gap: "10px" }} whileTap={{ scale: 0.96 }}
                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #2e8673, #469d8b)", color: "#ffffff", fontSize: "0.8rem", fontWeight: "700", padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", transition: "gap 0.2s" }}>
                            View Details <ArrowRight size={13} />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}