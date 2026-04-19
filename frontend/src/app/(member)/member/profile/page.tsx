"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";
import { getMe, updateProfile } from "@/services/authService";
import type { User } from "@/services/authService";

const allSkills = ["Leadership", "Communication", "Design", "Programming", "Marketing", "Event Planning", "Photography", "Writing"];

function getInitials(user: User | null): string {
  if (!user) return "??";
  return `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
}

export default function MemberProfile() {
  const [user,          setUser]          = useState<User | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [showToast,     setShowToast]     = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  const [uploadedFile,  setUploadedFile]  = useState<string | null>(null);

  // Form fields
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [phone,       setPhone]       = useState("");
  const [city,        setCity]        = useState("");
  const [country,     setCountry]     = useState("");
  const [education,   setEducation]   = useState("");
  const [bio,         setBio]         = useState("");
  const [experience,  setExperience]  = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // ── Load real user data on mount ──────────────────────────────
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
        setFirstName(data.first_name   || "");
        setLastName(data.last_name     || "");
        setPhone(data.phone            || "");
        setCity(data.city              || "");
        setCountry(data.country        || "");
        setEducation(data.education    || "");
        setBio(data.bio                || "");
        setExperience(data.experience  || "");
        setSelectedSkills(data.skills  || []);
      } catch {
        setError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  // ── Save profile ───────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name:  lastName,
        phone,
        city,
        country,
        education,
        bio,
        experience,
        skills: selectedSkills,
      });
      setUser(updated);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Discard — reset to current saved values ────────────────────
  function handleDiscard() {
    if (!user) return;
    setFirstName(user.first_name  || "");
    setLastName(user.last_name    || "");
    setPhone(user.phone           || "");
    setCity(user.city             || "");
    setCountry(user.country       || "");
    setEducation(user.education   || "");
    setBio(user.bio               || "");
    setExperience(user.experience || "");
    setSelectedSkills(user.skills || []);
  }

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading profile...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed", top: "24px", right: "24px", zIndex: 100,
              backgroundColor: "#ffffff", borderRadius: "14px", padding: "14px 20px",
              boxShadow: "0 8px 32px rgba(46,134,115,0.18)", border: "1px solid #dcfce7",
              display: "flex", alignItems: "center", gap: "10px",
            }}
          >
            <div style={{ height: "28px", width: "28px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={14} style={{ color: "#15803d" }} />
            </div>
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0d0b08" }}>Profile saved!</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Your changes have been updated.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0d0b08" }}>Profile & Settings</h1>
          <p style={{ color: "#6b7280", marginTop: "4px", marginBottom: "32px" }}>Manage your account and match with the right opportunities.</p>
        </motion.div>

        {/* Error banner */}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "28px" }}
        >

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ height: "80px", width: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "800", color: "#ffffff", flexShrink: 0, cursor: "pointer", border: "3px solid #e0f2ee" }}
            >
              {getInitials(user)}
            </motion.div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08" }}>{user?.full_name}</p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>{user?.email}</p>
              <AnimatedButton variant="outline" style={{ padding: "8px 16px", fontSize: "0.875rem", borderRadius: "10px" }}>Change Photo</AnimatedButton>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "6px" }}>JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          {/* First + Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput
              label="First Name"
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              placeholder="First name"
            />
            <AnimatedInput
              label="Last Name"
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>

          {/* Phone — read-only email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput
              label="Phone"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              placeholder="+970 5X XXX XXXX"
            />
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Email</label>
              <input
                value={user?.email || ""}
                disabled
                style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "0.875rem", backgroundColor: "#f9fafb", color: "#9ca3af", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* City + Country */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput
              label="City"
              value={city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              placeholder="e.g. Nablus"
            />
            <AnimatedInput
              label="Country"
              value={country}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
              placeholder="e.g. Palestine"
            />
          </div>

          {/* Education */}
          <AnimatedInput
            label="Education"
            value={education}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEducation(e.target.value)}
            placeholder="e.g. BSc Computer Science, An-Najah University"
          />

          {/* Bio */}
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short introduction about yourself..."
              rows={3}
              style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => { e.target.style.borderColor = "#2e8673"; e.target.style.boxShadow = "0 0 0 3px rgba(46,134,115,0.1)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Skills */}
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "12px" }}>Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {allSkills.map((skill, i) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <motion.button
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.04 }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkill(skill)}
                    style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", border: selected ? "1.5px solid #2e8673" : "1.5px solid #e5e7eb", backgroundColor: selected ? "#f0f9f7" : "#ffffff", color: selected ? "#2e8673" : "#6b7280", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
                  >
                    <AnimatePresence>
                      {selected && (
                        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                          <Check size={12} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {skill}
                  </motion.button>
                );
              })}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "8px" }}>
              {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Experience */}
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Experience</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Brief summary of your relevant experience..."
              rows={3}
              style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => { e.target.style.borderColor = "#2e8673"; e.target.style.boxShadow = "0 0 0 3px rgba(46,134,115,0.1)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* CV Upload */}
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Upload CV</label>
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f.name); }}
              onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,.doc,.docx"; input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) setUploadedFile(f.name); }; input.click(); }}
              animate={{ borderColor: dragOver ? "#2e8673" : "#d1d5db", backgroundColor: dragOver ? "#f0f9f7" : "#fafafa" }}
              whileHover={{ backgroundColor: "#f5faf9", borderColor: "#66bdab" }}
              style={{ border: "2px dashed #d1d5db", borderRadius: "14px", padding: "32px", textAlign: "center", cursor: "pointer" }}
            >
              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <div style={{ height: "40px", width: "40px", borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      <Check size={20} style={{ color: "#15803d" }} />
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#15803d" }}>{uploadedFile}</p>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px" }}>Click to replace</p>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Upload size={32} style={{ color: "#9ca3af", margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Drag & drop your CV, or <span style={{ color: "#2e8673", fontWeight: "600" }}>browse</span></p>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px" }}>PDF, DOC. Max 5MB.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid #f0f0f0" }}>
            <AnimatedButton
              variant="outline"
              onClick={handleDiscard}
              disabled={saving}
              style={{ padding: "11px 24px", fontSize: "0.95rem", borderRadius: "12px" }}
            >
              Discard
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "11px 28px", fontSize: "0.95rem", borderRadius: "12px" }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </AnimatedButton>
          </div>

        </motion.div>
      </div>
    </PageWrapper>
  );
}