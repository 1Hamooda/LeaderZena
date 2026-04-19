"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, CheckCircle, XCircle, Award, Megaphone, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

// Map backend type → icon + style
const typeConfig: Record<string, { bg: string; color: string; icon: any; badgeBg: string; badgeColor: string; label: string }> = {
  application:  { bg: "#dcfce7", color: "#15803d", icon: CheckCircle, badgeBg: "#dcfce7", badgeColor: "#15803d", label: "Application" },
  event:        { bg: "#f0f9f7", color: "#2e8673", icon: Calendar,    badgeBg: "#f0f9f7", badgeColor: "#2e8673", label: "Event" },
  certificate:  { bg: "#fef9c3", color: "#a16207", icon: Award,       badgeBg: "#fef9c3", badgeColor: "#a16207", label: "Certificate" },
  announcement: { bg: "#ede9fe", color: "#6d28d9", icon: Megaphone,   badgeBg: "#ede9fe", badgeColor: "#6d28d9", label: "Announcement" },
  general:      { bg: "#f0f9f7", color: "#2e8673", icon: Bell,        badgeBg: "",        badgeColor: "",        label: "" },
};

interface Notification {
  id:         number;
  type:       string;
  title:      string;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (mins > 0)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState<"all" | "unread">("all");

  async function fetchNotifications() {
    try {
      const params = filter === "unread" ? { unread: "true" } : {};
      const { data } = await api.get("/api/notifications/", { params });
      setNotifications(data.results);
    } catch {
      // fail silently — show empty state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNotifications(); }, [filter]);

  async function handleMarkRead(id: number) {
    try {
      await api.post(`/api/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await api.post("/api/notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/api/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Notifications</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>
              Stay updated on your applications and activities.
              {unreadCount > 0 && (
                <span style={{ marginLeft: "8px", backgroundColor: "#2e8673", color: "#ffffff", fontSize: "0.75rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead}
              style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", fontSize: "0.8rem", fontWeight: "600", color: "#374151", cursor: "pointer" }}
            >
              Mark all as read
            </motion.button>
          )}
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px" }}>
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 18px", borderRadius: "20px", border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: "600",
                backgroundColor: filter === f ? "#2e8673" : "#f3f4f6",
                color: filter === f ? "#ffffff" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "640px" }}>
          {loading ? (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", padding: "24px 0" }}>Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Bell size={32} style={{ color: "#d1d5db", margin: "0 auto 12px" }} />
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.general;
              const IconComponent = config.icon;
              return (
                <motion.div
                  key={n.id}
                  custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  whileHover={{ x: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px", padding: "18px 20px",
                    border: `1px solid ${n.is_read ? "#f0f0f0" : "#d1fae5"}`,
                    display: "flex", alignItems: "flex-start", gap: "16px",
                    cursor: n.is_read ? "default" : "pointer",
                    opacity: n.is_read ? 0.8 : 1,
                  }}
                >
                  {/* Icon */}
                  <div style={{ height: "40px", width: "40px", borderRadius: "12px", backgroundColor: config.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconComponent size={20} style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ fontWeight: "700", fontSize: "0.875rem", color: "#0d0b08" }}>{n.title}</p>
                      {config.label && (
                        <span style={{ backgroundColor: config.badgeBg, color: config.badgeColor, fontSize: "0.7rem", fontWeight: "600", padding: "2px 8px", borderRadius: "20px" }}>
                          {config.label}
                        </span>
                      )}
                      {!n.is_read && (
                        <span style={{ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: "#2e8673", flexShrink: 0, marginLeft: "auto" }} />
                      )}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: "1.5" }}>{n.message}</p>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>{timeAgo(n.created_at)}</p>
                  </div>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1, color: "#ef4444" }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "4px", flexShrink: 0 }}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </PageWrapper>
  );
}