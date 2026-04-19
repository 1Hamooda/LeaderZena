"use client";

import { motion } from "framer-motion";
import { Plus, Edit, Archive } from "lucide-react";
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

const events = [
  { id: 1, title: "Youth Leadership Summit", date: "Mar 25", location: "Riyadh", applicants: 85, status: "upcoming" },
  { id: 2, title: "Tech for Good Hackathon", date: "Apr 10", location: "Dubai", applicants: 62, status: "upcoming" },
  { id: 3, title: "Community Clean-up", date: "Feb 15", location: "Amman", applicants: 120, status: "completed" },
  { id: 4, title: "Cultural Exchange Night", date: "Dec 5", location: "Cairo", applicants: 95, status: "archived" },
];

const statusStyles: Record<string, { bg: string; color: string }> = {
  upcoming:  { bg: "#dbeafe", color: "#1d4ed8" },
  completed: { bg: "#dcfce7", color: "#15803d" },
  archived:  { bg: "#f3f4f6", color: "#6b7280" },
};

export default function AdminEvents() {
  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Event Management</h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>Create, edit, and manage events.</p>
          </div>
          <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={15} /> Create Event
          </AnimatedButton>
        </motion.div>

        {/* Create Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px" }}>New Event</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput label="Event Title" placeholder="Event name" />
            <AnimatedInput label="Date" type="date" placeholder="" />
            <AnimatedInput label="Location" placeholder="City, Country" />
            <AnimatedInput label="Max Participants" type="number" placeholder="50" />
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "6px" }}>Description</label>
              <textarea placeholder="Describe the event..." rows={3}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <AnimatedButton variant="primary" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Save Event</AnimatedButton>
            <AnimatedButton variant="outline" style={{ padding: "10px 20px", fontSize: "0.875rem", borderRadius: "12px" }}>Cancel</AnimatedButton>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb" }}>
                {["Event", "Date", "Location", "Applicants", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <motion.tr key={e.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  whileHover={{ backgroundColor: "#e9e2e2" }}
                  style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s" }}
                >
                  <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{e.title}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{e.date}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{e.location}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>{e.applicants}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ backgroundColor: statusStyles[e.status].bg, color: statusStyles[e.status].color, fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Edit size={15} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Archive size={15} /></motion.button>
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