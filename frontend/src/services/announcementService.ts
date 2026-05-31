import api from "./api";

// ── Types ──────────────────────────────────────────────────────────
export interface Announcement {
  id:              number;
  title:           string;
  content:         string;
  category:        "events" | "workshop" | "general";
  status:          "draft" | "published";
  emoji:           string;
  is_pinned:       boolean;
  created_by_name: string | null;
  created_at:      string;
  updated_at:      string;
}

export interface CreateAnnouncementPayload {
  title:     string;
  content:   string;
  category:  "events" | "workshop" | "general";
  status:    "draft" | "published";
  emoji:     string;
  is_pinned: boolean;
}

// ── Public ─────────────────────────────────────────────────────────

export async function getAnnouncements(category?: string): Promise<Announcement[]> {
  const params = category && category !== "All" ? `?category=${category}` : "";
  const { data } = await api.get(`/api/announcements/${params}`);
  return data.results;
}

export async function getAnnouncement(id: number): Promise<Announcement> {
  const { data } = await api.get(`/api/announcements/${id}/`);
  return data;
}

// ── Admin ──────────────────────────────────────────────────────────

export async function adminGetAnnouncements(): Promise<Announcement[]> {
  const { data } = await api.get("/api/announcements/admin/");
  return data.results;
}

export async function adminCreateAnnouncement(payload: CreateAnnouncementPayload): Promise<Announcement> {
  const { data } = await api.post("/api/announcements/admin/create/", payload);
  return data;
}

export async function adminUpdateAnnouncement(id: number, payload: Partial<CreateAnnouncementPayload>): Promise<Announcement> {
  const { data } = await api.patch(`/api/announcements/admin/${id}/`, payload);
  return data;
}

export async function adminDeleteAnnouncement(id: number): Promise<void> {
  await api.delete(`/api/announcements/admin/${id}/delete/`);
}
