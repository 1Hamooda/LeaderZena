"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Award, ArrowRight, Bell } from "lucide-react";
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

interface Certificate {
  id:          number;
  uuid:        string;
  event_title: string;
  event_date:  string;
  status:      string;
  issued_at:   string;
  download_url: string;
}

interface Notification {
  id:         number;
  title:      string;
  message:    string;
  is_read:    boolean;
  created_at: string;
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

export default function VolunteerDashboard() {
  const [user,          setUser]          = useState<User | null>(null);
  const [certificates,  setCertificates]  = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [userData, certsData, notifsData] = await Promise.all([
          getMe(),
          api.get("/api/certificates/"),
          api.get("/api/notifications/"),
        ]);
        setUser(userData);
        setCertificates(certsData.data);
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
    { icon: Calendar,    label: "Events Volunteered", value: "—",                change: null },
    { icon: Clock,       label: "Hours Contributed",  value: "—",                change: null },
    { icon: Award,       label: "Certificates",       value: certificates.length, change: null },
    { icon: Bell,        label: "Notifications",      value: unreadCount,         change: unreadCount > 0 ? `${unreadCount} unread` : null },
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
              Welcome back, {loading ? "..." : user?.first_name} 🌟
            </h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Here&apos;s your volunteer overview.</p>
          </div>
          <Link href="/volunteer/checkin">
            <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle size={15} /> Check-in Now
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

          {/* Certificates */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08" }}>Certificates</h2>
              <Link href="/volunteer/certificates" style={{ fontSize: "0.8rem", color: "#2e8673", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: "500" }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <Award size={28} style={{ color: "#d1d5db", margin: "0 auto 8px" }} />
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No certificates yet. Attend events to earn them!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {certificates.slice(0, 3).map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: "#f0f9f7" }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", backgroundColor: "#f9fafb", transition: "background-color 0.2s" }}
                  >
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{cert.event_title}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>{timeAgo(cert.issued_at)}</p>
                    </div>
                    <a
                      href={`http://localhost:8000${cert.download_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontWeight: "700", fontSize: "0.75rem", padding: "4px 10px", borderRadius: "20px", textDecoration: "none" }}
                    >
                      Download
                    </a>
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
              <Link href="/volunteer/notifications" style={{ fontSize: "0.8rem", color: "#2e8673", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: "500" }}>
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
          style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
        >
          <Link href="/volunteer/events">
            <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>My Events</AnimatedButton>
          </Link>
          <Link href="/volunteer/checkin">
            <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Check-in</AnimatedButton>
          </Link>
          <Link href="/volunteer/certificates">
            <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Certificates</AnimatedButton>
          </Link>
          <Link href="/volunteer/profile">
            <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Edit Profile</AnimatedButton>
          </Link>
        </motion.div>

      </div>
    </PageWrapper>
  );
}