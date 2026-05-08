"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Pin, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { use } from "react";
import { getAnnouncement, getAnnouncements } from "@/services/announcementService";
import type { Announcement } from "@/services/announcementService";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  events:   { bg: "#dbeafe", color: "#1d4ed8" },
  workshop: { bg: "#f0f9f7", color: "#2e8673" },
  general:  { bg: "#f3f4f6", color: "#374151" },
};

const GRADIENTS: Record<string, string> = {
  events:   "linear-gradient(135deg, #0d0b08 0%, #211f21 50%, #2e8673 100%)",
  workshop: "linear-gradient(135deg, #2e8673 0%, #469d8b 100%)",
  general:  "linear-gradient(135deg, #0d0b08 0%, #2e8673 100%)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  }),
};

export default function AnnouncementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item,    setItem]    = useState<Announcement | null>(null);
  const [related, setRelated] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Load announcement ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [data, all] = await Promise.all([
          getAnnouncement(Number(id)),
          getAnnouncements(),
        ]);
        setItem(data);
        setRelated(all.filter((a) => a.id !== data.id).slice(0, 2));
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af" }}>Loading...</p>
    </div>
  );

  if (!item) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <p style={{ color: "#9ca3af", fontSize: "1.1rem" }}>Announcement not found.</p>
      <Link href="/announcements" style={{ color: "#2e8673", fontWeight: "600", textDecoration: "none" }}>← Back to Announcements</Link>
    </div>
  );

  const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general;
  const gradient = GRADIENTS[item.category] || GRADIENTS.general;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>

      {/* Hero */}
      <div style={{ background: gradient, padding: "48px 24px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)" }} />

        <div style={{ maxWidth: "820px", margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/announcements" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", textDecoration: "none", marginBottom: "28px" }}>
              <ArrowLeft size={15} /> Back to Announcements
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{item.emoji}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              {item.is_pinned && (
                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px", backdropFilter: "blur(4px)" }}>
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span style={{ backgroundColor: catStyle.bg, color: catStyle.color, fontSize: "0.72rem", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>
                {item.category}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "rgba(255,255,255,0.65)", fontSize: "0.8rem" }}>
                <Calendar size={13} /> {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: "900", color: "#ffffff", lineHeight: 1.2, letterSpacing: "-0.02em", maxWidth: "600px" }}>
              {item.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "820px", margin: "-28px auto 0", padding: "0 24px 80px", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "32px", alignItems: "start" }}>

          {/* Content */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
            style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "36px", border: "1px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
          >
            <p style={{ fontSize: "0.975rem", color: "#4b5563", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {item.content}
            </p>
          </motion.div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Meta */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
              style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #f0f0f0" }}
            >
              <h3 style={{ fontSize: "0.8rem", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.06em", marginBottom: "14px" }}>DETAILS</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Category</span>
                  <span style={{ backgroundColor: catStyle.bg, color: catStyle.color, fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>{item.category}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Published</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#0d0b08" }}>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                {item.is_pinned && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Status</span>
                    <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.72rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Pin size={10} /> Pinned
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Related */}
            {related.length > 0 && (
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
                style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #f0f0f0" }}
              >
                <h3 style={{ fontSize: "0.8rem", fontWeight: "700", color: "#9ca3af", letterSpacing: "0.06em", marginBottom: "14px" }}>RELATED</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {related.map((r) => (
                    <Link key={r.id} href={`/announcements/${r.id}`} style={{ textDecoration: "none" }}>
                      <motion.div whileHover={{ x: 3, backgroundColor: "#f0f9f7" }}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", backgroundColor: "#f9fafb", transition: "background-color 0.2s", cursor: "pointer" }}
                      >
                        <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{r.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                          <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "2px" }}>{r.category}</p>
                        </div>
                        <ArrowRight size={13} style={{ color: "#d1d5db", flexShrink: 0 }} />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
              style={{ borderRadius: "16px", background: "linear-gradient(135deg, #0d0b08, #2e8673)", padding: "22px", textAlign: "center" }}
            >
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", marginBottom: "6px" }}>Want to get involved?</p>
              <p style={{ color: "#ffffff", fontSize: "0.95rem", fontWeight: "700", marginBottom: "14px" }}>Join an upcoming event</p>
              <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#ffffff", color: "#2e8673", fontSize: "0.8rem", fontWeight: "700", padding: "9px 18px", borderRadius: "10px", textDecoration: "none" }}>
                Browse Events <ArrowRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}