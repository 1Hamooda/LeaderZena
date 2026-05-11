"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Edit, Archive, Trash2, X, Search, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  upcoming: { bg: "#dbeafe", color: "#1d4ed8" },
  open:     { bg: "#dcfce7", color: "#15803d" },
  closed:   { bg: "#fef9c3", color: "#a16207" },
  archived: { bg: "#f3f4f6", color: "#6b7280" },
};

const categoryOptions = [
  { value: "community",  label: "Community" },
  { value: "social",     label: "Social" },
  { value: "workshop",   label: "Workshop" },
  { value: "conference", label: "Conference" },
  { value: "leadership", label: "Leadership" },
  { value: "other",      label: "Other" },
];

const statusOptions = [
  { value: "upcoming", label: "Upcoming" },
  { value: "open",     label: "Open" },
  { value: "closed",   label: "Closed" },
];

interface Event {
  id:               number;
  title:            string;
  category:         string;
  status:           string;
  emoji:            string;
  image_url:        string | null;
  location:         string;
  date:             string;
  time_start:       string | null;
  time_end:         string | null;
  max_participants: number;
  spots_remaining:  number;
}

interface FormState {
  title:            string;
  description:      string;
  category:         string;
  status:           string;
  emoji:            string;
  location:         string;
  date:             string;
  time_start:       string;
  time_end:         string;
  max_participants: string;
}

