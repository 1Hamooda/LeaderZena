"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Star, Zap, Target, TrendingUp, Calendar, Award, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

interface LeaderboardEntry {
  rank:            number;
  user_id:         number;
  name:            string;
  email:           string;
  total_points:    number;
  level:           string;
  events_attended: number;
}

interface MyRank {
  rank:            number;
  total_points:    number;
  level:           string;
  next_milestone:  number;
  points_to_next:  number;
  events_attended: number;
  total_users:     number;
}

const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Diamond:  { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  Platinum: { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  Gold:     { bg: "#fefce8", color: "#b45309", border: "#fde68a" },
  Silver:   { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  Bronze:   { bg: "#fdf7f0", color: "#92400e", border: "#fcd9a0" },
};

const LEVEL_GRADIENT: Record<string, string> = {
  Diamond:  "linear-gradient(135deg, #7c3aed, #a78bfa)",
  Platinum: "linear-gradient(135deg, #0891b2, #38bdf8)",
  Gold:     "linear-gradient(135deg, #b45309, #fbbf24)",
  Silver:   "linear-gradient(135deg, #475569, #94a3b8)",
  Bronze:   "linear-gradient(135deg, #92400e, #d97706)",
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown size={16} style={{ color: "#f59e0b" }} />;
  if (rank === 2) return <Medal size={16} style={{ color: "#94a3b8" }} />;
  if (rank === 3) return <Medal size={16} style={{ color: "#b45309" }} />;
  return <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#9ca3af", width: "16px", textAlign: "center", display: "inline-block" }}>{rank}</span>;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank,      setMyRank]      = useState<MyRank | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lbRes, rankRes] = await Promise.all([
          api.get("/api/points/leaderboard/"),
          api.get("/api/points/my-rank/"),
        ]);
        setLeaderboard(lbRes.data.leaderboard ?? []);
        setMyRank(rankRes.data);
      } catch { /* not logged in or no data */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const progress = myRank
    ? Math.min(Math.round(((myRank.next_milestone - myRank.points_to_next) / myRank.next_milestone) * 100), 100)
    : 0;
  const levelCfg = myRank ? (LEVEL_COLORS[myRank.level] ?? LEVEL_COLORS.Bronze) : LEVEL_COLORS.Bronze;

  return (
    /* Outer page — light grey background, symmetric vertical padding */
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh", padding: "48px 0" }}>
      {/* Centered container */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", display: "flex", flexDirection: "column", gap: "32px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#f0f9f7", padding: "6px 16px", borderRadius: "20px", marginBottom: "14px" }}>
            <Trophy size={15} style={{ color: "#2e8673" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2e8673" }}>MENA Points League</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#0d0b08", letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Leaderboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: "500px", margin: "0 auto", lineHeight: "1.7" }}>
            Earn points by attending events, completing tasks, and contributing to the community.
            Climb the ranks and unlock exclusive rewards!
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>Loading leaderboard...</div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "16px" }}>

                {/* 2nd */}
                <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "200px" }}>
                  <PodiumCard entry={topThree[1]} size="md" />
                  <div style={{ width: "100%", height: "32px", backgroundColor: "#e2e8f0", borderRadius: "0 0 10px 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700", color: "#475569" }}>
                    2nd
                  </div>
                </motion.div>

                {/* 1st */}
                <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "240px" }}>
                  <div style={{ backgroundColor: "#fef9c3", borderRadius: "50%", padding: "8px", marginBottom: "8px" }}>
                    <Crown size={22} style={{ color: "#b45309" }} />
                  </div>
                  <PodiumCard entry={topThree[0]} size="lg" />
                  <div style={{ width: "100%", height: "48px", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", borderRadius: "0 0 10px 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "800", color: "#78350f" }}>
                    1st
                  </div>
                </motion.div>

                {/* 3rd */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "200px" }}>
                  <PodiumCard entry={topThree[2]} size="md" />
                  <div style={{ width: "100%", height: "20px", backgroundColor: "#fed7aa", borderRadius: "0 0 10px 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: "700", color: "#92400e" }}>
                    3rd
                  </div>
                </motion.div>
              </div>
            )}

            {/* Two-column layout — rankings + sidebar */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>

              {/* Rankings list */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <TrendingUp size={17} style={{ color: "#2e8673" }} />
                    <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08" }}>All Rankings</h2>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "3px 10px", borderRadius: "20px" }}>
                    This Month
                  </span>
                </div>

                <div style={{ padding: "8px" }}>
                  {leaderboard.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "0.875rem" }}>No data yet.</div>
                  ) : leaderboard.map((entry, i) => {
                    const lc     = LEVEL_COLORS[entry.level] ?? LEVEL_COLORS.Bronze;
                    const isTop3 = entry.rank <= 3;
                    const isMe   = myRank && entry.rank === myRank.rank;
                    return (
                      <motion.div key={entry.user_id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                        whileHover={{ backgroundColor: isMe ? "#f0f9f7" : "#f9fafb" }}
                        style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "12px", marginBottom: "2px", transition: "background-color 0.15s", backgroundColor: isMe ? "#f0fdf4" : "transparent", border: isMe ? "1px solid #d1fae5" : "1px solid transparent" }}>

                        <div style={{ width: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {getRankIcon(entry.rank)}
                        </div>

                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: isTop3 ? (LEVEL_GRADIENT[entry.level] ?? LEVEL_GRADIENT.Bronze) : "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.75rem", fontWeight: "800", flexShrink: 0 }}>
                          {getInitials(entry.name)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {entry.name}
                            </p>
                            {isMe && (
                              <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#2e8673", backgroundColor: "#f0f9f7", padding: "1px 7px", borderRadius: "20px", flexShrink: 0 }}>
                                You
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "0.72rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                            <Calendar size={10} /> {entry.events_attended} events
                          </p>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0d0b08" }}>{entry.total_points.toLocaleString()}</p>
                          <p style={{ fontSize: "0.65rem", color: "#9ca3af" }}>pts</p>
                        </div>

                        <span style={{ fontSize: "0.68rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, flexShrink: 0 }}>
                          {entry.level}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Your Progress */}
                {myRank && (
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                      <Target size={16} style={{ color: "#2e8673" }} />
                      <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0d0b08" }}>Your Progress</h3>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.85rem", fontWeight: "800", flexShrink: 0 }}>
                        #{myRank.rank}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0d0b08" }}>Rank #{myRank.rank} of {myRank.total_users}</p>
                        <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", backgroundColor: levelCfg.bg, color: levelCfg.color, border: `1px solid ${levelCfg.border}` }}>
                          {myRank.level}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Next Milestone</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#0d0b08" }}>
                          {myRank.total_points.toLocaleString()} / {myRank.next_milestone.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                          style={{ height: "100%", background: "linear-gradient(90deg, #2e8673, #469d8b)", borderRadius: "4px" }} />
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "5px" }}>
                        {myRank.points_to_next} points to next level
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[
                        { label: "Events",  value: String(myRank.events_attended) },
                        { label: "Points",  value: myRank.total_points.toLocaleString() },
                      ].map((s) => (
                        <div key={s.label} style={{ backgroundColor: "#f9fafb", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                          <p style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0d0b08" }}>{s.value}</p>
                          <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* How to Earn Points */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                  style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "24px", border: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Zap size={16} style={{ color: "#f59e0b" }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0d0b08" }}>How to Earn Points</h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { icon: Calendar,   label: "Attend an event",      points: "+100 pts" },
                      { icon: Star,       label: "Complete a task",       points: "+50 pts" },
                      { icon: Award,      label: "Volunteer at an event", points: "+150 pts" },
                      { icon: TrendingUp, label: "Refer a new member",    points: "+75 pts" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <item.icon size={14} style={{ color: "#2e8673" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "#374151" }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#2e8673", backgroundColor: "#f0f9f7", padding: "2px 8px", borderRadius: "20px" }}>
                          {item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA Banner */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  style={{ background: "linear-gradient(135deg, #2e8673 0%, #211f21 100%)", borderRadius: "20px", padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Star size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ fontWeight: "700", color: "#ffffff", marginBottom: "6px", fontSize: "0.95rem" }}>
                        {myRank ? "Keep going!" : "Start earning points!"}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", lineHeight: "1.6", marginBottom: "16px" }}>
                        {myRank
                          ? `You are only ${myRank.points_to_next} points away from the next level. Attend one more event to level up!`
                          : "Attend events and contribute to the community to earn points and climb the leaderboard."}
                      </p>
                      <Link href="/events">
                        <AnimatedButton variant="outline"
                          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.3)", padding: "8px 16px", fontSize: "0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                          Browse Events <ChevronRight size={13} />
                        </AnimatedButton>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ entry, size }: { entry: LeaderboardEntry; size: "lg" | "md" }) {
  const lc   = LEVEL_COLORS[entry.level] ?? LEVEL_COLORS.Bronze;
  const grad = LEVEL_GRADIENT[entry.level] ?? LEVEL_GRADIENT.Bronze;
  const isLg = size === "lg";
  const av   = isLg ? 72 : 60;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ width: "100%", backgroundColor: "#ffffff", borderRadius: "16px 16px 0 0", padding: isLg ? "24px 20px" : "20px 16px", border: "1px solid #f0f0f0", borderBottom: "none", boxShadow: isLg ? "0 8px 32px rgba(0,0,0,0.08)" : "0 4px 16px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ width: av, height: av, borderRadius: "50%", background: grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: isLg ? "1.1rem" : "0.9rem", fontWeight: "800", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
        {getInitials(entry.name)}
      </div>
      <p style={{ fontSize: isLg ? "0.95rem" : "0.875rem", fontWeight: "700", color: "#0d0b08", textAlign: "center", marginTop: "4px" }}>{entry.name}</p>
      <p style={{ fontSize: isLg ? "1.5rem" : "1.25rem", fontWeight: "900", color: "#0d0b08" }}>{entry.total_points.toLocaleString()}</p>
      <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "-4px" }}>points</p>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", backgroundColor: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>
        {entry.level}
      </span>
      {entry.events_attended > 0 && (
        <span style={{ fontSize: "0.68rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "3px" }}>
          <Calendar size={10} /> {entry.events_attended} events
        </span>
      )}
    </motion.div>
  );
}