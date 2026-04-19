"use client";

import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Send } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const announcements = [
  { id: 1, title: "Summer Volunteer Program Applications Open", status: "active", date: "Mar 5", views: 342 },
  { id: 2, title: "MENA Club Wins Regional Award", status: "active", date: "Mar 1", views: 589 },
  { id: 3, title: "New Partnership with UNDP", status: "active", date: "Feb 25", views: 412 },
  { id: 4, title: "Updated Community Guidelines", status: "archived", date: "Feb 20", views: 267 },
];

export default function AdminAnnouncements() {
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
          <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={15} /> New Announcement
          </AnimatedButton>
        </motion.div>

        {/* Create Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>Create Announcement</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <AnimatedInput label="Title" placeholder="Announcement title" />
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Content</label>
              <textarea placeholder="Write your announcement..." rows={4}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Send size={14} /> Publish
              </AnimatedButton>
              <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Save Draft</AnimatedButton>
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
                {["Title", "Date", "Views", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcements.map((a, i) => (
                <motion.tr key={a.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  whileHover={{ backgroundColor: "#e9e2e2" }}
                  style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s" }}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{a.title}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{a.date}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{a.views}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ backgroundColor: a.status === "active" ? "#dcfce7" : "#f3f4f6", color: a.status === "active" ? "#15803d" : "#6b7280", fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Edit size={15} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={15} /></motion.button>
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