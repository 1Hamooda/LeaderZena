"use client";

import { motion } from "framer-motion";
import { Send, Users, Bell } from "lucide-react";
import { useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const targetOptions = [
  { label: "All Members",    value: "members" },
  { label: "All Volunteers", value: "volunteers" },
  { label: "Everyone",       value: "all" },
];

const typeOptions = [
  { label: "General Update",  value: "general" },
  { label: "Event Reminder",  value: "event" },
  { label: "Announcement",    value: "announcement" },
  { label: "Urgent Notice",   value: "general" },
];

export default function AdminSendNotifications() {
  const [target,   setTarget]   = useState("");
  const [type,     setType]     = useState("general");
  const [title,    setTitle]    = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState("");
  const [error,    setError]    = useState("");
  const [preview,  setPreview]  = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function handleSend() {
    setError("");

    if (!target) {
      setError("Please select a target group.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/notifications/admin/send/", {
        target,
        type,
        title:   title.trim(),
        message: message.trim(),
      });
      showToast(data.message);
      // Reset form
      setTarget("");
      setTitle("");
      setMessage("");
      setType("general");
      setPreview(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: "fixed", top: "24px", right: "24px", zIndex: 100,
              backgroundColor: "#0d0b08", color: "#ffffff",
              padding: "12px 20px", borderRadius: "12px",
              fontSize: "0.875rem", fontWeight: "500",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {toast}
          </motion.div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Send Notifications</h1>
          
        </motion.div>

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #f0f0f0", flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Error */}
            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Target Group — radio style */}
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "12px" }}>
                Target Group
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {targetOptions.map((opt, i) => (
                  <motion.label
                    key={opt.value}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                    whileHover={{ backgroundColor: "#f0f9f7", borderColor: "#2e8673" }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
                      border: `1px solid ${target === opt.value ? "#2e8673" : "#e5e7eb"}`,
                      backgroundColor: target === opt.value ? "#f0f9f7" : "#ffffff",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="target"
                      value={opt.value}
                      checked={target === opt.value}
                      onChange={() => setTarget(opt.value)}
                      style={{ accentColor: "#2e8673" }}
                    />
                    <Users size={16} style={{ color: target === opt.value ? "#2e8673" : "#6b7280" }} />
                    <span style={{ fontSize: "0.875rem", color: target === opt.value ? "#2e8673" : "#374151", fontWeight: target === opt.value ? "600" : "400" }}>
                      {opt.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Notification Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
              >
                {typeOptions.map((t) => (
                  <option key={t.label} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Important Update"
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Message */}
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your notification message..."
                rows={4}
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = "#2e8673")}
                onBlur={(e)  => (e.target.style.borderColor = "#d1d5db")}
              />
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px", textAlign: "right" }}>
                {message.length} characters
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <AnimatedButton
                variant="primary"
                disabled={loading}
                onClick={handleSend}
                style={{ padding: "12px 24px", fontSize: "0.95rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Send size={15} /> {loading ? "Sending..." : "Send Notification"}
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                onClick={() => setPreview((p) => !p)}
                style={{ padding: "12px 24px", fontSize: "0.95rem", borderRadius: "12px" }}
              >
                {preview ? "Hide Preview" : "Preview"}
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Preview panel */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              style={{ width: "280px", flexShrink: 0 }}
            >
              <p style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6b7280", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Preview
              </p>
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "18px 20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div style={{ height: "40px", width: "40px", borderRadius: "12px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bell size={20} style={{ color: "#2e8673" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: "700", fontSize: "0.875rem", color: "#0d0b08", marginBottom: "4px" }}>
                    {title || "Notification title"}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: "1.5" }}>
                    {message || "Your message will appear here..."}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>Just now</p>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "10px" }}>
                Sending to: <strong>{targetOptions.find((t) => t.value === target)?.label || "No group selected"}</strong>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}