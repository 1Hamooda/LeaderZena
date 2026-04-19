"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Check, X, Edit } from "lucide-react";
import PageWrapper from "@/components/ui/PageWrapper";
import api from "@/services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  active:   { bg: "#dcfce7", color: "#15803d" },
  pending:  { bg: "#fef9c3", color: "#a16207" },
  rejected: { bg: "#fee2e2", color: "#b91c1c" },
};

interface User {
  id:          number;
  full_name:   string;
  email:       string;
  role:        string;
  is_active:   boolean;
  date_joined: string;
}

function getStatus(user: User): string {
  if (user.role === "volunteer") return "active";
  return user.is_active ? "active" : "pending";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminMembers() {
  const [users,        setUsers]        = useState<User[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast,        setToast]        = useState("");

  // ── Fetch users ──────────────────────────────────────────────
  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (search)       params.search = search;
      if (roleFilter)   params.role   = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get("/api/auth/admin/users/", { params });
      setUsers(data.results);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, [search, roleFilter, statusFilter]);

  // ── Show toast message ───────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Approve member ───────────────────────────────────────────
  async function handleApprove(userId: number) {
    setActionLoading(userId);
    try {
      const { data } = await api.post(`/api/auth/admin/users/${userId}/approve/`);
      showToast(data.message);
      fetchUsers();
    } catch {
      showToast("Failed to approve user.");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Reject member ────────────────────────────────────────────
  async function handleReject(userId: number) {
    setActionLoading(userId);
    try {
      const { data } = await api.post(`/api/auth/admin/users/${userId}/reject/`);
      showToast(data.message);
      fetchUsers();
    } catch {
      showToast("Failed to reject user.");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Change role ──────────────────────────────────────────────
  async function handleRoleChange(userId: number, newRole: string) {
    setActionLoading(userId);
    try {
      const { data } = await api.post(`/api/auth/admin/users/${userId}/role/`, { role: newRole });
      showToast(data.message);
      fetchUsers();
    } catch {
      showToast("Failed to change role.");
    } finally {
      setActionLoading(null);
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
            exit={{ opacity: 0 }}
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0d0b08" }}>Member Management</h1>
          <p style={{ color: "#6b7280", marginTop: "4px" }}>Approve, reject, and manage registrations.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
          >
            <option value="">All Roles</option>
            <option value="member">Member</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "12px", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
          </select>
        </motion.div>

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #f0f0f0", overflow: "hidden" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: "#f9fafb" }}>
                {["Name", "Email", "Role", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u, i) => {
                  const userStatus = getStatus(u);
                  const isActioning = actionLoading === u.id;

                  return (
                    <motion.tr
                      key={u.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      whileHover={{ backgroundColor: "#e9e2e2" }}
                      style={{ borderBottom: "1px solid #f5f5f5", transition: "background-color 0.15s", opacity: isActioning ? 0.5 : 1 }}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: "600", fontSize: "0.875rem", color: "#0d0b08" }}>{u.full_name}</td>
                      <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{u.email}</td>
                      <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#374151" }}>
                        {/* Role change dropdown */}
                        <select
                          value={u.role}
                          disabled={isActioning}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ padding: "4px 8px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", backgroundColor: "#ffffff" }}
                        >
                          <option value="member">Member</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.875rem", color: "#6b7280" }}>{formatDate(u.date_joined)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ backgroundColor: statusStyles[userStatus].bg, color: statusStyles[userStatus].color, fontSize: "0.75rem", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" }}>
                          {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                          {/* Show approve/reject only for pending members */}
                          {u.role === "member" && !u.is_active && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => handleApprove(u.id)}
                                disabled={isActioning}
                                title="Approve"
                                style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#dcfce7", color: "#15803d", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <Check size={15} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => handleReject(u.id)}
                                disabled={isActioning}
                                title="Reject"
                                style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >
                                <X size={15} />
                              </motion.button>
                            </>
                          )}
                          {/* Deactivate active members */}
                          {u.role === "member" && u.is_active && (
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleReject(u.id)}
                              disabled={isActioning}
                              title="Deactivate"
                              style={{ height: "32px", width: "32px", borderRadius: "8px", border: "none", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <X size={15} />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </motion.div>

        {/* User count */}
        {!loading && users.length > 0 && (
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right" }}>
            Showing {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        )}

      </div>
    </PageWrapper>
  );
}