"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Briefcase, Star, ArrowRight } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import PageWrapper from "@/components/ui/PageWrapper";
import { analyzeCv, JobMatch } from "@/services/aiJobService";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function MemberJobs() {
  const [matches, setMatches] = useState<JobMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeCv();
      setMatches(result.matches);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء التحليل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08", display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={24} style={{ color: "#2e8673" }} /> AI Job Recommendations
          </h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>سنحلل سيرتك الذاتية ونقترح أفضل الوظائف المناسبة لك.</p>
        </motion.div>

        {!matches ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", border: "1px solid #f0f0f0", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <p style={{ color: "#374151", fontSize: "0.95rem" }}>
              اضغط على الزر أدناه لتحليل سيرتك الذاتية والحصول على توصيات وظيفية مخصصة من الوظائف المتاحة.
            </p>
            {error && <p style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</p>}
            <AnimatedButton
              variant="primary"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ padding: "12px 24px", fontSize: "0.95rem", borderRadius: "12px", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}
            >
              {loading ? <Loader2 size={16} /> : <Sparkles size={16} />}
              {loading ? "جاري التحليل..." : "تحليل سيرتي الذاتية"}
            </AnimatedButton>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>تم العثور على {matches.length} وظائف مناسبة</p>
              <button onClick={() => setMatches(null)} style={{ fontSize: "0.875rem", color: "#2e8673", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
                تحليل مرة أخرى
              </button>
            </div>

            {matches.map((job, i) => (
              <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={fadeUp}
                whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(46,134,115,0.1)" }}
                style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", border: "1px solid #f0f0f0", display: "flex", alignItems: "flex-start", gap: "16px" }}
              >
                <div style={{ height: "48px", width: "48px", borderRadius: "12px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={22} style={{ color: "#2e8673" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: "700", color: "#0d0b08", fontSize: "0.95rem" }}>{job.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>{job.location} · {job.job_type}</p>
                  <p style={{ fontSize: "0.82rem", color: "#374151", marginTop: "8px", lineHeight: "1.5" }}>{job.reason}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Star size={15} style={{ color: "#2e8673", fill: "#2e8673" }} />
                    <span style={{ fontWeight: "800", color: "#2e8673", fontSize: "1rem" }}>{job.match}%</span>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    <AnimatedButton variant="outline" style={{ padding: "7px 14px", fontSize: "0.8rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      تقدم <ArrowRight size={12} />
                    </AnimatedButton>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