const emptyForm: FormState = {
  title: "", description: "", category: "other", status: "upcoming",
  emoji: "📅", location: "", date: "", time_start: "", time_end: "", max_participants: "50",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminEvents() {
  const [events,        setEvents]        = useState<Event[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast,         setToast]         = useState("");
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [showForm,      setShowForm]      = useState(false);
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [form,          setForm]          = useState<FormState>(emptyForm);
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState("");
  const [imageFile,     setImageFile]     = useState<File | null>(null);
  const [imagePreview,  setImagePreview]  = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function fetchEvents() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)       params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/api/events/admin/", { params });
      setEvents(data.results);
    } catch { setError("Failed to load events."); }
    finally   { setLoading(false); }
  }

  useEffect(() => { fetchEvents(); }, [search, statusFilter]);

  function openCreateForm() {
    setForm(emptyForm); setEditingId(null); setFormError("");
    setImageFile(null); setImagePreview(null); setShowForm(true);
  }

  function openEditForm(event: Event) {
    setForm({ title: event.title, description: "", category: event.category, status: event.status,
      emoji: event.emoji, location: event.location, date: event.date,
      time_start: event.time_start || "", time_end: event.time_end || "",
      max_participants: String(event.max_participants) });
    setEditingId(event.id); setFormError("");
    setImageFile(null); setImagePreview(event.image_url || null); setShowForm(true);
    api.get(`/api/events/${event.id}/`).then((res) =>
      setForm((f) => ({ ...f, description: res.data.description || "" })));
  }

  function closeForm() {
    setShowForm(false); setEditingId(null); setForm(emptyForm); setFormError("");
    setImageFile(null); setImagePreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    setFormError("");
    if (!form.title.trim() || !form.location.trim() || !form.date) {
      setFormError("Title, location, and date are required."); return;
    }
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append("title",            form.title.trim());
      fd.append("description",      form.description.trim());
      fd.append("category",         form.category);
      fd.append("status",           form.status);
      fd.append("emoji",            form.emoji);
      fd.append("location",         form.location.trim());
      fd.append("date",             form.date);
      fd.append("max_participants", String(parseInt(form.max_participants) || 50));
      if (form.time_start) fd.append("time_start", form.time_start);
      if (form.time_end)   fd.append("time_end",   form.time_end);
      if (imageFile)       fd.append("image",      imageFile);

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (editingId) {
        const { data } = await api.patch(`/api/events/admin/${editingId}/`, fd, config);
        showToast(data.message);
      } else {
        const { data } = await api.post("/api/events/admin/create/", fd, config);
        showToast(data.message);
      }
      closeForm(); fetchEvents();
    } catch (err: any) {
      const d = err?.response?.data;
      if (d && typeof d === "object") {
        const raw = d[Object.keys(d)[0]];
        const msg = Array.isArray(raw) ? raw[0] : raw;
        setFormError(typeof msg === "string" ? msg : "Failed to save event.");
      } else setFormError("Failed to save event.");
    } finally { setFormLoading(false); }
  }

  async function handleArchive(id: number) {
    setActionLoading(id);
    try { const { data } = await api.post(`/api/events/admin/${id}/archive/`); showToast(data.message); fetchEvents(); }
    catch { showToast("Failed to archive event."); }
    finally { setActionLoading(null); }
  }

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`Permanently delete '${title}'? This cannot be undone.`)) return;
    setActionLoading(id);
    try { await api.delete(`/api/events/admin/${id}/delete/`); showToast("Event deleted."); fetchEvents(); }
    catch { showToast("Failed to delete event."); }
    finally { setActionLoading(null); }
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: "fixed", top: "24px", right: "24px", zIndex: 100, backgroundColor: "#0d0b08", color: "#ffffff", padding: "12px 20px", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "500", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Event Management</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Create, edit, and manage events. FR-A3.</p>
          </div>
          <AnimatedButton variant="primary" onClick={openCreateForm}
            style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={15} /> Create Event
          </AnimatedButton>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
        )}

        {/* Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08" }}>{editingId ? "Edit Event" : "New Event"}</h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", color: "#dc2626", fontSize: "0.8rem", marginBottom: "16px" }}>{formError}</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <AnimatedInput label="Event Title *" placeholder="Event name" value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} />
              <AnimatedInput label="Date *" type="date" value={form.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })} />
              <AnimatedInput label="Location *" placeholder="City, Country" value={form.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, location: e.target.value })} />
              <AnimatedInput label="Max Participants" type="number" placeholder="50" value={form.max_participants}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, max_participants: e.target.value })} />
              <AnimatedInput label="Start Time" type="time" value={form.time_start}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, time_start: e.target.value })} />
              <AnimatedInput label="End Time" type="time" value={form.time_end}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, time_end: e.target.value })} />

              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }}>
                  {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff", boxSizing: "border-box" }}>
                  {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Image upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Event Image <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>
                </label>
                {imagePreview ? (
                  <div style={{ position: "relative", width: "100%", height: "180px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <img src={imagePreview} alt="Event preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={removeImage}
                      style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff" }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ width: "100%", height: "120px", border: "2px dashed #d1d5db", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2e8673")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}>
                    <ImageIcon size={24} style={{ color: "#9ca3af" }} />
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Click to upload an image</p>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the event..." rows={4}
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                  onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <AnimatedButton variant="primary" onClick={handleSave} disabled={formLoading}
                style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>
                {formLoading ? "Saving..." : editingId ? "Update Event" : "Save Event"}
              </AnimatedButton>
              <AnimatedButton variant="outline" onClick={closeForm} disabled={formLoading}
                style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>
                Cancel
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb" }}>
                {["Event", "Date", "Location", "Spots", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>Loading events...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>No events yet. Create your first event.</td></tr>
              ) : events.map((e, i) => {
                const isActioning = actionLoading === e.id;
                return (
                  <motion.tr key={e.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = "#f9fafb")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "transparent")}
                    style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s", opacity: isActioning ? 0.5 : 1 }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {e.image_url ? (
                          <img src={e.image_url} alt={e.title}
                            style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                            {e.emoji}
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{e.title}</p>
                          <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "capitalize" }}>{e.category}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{formatDate(e.date)}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{e.location}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{e.spots_remaining}/{e.max_participants}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ backgroundColor: statusStyles[e.status]?.bg || "#f3f4f6", color: statusStyles[e.status]?.color || "#6b7280", fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                        <Link href={`/admin/events/${e.id}/applications`} title="View applications">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            style={{ height: "32px", padding: "0 10px", borderRadius: "8px", border: "none", backgroundColor: "#dbeafe", color: "#1d4ed8", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}>
                            Apps
                          </motion.button>
                        </Link>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => openEditForm(e)} disabled={isActioning} title="Edit"
                          style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Edit size={15} />
                        </motion.button>
                        {e.status !== "archived" && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleArchive(e.id)} disabled={isActioning} title="Archive"
                            style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Archive size={15} />
                          </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(e.id, e.title)} disabled={isActioning} title="Delete"
                          style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {!loading && events.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right" }}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </PageWrapper>
  );
}