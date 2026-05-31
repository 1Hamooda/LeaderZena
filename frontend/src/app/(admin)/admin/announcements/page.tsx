"use client";

import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Send, Pin } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";
import {
  adminGetAnnouncements, adminCreateAnnouncement,
  adminDeleteAnnouncement, adminUpdateAnnouncement,
} from "@/services/announcementService";
import type { Announcement, CreateAnnouncementPayload } from "@/services/announcementService";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const EMOJIS = ["📢", "🌍", "🤝", "📚", "🌟", "🎉", "💡", "🏆"];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [editingId,     setEditingId]     = useState<number | null>(null);

  // ── Form state ─────────────────────────────────────────────────
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState<"events" | "workshop" | "general">("general");
  const [emoji,    setEmoji]    = useState("📢");
  const [isPinned, setIsPinned] = useState(false);

  // ── Load announcements ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await adminGetAnnouncements();
        setAnnouncements(data);
      } catch {
        setError("Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function resetForm() {
    setTitle(""); setContent(""); setCategory("general");
    setEmoji("📢"); setIsPinned(false); setEditingId(null);
  }

  // ── Create or Update ───────────────────────────────────────────
  async function handlePublish(status: "published" | "draft") {
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setSaving(true); setError("");
    try {
      const payload: CreateAnnouncementPayload = { title, content, category, status, emoji, is_pinned: isPinned };
      if (editingId) {
        const updated = await adminUpdateAnnouncement(editingId, payload);
        setAnnouncements((prev) => prev.map((a) => a.id === editingId ? updated : a));
      } else {
        const created = await adminCreateAnnouncement(payload);
        setAnnouncements((prev) => [created, ...prev]);
      }
      resetForm();
    } catch {
      setError("Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    try {
      await adminDeleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete announcement.");
    }
  }

  // ── Edit ───────────────────────────────────────────────────────
  function handleEdit(a: Announcement) {
    setEditingId(a.id); setTitle(a.title); setContent(a.content);
    setCategory(a.category as any); setEmoji(a.emoji); setIsPinned(a.is_pinned);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return (
    <PageWrapper>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Announcements</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Create and manage announcements.</p>
          </div>
          {editingId && (
            <AnimatedButton variant="outline" onClick={resetForm} style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>
              Cancel Edit
            </AnimatedButton>
          )}
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: editingId ? "2px solid #2e8673" : "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <AnimatedInput label="Title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Announcement title" />

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement..." rows={4}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                onFocus={(e) => { e.target.style.borderColor = "#2e8673"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#d1d5db"; }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
                  <option value="general">General</option>
                  <option value="events">Events</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Emoji</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)}
                      style={{ fontSize: "1.3rem", padding: "6px", borderRadius: "8px", border: emoji === e ? "2px solid #2e8673" : "2px solid transparent", backgroundColor: emoji === e ? "#f0f9f7" : "#f9fafb", cursor: "pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}>
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              <Pin size={14} style={{ color: "#2e8673" }} /> Pin this announcement
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <AnimatedButton variant="primary" onClick={() => handlePublish("published")} disabled={saving}
                style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Send size={14} /> {saving ? "Saving..." : "Publish"}
              </AnimatedButton>
              <AnimatedButton variant="outline" onClick={() => handlePublish("draft")} disabled={saving}
                style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>
                Save Draft
              </AnimatedButton>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb" }}>
                {["Title", "Category", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
                    No announcements yet. Create one above!
                  </td>
                </tr>
              ) : announcements.map((a, i) => (
                <motion.tr key={a.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s" }}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>
                    <span style={{ marginRight: "8px" }}>{a.emoji}</span>
                    {a.title}
                    {a.is_pinned && <Pin size={12} style={{ color: "#2e8673", marginLeft: "6px", display: "inline" }} />}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{a.category}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ backgroundColor: a.status === "published" ? "#dcfce7" : "#f3f4f6", color: a.status === "published" ? "#15803d" : "#6b7280", fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                      <motion.button onClick={() => handleEdit(a)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Edit size={15} />
                      </motion.button>
                      <motion.button onClick={() => handleDelete(a.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </PageWrapper>
  );
}