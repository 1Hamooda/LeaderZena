"use client";

import { motion } from "framer-motion";
import { Download, Award, Eye, X } from "lucide-react";
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
  const [previewCert,  setPreviewCert]  = useState<Certificate | null>(null);
  const [blobUrl,      setBlobUrl]      = useState<string | null>(null);
  const [blobLoading,  setBlobLoading]  = useState(false);

  // Load certificates
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

  // Fetch PDF as blob when previewCert changes
  useEffect(() => {
    if (!previewCert) {
      if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
      return;
    }
    async function loadBlob() {
      setBlobLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${API_BASE}/api/certificates/${previewCert!.uuid}/view/`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const blob = await res.blob();
        setBlobUrl(URL.createObjectURL(blob));
      } catch {
        setBlobUrl(null);
      } finally {
        setBlobLoading(false);
      }
    }
    loadBlob();
  }, [previewCert]);

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

        {/* Preview Modal */}
        {previewCert && (
          <div
            onClick={() => setPreviewCert(null)}
            style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "940px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: "600", letterSpacing: "0.06em" }}>CERTIFICATE PREVIEW</p>
                  <p style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08", marginTop: "2px" }}>{previewCert.event_title}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <a
                    href={`${API_BASE}/api/certificates/${previewCert.uuid}/download/`}
                    download
                    style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#2e8673", color: "#ffffff", fontSize: "0.8rem", fontWeight: "700", padding: "8px 14px", borderRadius: "10px", textDecoration: "none" }}
                  >
                    <Download size={13} /> Download
                  </a>
                  <button
                    onClick={() => setPreviewCert(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px", display: "flex" }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* PDF viewer — blob URL avoids cross-origin block */}
              {blobLoading || !blobUrl ? (
                <div style={{ height: "620px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
                  <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading certificate...</p>
                </div>
              ) : (
                <iframe
                  src={blobUrl}
                  style={{ width: "100%", height: "620px", border: "none", backgroundColor: "#f3f4f6" }}
                  title={`Certificate — ${previewCert.event_title}`}
                />
              )}
            </motion.div>
          </div>
        )}

        {/* Header */}
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

        {certificates.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "80px 0" }}>
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

                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: "600" }}>
                      Issued
                    </span>
                    <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e5e7eb", color: "#374151" }}>
                      {formatDate(cert.issued_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "16px" }}>
                    Issued {formatDate(cert.issued_at)}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <AnimatedButton
                      variant="outline"
                      onClick={() => setPreviewCert(cert)}
                      style={{ flex: 1, padding: "9px", fontSize: "0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <Eye size={14} /> Preview
                    </AnimatedButton>
                    <a href={`${API_BASE}/api/certificates/${cert.uuid}/download/`} download style={{ flex: 1, textDecoration: "none" }}>
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