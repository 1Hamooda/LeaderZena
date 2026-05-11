import api from "./api";

// ── Types ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total_members:      number;
  total_volunteers:   number;
  total_users:        number;
  total_events:       number;
  total_checkins:     number;
  total_certificates: number;
}

export interface LeaderboardEntry {
  rank:         number;
  name:         string;
  email:        string;
  total_points: number;
}

// ── Service functions ──────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get("/api/analytics/");
  return data;
}

export async function getLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  const { data } = await api.get(`/api/analytics/leaderboard/?limit=${limit}`);
  return data.leaderboard;
}
