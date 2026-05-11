"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, TrendingUp, Award, Activity, ArrowUpRight } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

interface DashData {
  totalMembers:       number;
  activeEvents:       number;
  certificatesIssued: number;
  pendingApps:        number;
  pointsDistributed:  number;
  totalCheckins:      number;
  eventsThisMonth:    number;
  avgAttendance:      number;
  monthlyCheckins:    { month: string; attendance: number }[];
  recentActivity:     { action: string; user: string; time: string }[];
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

function shortNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const [data,    setData]    = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    try {
      const [usersRes, eventsRes, certsRes, appsRes, checkinsRes, pointsRes, notifsRes] = await Promise.all([
        api.get("/api/auth/admin/users/"),
        api.get("/api/events/admin/"),
        api.get("/api/certificates/admin/"),
        api.get("/api/events/admin/applications/"),
        api.get("/api/attendance/admin/checkins/"),
        api.get("/api/points/admin/leaderboard/"),
        api.get("/api/notifications/"),
      ]);

const users       = usersRes.data.results    ?? [];
const events      = eventsRes.data.results   ?? [];
const certs       = certsRes.data.results    ?? [];
const apps        = appsRes.data.results     ?? [];
const checkins    = checkinsRes.data.results ?? [];
const notifs      = notifsRes.data.results   ?? [];

        // Points total across all users
        const leaderboard = pointsRes.data.leaderboard ?? [];
        const totalPoints  = leaderboard.reduce((sum: number, u: any) => sum + (u.total_points || 0), 0);

        // Active events (upcoming + open)
        const activeEvents = events.filter((e: any) => ["upcoming", "open"].includes(e.status)).length;

        // Events this month
        const now       = new Date();
        const thisMonth = events.filter((e: any) => {
          const d = new Date(e.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        // Monthly checkin chart — last 6 months
        const monthlyMap: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          monthlyMap[key] = 0;
        }
        checkins.forEach((c: any) => {
          const d   = new Date(c.checked_in_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (key in monthlyMap) monthlyMap[key]++;
        });
        const monthlyCheckins = Object.entries(monthlyMap).map(([key, count]) => {
          const [year, month] = key.split("-").map(Number);
          return { month: MONTH_LABELS[month], attendance: count };
        });

        // Avg attendance
        const totalEventCount = events.filter((e: any) => e.status !== "archived").length;
        const avgAttendance   = totalEventCount > 0 ? Math.round(checkins.length / totalEventCount) : 0;

        // Recent activity from notifications (most recent 5)
        const recentActivity = notifs.slice(0, 5).map((n: any) => ({
          action: n.title,
          user:   "MENA Club",
          time:   timeAgo(n.created_at),
        }));

        setData({
          totalMembers:       users.length,
          activeEvents,
          certificatesIssued: certs.filter((c: any) => c.status === "issued").length,
          pendingApps:        apps.filter((a: any) => a.status === "pending").length,
          pointsDistributed:  totalPoints,
          totalCheckins:      checkins.length,
          eventsThisMonth:    thisMonth,
          avgAttendance,
          monthlyCheckins,
          recentActivity,
        });
      } catch {
        // fail silently — keep nulls
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { icon: Users,       label: "Total Members",       value: loading ? "—" : String(data?.totalMembers ?? 0),       change: null },
    { icon: Calendar,    label: "Active Events",        value: loading ? "—" : String(data?.activeEvents ?? 0),       change: null },
    { icon: TrendingUp,  label: "Total Check-ins",      value: loading ? "—" : String(data?.totalCheckins ?? 0),      change: null },
    { icon: Award,       label: "Certificates Issued",  value: loading ? "—" : String(data?.certificatesIssued ?? 0), change: null },
  ];

  const eventMetrics = [
    { label: "Events This Month",    value: loading ? "—" : String(data?.eventsThisMonth ?? 0) },
    { label: "Avg Attendance",       value: loading ? "—" : String(data?.avgAttendance ?? 0) },
    { label: "Points Distributed",   value: loading ? "—" : shortNum(data?.pointsDistributed ?? 0) },
    { label: "Pending Applications", value: loading ? "—" : String(data?.pendingApps ?? 0) },
  ];

  const chartData    = data?.monthlyCheckins ?? [];
  const maxAttendance = Math.max(...chartData.map((d) => d.attendance), 1);

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0d0b08", letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Platform overview and analytics.</p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {stats.map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
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

        {/* Chart + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08", marginBottom: "24px" }}>Check-ins — Last 6 Months</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "160px" }}>
              {loading ? (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "auto" }}>Loading...</p>
              ) : chartData.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: "auto" }}>No data yet.</p>
              ) : chartData.map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "500" }}>{d.attendance}</span>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.attendance / maxAttendance) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                      whileHover={{ backgroundColor: "#2e8673" }}
                      style={{ width: "100%", backgroundColor: "rgba(46,134,115,0.6)", borderRadius: "6px 6px 0 0", cursor: "default", transition: "background-color 0.2s", minHeight: "4px" }}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{d.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>Recent Activity</h2>
            {loading ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "20px 0" }}>Loading...</p>
            ) : (data?.recentActivity ?? []).length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "20px 0" }}>No recent activity.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(data?.recentActivity ?? []).map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                    whileHover={{ x: 4, backgroundColor: "#f0f9f7" }}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", backgroundColor: "#f9fafb", cursor: "default", transition: "background-color 0.2s" }}
                  >
                    <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Activity size={16} style={{ color: "#2e8673" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.action}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{a.user}</p>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#9ca3af", flexShrink: 0 }}>{a.time}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Event Metrics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>Event Metrics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {eventMetrics.map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ scale: 1.03, backgroundColor: "#f0f9f7" }}
                style={{ textAlign: "center", padding: "20px", borderRadius: "14px", backgroundColor: "#f9fafb", cursor: "default", transition: "background-color 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0d0b08" }}>{m.value}</p>
                  <ArrowUpRight size={14} style={{ color: "#2e8673" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "6px" }}>{m.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}