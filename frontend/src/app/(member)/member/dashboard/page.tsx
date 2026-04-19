"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Award, Star, TrendingUp, ArrowRight, Sparkles, Bell } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import { getMe } from "@/services/authService";
import api from "@/services/api";
import type { User } from "@/services/authService";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: "#fef9c3", color: "#a16207", label: "Pending" },
  approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
};

interface Notification {
  id:         number;
  type:       string;
  title:      string;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

interface PointsData {
  total:    number;
  breakdown: Record<string, number>;
  history:  { id: number; points: number; reason: string; note: string; event_title: string | null; created_at: string }[];
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return "Just now";
}

export default function MemberDashboard() {
  const [user,          setUser]          = useState<User | null>(null);
  const [points,        setPoints]        = useState<PointsData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [userData, pointsData, notifsData] = await Promise.all([
          getMe(),
          api.get("/api/points/"),
          api.get("/api/notifications/"),
        ]);
        setUser(userData);
        setPoints(pointsData.data);
        setNotifications(notifsData.data.results.slice(0, 3));
        setUnreadCount(notifsData.data.results.filter((n: Notification) => !n.is_read).length);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const stats = [
    { icon: Calendar,   label: "Events Attended", value: "—",                         change: null },
    { icon: Award,      label: "Total Points",     value: points?.total ?? "—",        change: null },
    { icon: Star,       label: "Notifications",    value: unreadCount,                 change: unreadCount > 0 ? `${unreadCount} unread` : null },
    { icon: TrendingUp, label: "Skills",           value: user?.skills?.length ?? "—", change: null },
  ];

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0d0b08", letterSpacing: "-0.02em" }}>
              Welcome back, {loading ? "..." : user?.first_name} 👋
            </h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Here&apos;s an overview of your MENA Club journey.</p>
          </div>
          <Link href="/member/events">
            <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={15} /> Explore Events
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(46,134,115,0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
            >
              <div style={{ height: "40px", width: "40px", borderRadius: "12px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <stat.icon size={20} style={{ color: "#2e8673" }} />
              </div>
              <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>{stat.value}</p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>{stat.label}</p>
              {stat.change && <p style={{ fontSize: "0.75rem", color: "#2e8673", fontWeight: "600", marginTop: "6px" }}>{stat.change}</p>}
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Points History */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08" }}>Points History</h2>
              <p style={{ fontSize: "0.8rem", color: "#2e8673", fontWeight: "700" }}>
                {points?.total ?? 0} pts total
              </p>
            </div>

            {!points || points.history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Award size={28} style={{ color: "#d1d5db", margin: "0 auto 8px" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No points yet. Attend events to earn points!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {points.history.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: "#f0f9f7" }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", backgroundColor: "#f9fafb", transition: "background-color 0.2s" }}
                  >
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>
                        {p.event_title || p.reason.replace(/_/g, " ")}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>{timeAgo(p.created_at)}</p>
                    </div>
                    <span style={{ backgroundColor: p.points >= 0 ? "#f0f9f7" : "#fee2e2", color: p.points >= 0 ? "#2e8673" : "#b91c1c", fontWeight: "700", fontSize: "0.75rem", padding: "4px 10px", borderRadius: "20px" }}>
                      {p.points >= 0 ? "+" : ""}{p.points} pts
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08" }}>Recent Notifications</h2>
              <Link href="/member/notifications" style={{ fontSize: "0.8rem", color: "#2e8673", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: "500" }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Bell size={28} style={{ color: "#d1d5db", margin: "0 auto 8px" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: "#f0f9f7" }}
                    style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", backgroundColor: n.is_read ? "#f9fafb" : "#f0fdf4", transition: "background-color 0.2s", border: n.is_read ? "none" : "1px solid #d1fae5" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span style={{ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: "#2e8673", flexShrink: 0, marginTop: "4px" }} />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08", marginBottom: "16px" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/member/events">
              <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Browse Events</AnimatedButton>
            </Link>
            <Link href="/member/jobs">
              <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>AI Job Match</AnimatedButton>
            </Link>
            <Link href="/member/notifications">
              <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Notifications</AnimatedButton>
            </Link>
            <Link href="/member/profile">
              <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Edit Profile</AnimatedButton>
            </Link>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}