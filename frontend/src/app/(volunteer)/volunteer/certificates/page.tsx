"use client";

import { motion } from "framer-motion";
import { Download, Award, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

interface Certificate {
  id:           number;
  uuid:         string;
  event_title:  string;
  event_date:   string;
  user_name:    string;
  status:       string;
  issued_at:    string;
  download_url: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VolunteerCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/certificates/");
        setCertificates(data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading certificates...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Certificates</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>
            Download your participation certificates.
            {certificates.length > 0 && (
              <span style={{ marginLeft: "8px", backgroundColor: "#f0f9f7", color: "#2e8673", fontSize: "0.75rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                {certificates.length} earned
              </span>
            )}
          </p>
        </motion.div>

        {/* Empty state */}
        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <Award size={48} style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
            <p style={{ fontSize: "1rem", fontWeight: "600", color: "#374151" }}>No certificates yet</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginTop: "4px" }}>
              Attend events and check in to earn participation certificates.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #f0f0f0" }}
              >
                {/* Certificate Preview */}
                <div style={{ background: "linear-gradient(135deg, #f0f9f7 0%, #e8f5f2 100%)", padding: "32px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ border: "2px solid rgba(46,134,115,0.2)", borderRadius: "16px", padding: "24px", backgroundColor: "rgba(255,255,255,0.8)" }}>
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} style={{ display: "inline-block", marginBottom: "12px" }}>
                      <Award size={40} style={{ color: "#2e8673" }} />
                    </motion.div>
                    <p style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: "4px" }}>Certificate of Participation</p>
                    <p style={{ fontWeight: "700", fontSize: "0.875rem", color: "#0d0b08" }}>MENA Club</p>
                    <p style={{ fontSize: "1rem", fontWeight: "600", color: "#0d0b08", marginTop: "8px" }}>{cert.event_title}</p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "8px" }}>Awarded to {cert.user_name}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: "600" }}>
                      Issued
                    </span>
                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e5e7eb", color: "#374151" }}>
                      {formatDate(cert.event_date)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "16px" }}>
                    Issued {formatDate(cert.issued_at)}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`${API_BASE}${cert.download_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, textDecoration: "none" }}
                    >
                      <AnimatedButton
                        variant="outline"
                        style={{ width: "100%", padding: "9px", fontSize: "0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      >
                        <Eye size={14} /> Preview
                      </AnimatedButton>
                    </a>
                    <a
                      href={`${API_BASE}${cert.download_url}`}
                      download
                      style={{ flex: 1, textDecoration: "none" }}
                    >
                      <AnimatedButton
                        variant="primary"
                        style={{ width: "100%", padding: "9px", fontSize: "0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      >
                        <Download size={14} /> Download
                      </AnimatedButton>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}