"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { getMe, logout } from "@/services/authService";

interface UserInfo {
  first_name: string;
  last_name:  string;
  email:      string;
  role:       string;
}

function getInitials(user: UserInfo): string {
  return `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
}

function getDashboardUrl(role: string): string {
  if (role === "admin")     return "/admin/dashboard";
  if (role === "volunteer") return "/volunteer/dashboard";
  return "/member/dashboard";
}

function getProfileUrl(role: string): string {
  if (role === "admin")     return "/admin/dashboard";
  if (role === "volunteer") return "/volunteer/profile";
  return "/member/profile";
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen,       setIsOpen]       = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [user,         setUser]         = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Try to load logged-in user
  useEffect(() => {
    const token = typeof localStorage !== "undefined" && localStorage.getItem("access_token");
    if (!token) return;
    getMe().then(setUser).catch(() => setUser(null));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setShowDropdown(false);
    await logout();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const links = [
    { label: "Home",          href: "/" },
    { label: "About",         href: "/about" },
    { label: "Events",        href: "/events" },
    { label: "Announcements", href: "/announcements" },
    { label: "Contact",       href: "/contact" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <motion.nav
      animate={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.4)",
        boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.08)" : "0 1px 0 rgba(0,0,0,0.05)",
        backdropFilter: "blur(12px)", 
      }}
      transition={{ duration: 0.4 }}
      style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #f0f0f0" }}
    >
      <div style={{
        maxWidth: "1280px", margin: "0 auto", padding: "0 24px",
        height: scrolled ? "60px" : "72px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "height 0.3s",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/logo.png" alt="MENA Club" width={40} height={40} unoptimized quality={100} style={{ height: "40px", width: "auto" }} />
          <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#0d0b08" }}>MENA Club</span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden md:flex">
          {links.map((link) => (
            <motion.div key={link.href} whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 400 }}>
              <Link href={link.href} style={{ fontSize: "0.9rem", fontWeight: "500", color: "#333133", textDecoration: "none" }}>
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="hidden md:flex">
          {user ? (
            /* ── Avatar + dropdown ── */
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowDropdown((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "1px solid #e5e7eb", borderRadius: "40px", padding: "5px 12px 5px 5px", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2e8673")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#ffffff", fontSize: "0.75rem", fontWeight: "700" }}>{getInitials(user)}</span>
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0d0b08", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.first_name}
                </span>
                <ChevronDown size={14} style={{ color: "#6b7280", transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
              </motion.button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "210px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 100 }}
                  >
                    {/* User info */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#ffffff", fontSize: "0.8rem", fontWeight: "700" }}>{getInitials(user)}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.first_name} {user.last_name}</p>
                        <p style={{ fontSize: "0.72rem", color: "#9ca3af", textTransform: "capitalize" }}>{user.role}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "6px" }}>
                      <DropdownItem
                        href={getProfileUrl(user.role)}
                        icon={<User size={15} />}
                        label="My Profile"
                        onClick={() => setShowDropdown(false)}
                      />
                      <DropdownItem
                        href={getDashboardUrl(user.role)}
                        icon={<LayoutDashboard size={15} />}
                        label="Dashboard"
                        onClick={() => setShowDropdown(false)}
                      />
                    </div>

                    <div style={{ borderTop: "1px solid #f5f5f5", padding: "6px" }}>
                      <button
                        onClick={handleLogout}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", border: "none", background: "none", cursor: "pointer", color: "#dc2626", fontSize: "0.875rem", fontWeight: "600", textAlign: "left", transition: "background-color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest buttons ── */
            <>
              <Link href="/login">
                <AnimatedButton variant="outline" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>Login</AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton variant="primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>Join Now</AnimatedButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
          className="md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          style={{ borderTop: "1px solid #f0f0f0", backgroundColor: "#ffffff", padding: "16px 24px 24px" }}
        >
          {links.map((link, i) => (
            <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={link.href} onClick={() => setIsOpen(false)}
                style={{ display: "block", padding: "12px 0", fontSize: "1rem", fontWeight: "500", color: "#333133", textDecoration: "none", borderBottom: "1px solid #f5f5f5" }}>
                {link.label}
              </Link>
            </motion.div>
          ))}

          <div style={{ marginTop: "16px" }}>
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #f5f5f5", marginBottom: "4px" }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0d0b08" }}>{user.first_name} {user.last_name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "capitalize" }}>{user.role}</p>
                </div>
                <Link href={getProfileUrl(user.role)} onClick={() => setIsOpen(false)}>
                  <AnimatedButton variant="outline" fullWidth>My Profile</AnimatedButton>
                </Link>
                <Link href={getDashboardUrl(user.role)} onClick={() => setIsOpen(false)}>
                  <AnimatedButton variant="primary" fullWidth>Dashboard</AnimatedButton>
                </Link>
                <button onClick={handleLogout}
                  style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/login" style={{ flex: 1 }}>
                  <AnimatedButton variant="outline" fullWidth>Login</AnimatedButton>
                </Link>
                <Link href="/register" style={{ flex: 1 }}>
                  <AnimatedButton variant="primary" fullWidth>Join Now</AnimatedButton>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function DropdownItem({ href, icon, label, onClick }: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: "none" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", color: "#374151", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer", transition: "background-color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span style={{ color: "#6b7280" }}>{icon}</span>
        {label}
      </div>
    </Link>
  );
}