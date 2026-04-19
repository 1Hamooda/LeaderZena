"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calendar, Bell, Briefcase, Users, BarChart3,
  FileText, LogOut, Menu, X, ChevronRight,
  ClipboardCheck, Award, Send, Key, Download,
} from "lucide-react";
import { getMe } from "@/services/authService";
import api from "@/services/api";
import type { User } from "@/services/authService";

type Role = "member" | "volunteer" | "admin";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
  badge?: string;
  isNotifications?: boolean;
}

const navConfig: Record<Role, NavItem[]> = {
  member: [
    { label: "Dashboard",     href: "/member/dashboard",     icon: Home },
    { label: "Browse Events", href: "/member/events",        icon: Calendar },
    { label: "AI Job Match",  href: "/member/jobs",          icon: Briefcase },
    { label: "Notifications", href: "/member/notifications", icon: Bell, isNotifications: true },
  ],
  volunteer: [
    { label: "Dashboard",    href: "/volunteer/dashboard",     icon: Home },
    { label: "Events",       href: "/volunteer/events",        icon: Calendar },
    { label: "Check-in",     href: "/volunteer/checkin",       icon: ClipboardCheck },
    { label: "Certificates", href: "/volunteer/certificates",  icon: Award },
    { label: "Notifications",href: "/volunteer/notifications", icon: Bell, isNotifications: true },
  ],
  admin: [
    { label: "Dashboard",     href: "/admin/dashboard",      icon: Home },
    { label: "Members",       href: "/admin/users",          icon: Users },
    { label: "Events",        href: "/admin/events",         icon: Calendar },
    { label: "Applications",  href: "/admin/applications",   icon: FileText },
    { label: "Announcements", href: "/admin/announcements",  icon: Send },
    { label: "Notifications", href: "/admin/notifications",  icon: Bell, isNotifications: true },
    { label: "Attendance",    href: "/admin/attendance",     icon: Key },
    { label: "Certificates",  href: "/admin/certificates",   icon: Download },
    { label: "Analytics",     href: "/admin/analytics",      icon: BarChart3 },
  ],
};

const roleLabels: Record<Role, string> = {
  member:    "Member",
  volunteer: "Volunteer",
  admin:     "Admin",
};

const profileHref: Record<Role, string> = {
  member:    "/member/profile",
  volunteer: "/volunteer/profile",
  admin:     "/admin/dashboard",
};

function getInitials(user: User | null): string {
  if (!user) return "??";
  return `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
}

export default function DashboardLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user,        setUser]        = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const items = navConfig[role];

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, countData] = await Promise.all([
          getMe(),
          api.get("/api/notifications/unread-count/"),
        ]);
        setUser(userData);
        setUnreadCount(countData.data.unread_count || 0);
      } catch {}
    }
    loadData();
  }, [pathname]);

  const SidebarInner = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      <Link href={profileHref[role]} style={{ textDecoration: "none" }}>
        <motion.div
          whileHover={{ backgroundColor: "#f0f9f7" }}
          style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "background-color 0.2s", flexShrink: 0 }}
        >
          <div style={{ height: "40px", width: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.8rem", fontWeight: "800", flexShrink: 0 }}>
            {getInitials(user)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0d0b08", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.full_name || "Loading..."}
            </p>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#2e8673", backgroundColor: "#f0f9f7", padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.04em" }}>
              {roleLabels[role].toUpperCase()}
            </span>
          </div>
          <ChevronRight size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
        </motion.div>
      </Link>

      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto", minHeight: 0 }}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const badgeValue = item.isNotifications
            ? (unreadCount > 0 ? String(unreadCount) : null)
            : (item.badge || null);

          return (
            <motion.div key={item.href} whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "12px", marginBottom: "2px",
                  fontSize: "0.875rem", fontWeight: isActive ? "700" : "500",
                  textDecoration: "none", transition: "background-color 0.15s",
                  backgroundColor: isActive ? "#2e8673" : "transparent",
                  color: isActive ? "#ffffff" : "#4b5563",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "#f0f9f7"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <item.icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {badgeValue && (
                  <span style={{
                    fontSize: "0.7rem", padding: "2px 7px", borderRadius: "20px", fontWeight: "700",
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#f0f9f7",
                    color: isActive ? "#ffffff" : "#2e8673",
                  }}>
                    {badgeValue}
                  </span>
                )}
                {isActive && <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.7 }} />}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div style={{ padding: "10px", borderTop: "1px solid #f0f0f0", flexShrink: 0 }}>
  <motion.div whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
    <button
      onClick={async () => {
        try {
          const refresh = localStorage.getItem("refresh_token") || "";
          await api.post("/api/auth/logout/", { refresh });
        } finally {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/login";
        }
      }}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", fontSize: "0.875rem", fontWeight: "500", color: "#ef4444", background: "none", border: "none", cursor: "pointer", width: "100%" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fef2f2"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      <LogOut size={17} style={{ flexShrink: 0 }} />
      <span>Logout</span>
    </button>
  </motion.div>
</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "flex-start", backgroundColor: "#f9fafb" }}>

      <aside
        style={{ width: "240px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", backgroundColor: "#ffffff", borderRight: "1px solid #f0f0f0", overflowY: "auto" }}
        className="sidebar-desktop"
      >
        <SidebarInner />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(0,0,0,0.2)", backdropFilter: "blur(2px)" }}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, width: "240px", backgroundColor: "#ffffff", borderRight: "1px solid #f0f0f0", overflowY: "auto" }}
            >
              <div style={{ position: "absolute", top: "18px", right: "14px", zIndex: 1 }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                  <X size={18} style={{ color: "#6b7280" }} />
                </motion.button>
              </div>
              <SidebarInner />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
        <header style={{
          position: "sticky", top: 0, zIndex: 30, height: "56px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", padding: "0 24px", gap: "12px",
        }}>
          <motion.button
            whileTap={{ scale: 0.9 }} onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "none" }}
            className="menu-btn-mobile"
          >
            <Menu size={20} style={{ color: "#4b5563" }} />
          </motion.button>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href={role === "admin" ? "/admin/notifications" : `/${role}/notifications`} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ backgroundColor: "#f0f9f7" }} whileTap={{ scale: 0.95 }}
                style={{ position: "relative", padding: "8px", borderRadius: "10px", cursor: "pointer" }}
              >
                <Bell size={18} style={{ color: "#4b5563" }} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: "6px", right: "6px", height: "8px", width: "8px", borderRadius: "50%", backgroundColor: "#2e8673", border: "2px solid white" }} />
                )}
              </motion.div>
            </Link>

            <Link href={profileHref[role]} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                style={{ height: "34px", width: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #2e8673, #469d8b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "0.72rem", fontWeight: "800", cursor: "pointer", border: "2px solid #e0f2ee" }}
              >
                {getInitials(user)}
              </motion.div>
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: "32px" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .menu-btn-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}