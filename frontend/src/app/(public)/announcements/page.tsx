"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pin, ArrowRight, Megaphone, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getAnnouncements } from "@/services/announcementService";
import type { Announcement } from "@/services/announcementService";

const CATEGORIES = ["All", "Events", "Workshop", "General"];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  events:   { bg: "#dbeafe", color: "#1d4ed8" },
  workshop: { bg: "#f0f9f7", color: "#2e8673" },
  general:  { bg: "#f3f4f6", color: "#374151" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  }),
};

export default function AnnouncementsPage() {
  const [announcements,   setAnnouncements]   = useState<Announcement[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [activeCategory,  setActiveCategory]  = useState("All");

  // ── Load announcements ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = announcements.filter(
    (a) => activeCategory === "All" || a.category === activeCategory.toLowerCase()
  );

  const pinned  = filtered.filter((a) => a.is_pinned);
  const regular = filtered.filter((a) => !a.is_pinned);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0d0b08 0%, #211f21 40%, #2e8673 100%)", padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "0.78rem", fontWeight: "700", padding: "5px 14px", borderRadius: "20px", letterSpacing: "0.08em", backdropFilter: "blur(4px)" }}>
              LATEST NEWS
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", color: "#ffffff", marginTop: "16px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Announcements<br />
              <span style={{ color: "#66bdab" }}>&amp; Updates</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", marginTop: "14px", maxWidth: "480px" }}>
              Stay in the loop with everything happening at MENA Club.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#ffffff", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <motion.button key={cat} onClick={() => setActiveCategory(cat)}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 20px", fontSize: "0.875rem", fontWeight: isActive ? "700" : "500", border: "none", background: "transparent", cursor: "pointer", flexShrink: 0, color: isActive ? "#2e8673" : "#6b7280", borderBottom: isActive ? "2px solid #2e8673" : "2px solid transparent", transition: "all 0.2s" }}
              >
                {cat}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: "48px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
            <p>Loading announcements...</p>
          </div>
        ) : (
          <>
            {/* Pinned */}
            {pinned.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Pin size={15} style={{ color: "#2e8673" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#2e8673", letterSpacing: "0.06em" }}>PINNED</span>
                </div>
                {pinned.map((a, i) => (
                  <motion.div key={a.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                    <Link href={`/announcements/${a.id}`} style={{ textDecoration: "none" }}>
                      <motion.div whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(46,134,115,0.12)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "2px solid #2e8673", padding: "28px", display: "flex", gap: "20px", alignItems: "flex-start", cursor: "pointer", marginBottom: "12px" }}
                      >
                        <div style={{ height: "52px", width: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                          {a.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Pin size={10} /> Pinned
                            </span>
                            <span style={{ backgroundColor: CATEGORY_COLORS[a.category]?.bg || "#f3f4f6", color: CATEGORY_COLORS[a.category]?.color || "#374151", fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>
                              {a.category}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#9ca3af" }}>
                              <Calendar size={11} /> {new Date(a.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "8px" }}>{a.title}</h2>
                          <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.6 }}>{a.content}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "14px", color: "#2e8673", fontSize: "0.8rem", fontWeight: "700" }}>
                            Read more <ArrowRight size={13} />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Regular */}
            {regular.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Megaphone size={15} style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#6b7280", letterSpacing: "0.06em" }}>ALL ANNOUNCEMENTS</span>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {regular.map((a, i) => (
                    <motion.div key={a.id} custom={pinned.length + i} initial="hidden" animate="visible" variants={fadeUp}>
                      <Link href={`/announcements/${a.id}`} style={{ textDecoration: "none" }}>
                        <motion.div whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.06)", borderColor: "#2e8673" }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", padding: "22px 24px", display: "flex", gap: "16px", alignItems: "flex-start", cursor: "pointer", transition: "border-color 0.2s" }}
                        >
                          <div style={{ height: "44px", width: "44px", borderRadius: "12px", backgroundColor: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                            {a.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                              <span style={{ backgroundColor: CATEGORY_COLORS[a.category]?.bg || "#f3f4f6", color: CATEGORY_COLORS[a.category]?.color || "#374151", fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>
                                {a.category}
                              </span>
                              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#9ca3af" }}>
                                <Calendar size={11} /> {new Date(a.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "5px" }}>{a.title}</h2>
                            <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{a.content}</p>
                          </div>
                          <ArrowRight size={16} style={{ color: "#d1d5db", flexShrink: 0, marginTop: "4px" }} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📭</div>
                <p>No announcements in this category yet.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}