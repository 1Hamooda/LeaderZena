"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import { getDashboardStats, getLeaderboard } from "@/services/analyticsService";
import type { DashboardStats, LeaderboardEntry } from "@/services/analyticsService";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function AdminReports() {
  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading,     setLoading]     = useState(true);

  // ── Load real data from backend ────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, leaderboardData] = await Promise.all([
          getDashboardStats(),
          getLeaderboard(5),
        ]);
        setStats(statsData);
        setLeaderboard(leaderboardData);
      } catch {
        // keep loading false on error
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = stats ? [
    { label: "Active Members",    value: stats.total_members.toLocaleString()      },
    { label: "Volunteers",        value: stats.total_volunteers.toLocaleString()   },
    { label: "Events Held",       value: stats.total_events.toLocaleString()       },
    { label: "Certificates",      value: stats.total_certificates.toLocaleString() },
  ] : [];

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading analytics...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Reports & Analytics</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Live stats from the database.</p>
          </div>
          <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Download size={14} /> Export CSV
          </AnimatedButton>
        </motion.div>

        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {metrics.map((m, i) => (
            <motion.div key={m.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(46,134,115,0.08)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
            >
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>{m.label}</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Members */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>Top Members by Points</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {leaderboard.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No data yet.</p>
            ) : leaderboard.map((m, i) => (
              <motion.div key={m.email} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                whileHover={{ x: 4, backgroundColor: "#f0f9f7" }}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", backgroundColor: "#f9fafb", transition: "background-color 0.2s" }}
              >
                <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2e8673", width: "32px" }}>#{m.rank}</span>
                <div style={{ height: "36px", width: "36px", borderRadius: "50%", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", color: "#2e8673", fontSize: "0.75rem", fontWeight: "700", flexShrink: 0 }}>
                  {m.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{m.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{m.email}</p>
                </div>
                <span style={{ fontWeight: "800", color: "#2e8673", fontSize: "0.95rem" }}>{m.total_points} pts</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}