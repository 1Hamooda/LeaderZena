"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Award, Calendar, Clock, Camera } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedInput from "@/components/ui/AnimatedInput";
import PageWrapper from "@/components/ui/PageWrapper";
import { getMe } from "@/services/authService";
import api from "@/services/api";
import type { User } from "@/services/authService";

const allSkills = ["Leadership", "Communication", "Design", "Programming", "Marketing", "Event Planning", "Photography", "Writing"];

function getInitials(user: User | null): string {
  if (!user) return "??";
  return `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
}

export default function VolunteerProfile() {
  const [user,          setUser]          = useState<User | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [showToast,     setShowToast]     = useState(false);
  const [certCount,     setCertCount]     = useState(0);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName,      setFirstName]      = useState("");
  const [lastName,       setLastName]       = useState("");
  const [phone,          setPhone]          = useState("");
  const [city,           setCity]           = useState("");
  const [country,        setCountry]        = useState("");
  const [bio,            setBio]            = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, certsData] = await Promise.all([
          getMe(),
          api.get("/api/certificates/"),
        ]);
        setUser(userData);
        setFirstName(userData.first_name || "");
        setLastName(userData.last_name   || "");
        setPhone(userData.phone          || "");
        setCity(userData.city            || "");
        setCountry(userData.country      || "");
        setBio(userData.bio              || "");
        setSelectedSkills(userData.skills || []);
        setCertCount(certsData.data.length || 0);
        if (userData.avatar) setAvatarPreview(userData.avatar);
      } catch {
        setError("Failed to load profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name",  lastName);
      formData.append("phone",      phone);
      formData.append("city",       city);
      formData.append("country",    country);
      formData.append("bio",        bio);
      selectedSkills.forEach((s) => formData.append("skills", s));
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await api.patch("/api/auth/me/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      if (data.user.avatar) setAvatarPreview(data.user.avatar);
      setAvatarFile(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!user) return;
    setFirstName(user.first_name || "");
    setLastName(user.last_name   || "");
    setPhone(user.phone          || "");
    setCity(user.city            || "");
    setCountry(user.country      || "");
    setBio(user.bio              || "");
    setSelectedSkills(user.skills || []);
    setAvatarFile(null);
    if (user.avatar) setAvatarPreview(user.avatar);
    else setAvatarPreview(null);
  }

  const stats = [
    { icon: Calendar, label: "Events Attended", value: "—" },
    { icon: Clock,    label: "Volunteer Hours",  value: "—" },
    { icon: Award,    label: "Certificates",     value: certCount },
  ];

  if (loading) return (
    <PageWrapper>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading profile...</p>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{ position: "fixed", top: "24px", right: "24px", zIndex: 100, backgroundColor: "#ffffff", borderRadius: "14px", padding: "14px 20px", boxShadow: "0 8px 32px rgba(46,134,115,0.18)", border: "1px solid #dcfce7", display: "flex", alignItems: "center", gap: "10px" }}
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
          <p style={{ color: "#6b7280", marginTop: "4px", marginBottom: "24px" }}>Manage your account details.</p>
        </motion.div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem", marginBottom: "8px" }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "8px" }}
        >
          {stats.map((s) => (
            <motion.div key={s.label} whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(46,134,115,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ backgroundColor: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #f0f0f0", textAlign: "center" }}
            >
              <div style={{ height: "36px", width: "36px", borderRadius: "10px", backgroundColor: "#f0f9f7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <s.icon size={18} style={{ color: "#2e8673" }} />
              </div>
              <p style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0d0b08" }}>{s.value}</p>
              <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "2px" }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "32px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "28px" }}
        >
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ position: "relative" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => fileInputRef.current?.click()}
                style={{ height: "80px", width: "80px", borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: "3px solid #e0f2ee", flexShrink: 0 }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "800", color: "#ffffff" }}>
                    {getInitials(user)}
                  </div>
                )}
              </motion.div>
              <div onClick={() => fileInputRef.current?.click()}
                style={{ position: "absolute", bottom: "0", right: "0", height: "24px", width: "24px", borderRadius: "50%", backgroundColor: "#2e8673", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #ffffff" }}
              >
                <Camera size={12} style={{ color: "#ffffff" }} />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </div>
            <div>
              <p style={{ fontSize: "1rem", fontWeight: "700", color: "#0d0b08" }}>{user?.full_name}</p>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>{user?.email}</p>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>JPG, PNG. Max 2MB.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput label="First Name" value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} placeholder="First name" />
            <AnimatedInput label="Last Name"  value={lastName}  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}  placeholder="Last name" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput label="Phone" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="+970 5X XXX XXXX" />
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Email</label>
              <input value={user?.email || ""} disabled style={{ width: "100%", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "0.875rem", backgroundColor: "#f9fafb", color: "#9ca3af", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <AnimatedInput label="City"    value={city}    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}    placeholder="e.g. Ramallah" />
            <AnimatedInput label="Country" value={country} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)} placeholder="e.g. Palestine" />
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short introduction about yourself..." rows={3}
              style={{ width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              onFocus={(e) => { e.target.style.borderColor = "#2e8673"; e.target.style.boxShadow = "0 0 0 3px rgba(46,134,115,0.1)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151", display: "block", marginBottom: "12px" }}>Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {allSkills.map((skill, i) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <motion.button key={skill}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.04 }}
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
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "8px" }}>{selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected</p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid #f0f0f0" }}>
            <AnimatedButton variant="outline" onClick={handleDiscard} disabled={saving} style={{ padding: "11px 24px", fontSize: "0.95rem", borderRadius: "12px" }}>Discard</AnimatedButton>
            <AnimatedButton variant="primary" onClick={handleSave}    disabled={saving} style={{ padding: "11px 28px", fontSize: "0.95rem", borderRadius: "12px" }}>
              {saving ? "Saving..." : "Save Profile"}
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
