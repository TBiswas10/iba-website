"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";

type Membership = {
  id: number;
  status: string;
  type: string | null;
  startDate: string;
  expiryDate: string;
};

type UserData = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  memberships: Membership[];
};

type EditingMembership = {
  id: number;
  userId: number;
  status: string;
  type: string;
  startDate: string;
  expiryDate: string;
};

type ConfirmAction = {
  title: string;
  message: string;
  onConfirm: () => void;
} | null;

const MEMBERSHIP_TYPES = ["", "Regular", "Family", "Life", "Senior", "Associate", "Honorary"];

const todayStr = () => new Date().toISOString().slice(0, 10);
const oneYearFromNow = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

const UserRow = memo(function UserRow({
  user, currentUserEmail, canManageRoles,
  onOpenCreate, onOpenEdit, onConfirm,
  onToggleRole, onUpdateStatus, onDeleteMembership,
}: {
  user: UserData;
  currentUserEmail: string;
  canManageRoles: boolean;
  onOpenCreate: (userId: number) => void;
  onOpenEdit: (m: Membership, userId: number) => void;
  onConfirm: (a: ConfirmAction) => void;
  onToggleRole: (userId: number, currentRole: string) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDeleteMembership: (id: number) => void;
}) {
  const m = user.memberships[0];
  const isPending = !m || m.status === "PENDING";
  const isExpired = m?.status === "EXPIRED";
  const isActive = m?.status === "ACTIVE";

  return (
    <tr style={{
      background: isPending ? "rgba(249,168,38,0.03)" : "transparent",
      transition: "background 0.15s ease"
    }}>
      <td>
        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isPending && (
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#d97706", display: "inline-block", flexShrink: 0,
              animation: "pulse 2s ease-in-out infinite"
            }} />
          )}
          {user.name || "—"}
        </div>
        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{user.email}</div>
        {user.phone && <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>{user.phone}</div>}
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
          <span className={`status-badge ${user.role === "ADMIN" ? "status-active" : "status-pending"}`}
            style={{
              background: user.role === "ADMIN" ? "var(--berry)" : "rgba(0,0,0,0.06)",
              color: user.role === "ADMIN" ? "white" : "inherit",
              padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600
            }}>
            {user.role}
          </span>
          {canManageRoles && user.email !== currentUserEmail && (
            <button
              className="btn-small"
              style={{
                padding: "1px 5px", fontSize: "0.6rem", background: "transparent",
                border: "1px solid rgba(0,0,0,0.12)", color: "var(--ink)"
              }}
              onClick={() => {
                const msg = user.role === "ADMIN"
                  ? `Demote ${user.name || user.email} to a regular user?`
                  : `Promote ${user.name || user.email} to admin?`;
                onConfirm({
                  title: user.role === "ADMIN" ? "Demote User" : "Promote User",
                  message: msg,
                  onConfirm: () => onToggleRole(user.id, user.role),
                });
              }}
            >
              {user.role === "ADMIN" ? "Demote" : "Make Admin"}
            </button>
          )}
        </div>
      </td>
      <td>
        {m ? (
          <span className={`status-badge ${m.status === "ACTIVE" ? "status-active" : m.status === "PENDING" ? "status-pending" : "status-expired"}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
              background: isActive ? "rgba(13,127,120,0.1)" : isExpired ? "rgba(220,38,38,0.1)" : "rgba(249,168,38,0.12)",
              color: isActive ? "var(--teal)" : isExpired ? "#dc2626" : "#b45309",
            }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: isActive ? "var(--teal)" : isExpired ? "#dc2626" : "#d97706",
              display: "inline-block"
            }} />
            {m.status === "ACTIVE" ? "Active" : m.status === "PENDING" ? "Pending" : "Expired"}
          </span>
        ) : (
          <span className="status-badge status-pending"
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
              background: "rgba(249,168,38,0.12)", color: "#b45309"
            }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#d97706", display: "inline-block" }} />
            Pending
          </span>
        )}
      </td>
      <td>
        {m?.type ? (
          <span style={{
            padding: "2px 8px", borderRadius: "6px", fontSize: "0.8rem",
            background: "rgba(30,58,68,0.08)", color: "var(--deep)", fontWeight: 500
          }}>
            {m.type}
          </span>
        ) : (
          <span style={{ opacity: 0.3, fontSize: "0.85rem" }}>—</span>
        )}
      </td>
      <td style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
        {m ? new Date(m.expiryDate).toLocaleDateString() : "—"}
      </td>
      <td>
        <div className="action-buttons" style={{ flexWrap: "nowrap" }}>
          {isPending ? (
            <>
              <button
                className="btn-small"
                onClick={() => onOpenCreate(user.id)}
                title={!m ? "Create membership" : "Review application"}
                style={{
                  background: "var(--teal)", color: "white",
                  padding: "0.4rem 0.75rem", fontSize: "0.75rem",
                  borderRadius: "8px", border: "none", cursor: "pointer",
                  fontWeight: 600, whiteSpace: "nowrap"
                }}>
                {!m ? "Create" : "Review"}
              </button>
              {m && (
                <button
                  className="btn-small"
                  onClick={() => onDeleteMembership(m.id)}
                  title="Delete application"
                  style={{
                    background: "transparent", color: "#dc2626",
                    padding: "0.4rem 0.6rem", fontSize: "0.75rem",
                    borderRadius: "8px", border: "1px solid rgba(220,38,38,0.3)",
                    cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap"
                  }}>
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              {isActive && (
                <button
                  className="btn-small"
                  onClick={() => {
                    onConfirm({
                      title: "Expire Membership",
                      message: `Expire ${user.name || user.email}'s membership? They will lose access.`,
                      onConfirm: () => onUpdateStatus(m!.id, "EXPIRED"),
                    });
                  }}
                  style={{
                    background: "rgba(220,38,38,0.1)", color: "#dc2626",
                    padding: "0.4rem 0.75rem", fontSize: "0.75rem",
                    borderRadius: "8px", border: "none", cursor: "pointer",
                    fontWeight: 500, whiteSpace: "nowrap"
                  }}>
                  Expire
                </button>
              )}
              <button
                className="btn-small"
                onClick={() => onOpenEdit(m!, user.id)}
                title="Edit membership details"
                style={{
                  background: "rgba(30,58,68,0.08)", color: "var(--deep)",
                  padding: "0.4rem 0.75rem", fontSize: "0.75rem",
                  borderRadius: "8px", border: "none", cursor: "pointer",
                  fontWeight: 500, whiteSpace: "nowrap"
                }}>
                Edit
              </button>
              <button
                className="btn-small"
                onClick={() => {
                  onConfirm({
                    title: "Delete Membership",
                    message: `Delete ${user.name || user.email}'s membership record? This cannot be undone.`,
                    onConfirm: () => onDeleteMembership(m!.id),
                  });
                }}
                style={{
                  background: "transparent", color: "#dc2626",
                  padding: "0.4rem 0.6rem", fontSize: "0.75rem",
                  borderRadius: "8px", border: "1px solid rgba(220,38,38,0.3)",
                  cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap"
                }}>
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function AdminMembershipsPage() {
  const { user, loading: authLoading } = useAuth();
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingMembership | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetch("/api/admin/memberships", { method: "POST" }).then(r => r.json()),
      fetch("/api/admin/can-manage-roles", { method: "POST" }).then(r => r.json()),
    ]).then(([usersData, rolesData]) => {
      if (usersData.ok) setUsers(usersData.data || []);
      if (rolesData.ok) setCanManageRoles(rolesData.canManageRoles);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/memberships", { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setUsers(data.data || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/memberships", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchUsers();
  }

  async function deleteMembership(id: number) {
    await fetch(`/api/admin/memberships?id=${id}`, { method: "DELETE" });
    fetchUsers();
  }

  async function toggleRole(userId: number, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    await fetch("/api/admin/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "CHANGE_ROLE", role: newRole }),
    });
    fetchUsers();
  }

  function openCreate(userId: number) {
    setEditing({
      id: 0,
      userId,
      status: "ACTIVE",
      type: "Regular",
      startDate: todayStr(),
      expiryDate: oneYearFromNow(),
    });
  }

  function openEdit(m: Membership, userId: number) {
    setEditing({
      id: m.id,
      userId,
      status: m.status,
      type: m.type || "",
      startDate: m.startDate.slice(0, 10),
      expiryDate: m.expiryDate.slice(0, 10),
    });
  }

  async function saveEditing() {
    if (!editing) return;
    const isNew = editing.id === 0;
    if (isNew) {
      await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editing.userId,
          action: "CREATE_MEMBERSHIP",
          type: editing.type || undefined,
          startDate: new Date(editing.startDate).toISOString(),
          expiryDate: new Date(editing.expiryDate).toISOString(),
        }),
      });
    } else {
      await fetch("/api/admin/memberships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          type: editing.type || undefined,
          startDate: new Date(editing.startDate).toISOString(),
          expiryDate: new Date(editing.expiryDate).toISOString(),
        }),
      });
    }
    setEditing(null);
    fetchUsers();
  }

  const pendingCount = useMemo(() => users.filter(u => {
    const m = u.memberships[0];
    return !m || m.status === "PENDING";
  }).length, [users]);

  const activeCount = useMemo(() => users.filter(u => {
    const m = u.memberships[0];
    return m?.status === "ACTIVE";
  }).length, [users]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.name?.toLowerCase() || "").includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone?.toLowerCase() || "").includes(q)
    );
  }, [users, search]);

  if (authLoading || loading) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line" style={{ width: "60%" }} />
          <div className="skeleton skeleton-block" style={{ marginTop: "1rem", height: "200px" }} />
        </section>
      </section>
    );
  }

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  return (
    <section className="panel-stack">
      <section className="admin-header">
        <div>
          <h1>Membership Applications</h1>
          <p>Review and manage membership applications.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "var(--teal)" }}>⏳</div>
          <h3>{pendingCount}</h3>
          <p>Pending Review</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "var(--teal)" }}>✓</div>
          <h3>{activeCount}</h3>
          <p>Active Members</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "var(--teal)" }}>👥</div>
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
      </div>

      <section className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 0.85rem 0.6rem 2.2rem",
                border: "1px solid rgba(29,35,59,0.2)", borderRadius: "8px",
                font: "inherit", fontSize: "0.9rem", background: "white"
              }}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", opacity: 0.4, fontSize: "0.9rem" }}>🔍</span>
          </div>
          <span style={{ fontSize: "0.85rem", color: "rgba(16,16,16,0.5)" }}>
            {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            {search ? "No users match your search." : "No users found yet."}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Expiry</th>
                  <th style={{ width: "1px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    currentUserEmail={user?.email || ""}
                    canManageRoles={canManageRoles}
                    onOpenCreate={openCreate}
                    onOpenEdit={openEdit}
                    onConfirm={setConfirm}
                    onToggleRole={toggleRole}
                    onUpdateStatus={updateStatus}
                    onDeleteMembership={deleteMembership}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <section className="glass-panel modal-panel" onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "500px", width: "100%", margin: "2rem auto",
              padding: "2rem", borderRadius: "20px"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem" }}>
                {editing.id === 0 ? "Review Application" : "Edit Membership"}
              </h2>
              <button onClick={() => setEditing(null)}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  border: "none", background: "rgba(0,0,0,0.06)",
                  cursor: "pointer", fontSize: "1.1rem",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>
                  Status
                </label>
                <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}
                  className="modal-field">
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>
                  Membership Type
                </label>
                <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}
                  className="modal-field">
                  {MEMBERSHIP_TYPES.map(t => (
                    <option key={t} value={t}>{t || "— None —"}</option>
                  ))}
                </select>
                <p style={{ fontSize: "0.75rem", color: "rgba(16,16,16,0.5)", marginTop: "0.25rem" }}>
                  This can be changed later if needed.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>
                    Start Date
                  </label>
                  <input type="date" value={editing.startDate}
                    onChange={e => setEditing({ ...editing, startDate: e.target.value })}
                    className="modal-field" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>
                    Expiry Date
                  </label>
                  <input type="date" value={editing.expiryDate}
                    onChange={e => setEditing({ ...editing, expiryDate: e.target.value })}
                    className="modal-field" />
                </div>
              </div>
            </div>

            <div className="button-row" style={{ marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setEditing(null)}
                style={{ fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveEditing}
                style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}>
                {editing.id === 0 ? "Approve & Save" : "Save Changes"}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}
            style={{
              maxWidth: "400px", width: "100%", padding: "2rem",
              background: "white", borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center"
            }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "#dc2626", color: "white", fontSize: "1.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem"
            }}>
              ⚠
            </div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>{confirm.title}</h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(16,16,16,0.7)", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              {confirm.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setConfirm(null)}
                style={{ fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}>
                Cancel
              </button>
              <button onClick={() => { confirm.onConfirm(); setConfirm(null); }}
                style={{
                  background: "#dc2626", color: "white", border: "none",
                  padding: "0.6rem 1.5rem", borderRadius: "100px",
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.9rem",
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                onMouseOver={e => e.currentTarget.style.background = "#b91c1c"}
                onMouseOut={e => e.currentTarget.style.background = "#dc2626"}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-field {
          width: 100%; padding: 0.65rem 0.85rem;
          border: 1px solid rgba(29,35,59,0.2); border-radius: 8px;
          font-family: var(--font-body); font-size: 0.95rem;
          background: white; transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .modal-field:focus {
          outline: none; border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(30,58,68,0.1);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
