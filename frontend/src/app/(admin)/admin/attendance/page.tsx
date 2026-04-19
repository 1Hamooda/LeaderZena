"use client";

import { motion } from "framer-motion";
import { Key, RefreshCw, Copy, CheckCircle } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const codes = [
  { event: "Youth Leadership Summit", code: "MENA-2026-XY7K", created: "Mar 24", checkins: 42, total: 50 },
  { event: "Tech Hackathon", code: "MENA-2026-H4CK", created: "Apr 9", checkins: 0, total: 30 },
];

const checkins = [
  { name: "Ahmad Khalil", event: "Leadership Summit", time: "9:02 AM", status: "approved" },
  { name: "Layla Mohammed", event: "Leadership Summit", time: "9:05 AM", status: "approved" },
  { name: "Omar Hassan", event: "Leadership Summit", time: "9:12 AM", status: "approved" },
  { name: "Fatima Al-Sayed", event: "Leadership Summit", time: "9:15 AM", status: "pending" },
];

const statusStyles: Record<string, { bg: string; color: string }> = {
  approved: { bg: "#dcfce7", color: "#15803d" },
  pending:  { bg: "#fef9c3", color: "#a16207" },
};

export default function AdminAttendance() {
  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Attendance Management</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Generate codes and monitor check-ins.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Generate Code */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Key size={18} style={{ color: "#2e8673" }} /> Generate Code
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <select style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}>
                <option>Select event</option>
                <option>Youth Leadership Summit</option>
                <option>Tech Hackathon</option>
                <option>Community Clean-up</option>
              </select>
              <AnimatedButton variant="primary" fullWidth style={{ padding: "12px", fontSize: "0.875rem", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <RefreshCw size={14} /> Generate New Code
              </AnimatedButton>
            </div>
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {codes.map((c, i) => (
                <motion.div key={c.code} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f9fafb" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0d0b08" }}>{c.event}</p>
                    <span style={{ backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.75rem", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>{c.checkins}/{c.total}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <code style={{ flex: 1, backgroundColor: "#ffffff", padding: "8px 12px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.875rem", letterSpacing: "0.1em", border: "1px solid #e5e7eb" }}>{c.code}</code>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#f0f9f7", color: "#2e8673", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Copy size={14} />
                    </motion.button>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "8px" }}>Created: {c.created}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live Check-ins */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f0f0f0" }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={18} style={{ color: "#2e8673" }} /> Live Check-ins
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                  {["Volunteer", "Time", "Status"].map((h) => (
                    <th key={h} style={{ padding: "8px 0", textAlign: "left", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkins.map((c, i) => (
                  <motion.tr key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                    whileHover={{ backgroundColor: "#e9e2e2" }}
                    style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s" }}
                  >
                    <td style={{ padding: "12px 0", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{c.name}</td>
                    <td style={{ padding: "12px 0", fontSize: "0.875rem", color: "#6b7280" }}>{c.time}</td>
                    <td style={{ padding: "12px 0" }}>
                      <span style={{ backgroundColor: statusStyles[c.status].bg, color: statusStyles[c.status].color, fontSize: "0.72rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}