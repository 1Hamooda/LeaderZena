"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, KeyRound, Loader } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

export default function VolunteerCheckin() {
  const [code,       setCode]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState<{ event: string; checked_in_at: string } | null>(null);
  const [error,      setError]      = useState("");

  async function handleCheckin() {
    if (!code.trim()) { setError("Please enter a code."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/attendance/checkin/", { code: code.trim().toUpperCase() });
      setSuccess({ event: data.event, checked_in_at: data.checked_in_at });
      setCode("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to check in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(null);
    setError("");
    setCode("");
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "480px", margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Event Check-in</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Enter the code provided by the event organizer.</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* Success state */}
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "40px", border: "1px solid #f0f0f0", textAlign: "center" }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
              >
                <CheckCircle size={36} style={{ color: "#15803d" }} />
              </motion.div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0d0b08", marginBottom: "8px" }}>
                Checked In! 🎉
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "6px" }}>
                You&apos;re now checked in to
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "#2e8673", marginBottom: "24px" }}>
                {success.event}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "28px" }}>
                {new Date(success.checked_in_at).toLocaleString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </p>
              <AnimatedButton
                variant="outline"
                onClick={handleReset}
                style={{ padding: "10px 24px", fontSize: "0.875rem", borderRadius: "12px" }}
              >
                Check in to another event
              </AnimatedButton>
            </motion.div>
          ) : (

            /* Code entry form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", border: "1px solid #f0f0f0" }}
            >
              {/* Icon */}
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                <KeyRound size={26} style={{ color: "#2e8673" }} />
              </div>

              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Event Code
              </label>

              {/* Code input */}
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheckin()}
                placeholder="e.g. AB3XY7K"
                maxLength={10}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  border: `2px solid ${error ? "#fca5a5" : "#e5e7eb"}`,
                  borderRadius: "14px",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  letterSpacing: "0.25em",
                  outline: "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "#2e8673"; }}
                onBlur={(e)  => { if (!error) e.target.style.borderColor = "#e5e7eb"; }}
              />

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "8px", fontWeight: "500" }}
                >
                  {error}
                </motion.p>
              )}

              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "8px" }}>
                The code is not case-sensitive. Press Enter or click the button below.
              </p>

              <AnimatedButton
                variant="primary"
                onClick={handleCheckin}
                disabled={loading || !code.trim()}
                style={{ width: "100%", padding: "13px", fontSize: "0.95rem", borderRadius: "14px", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Checking in...
                  </>
                ) : (
                  <><CheckCircle size={16} /> Check In</>
                )}
              </AnimatedButton>

              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}