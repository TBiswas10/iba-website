"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";


type Membership = {
  id: number;
  status: string;
  type: string | null;
  startDate: string;
  createdAt: string;
};

type UserData = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  familyMembers: string | null;
  role: string;
  createdAt: string;
  memberships: Membership[];
};

type EditingMembership = {
  id: number;
  userId: number;
  status: string;
  type: string;
  userName: string;
  userPhone: string;
  userFamilyMembers: string;
};

type ConfirmAction = {
  title: string;
  message: string;
  onConfirm: () => void;
} | null;

const MEMBERSHIP_TYPES = ["", "Regular", "Family", "Life", "Senior", "Associate", "Honorary"];

const UserRow = memo(function UserRow({
  user, currentUserEmail,
  onOpenCreate, onOpenReview, onOpenEdit, onConfirm,
  onUpdateStatus, onDeleteMembership,
}: {
  user: UserData;
  currentUserEmail: string;
  onOpenCreate: (userId: number) => void;
  onOpenReview: (m: Membership, userId: number) => void;
  onOpenEdit: (m: Membership, userId: number) => void;
  onConfirm: (a: ConfirmAction) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDeleteMembership: (id: number) => void;
}) {
  const m = user.memberships[0];
  const isPending = !m || m.status === "PENDING";
  const isExpired = m?.status === "EXPIRED";
  const isActive = m?.status === "ACTIVE";
  const isRejected = m?.status === "REJECTED";

  return (
    <tr style={{
      background: isPending ? "rgba(249,168,38,0.03)" : "transparent",
      transition: "background 0.15s ease"
    }}>
      <td>
        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {isPending && (
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#d97706", display: "inline-block", flexShrink: 0,
              animation: "pulse 2s ease-in-out infinite"
            }} />
          )}
          {user.name || "—"}
          <span style={{
            padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600,
            background: user.role === "ADMIN" ? "var(--berry)" : "rgba(13,127,120,0.1)",
            color: user.role === "ADMIN" ? "white" : "var(--teal)",
          }}>
            {user.role === "ADMIN" ? "ADMIN" : "Member"}
          </span>
          {m?.type === "Life" && (
            <span style={{
              padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700,
              background: "linear-gradient(135deg,rgba(212,175,55,0.2),rgba(255,215,0,0.15))",
              color: "#b8860b",
            }}>
              LIFE
            </span>
          )}
        </div>
      </td>
      <td style={{ fontSize: "0.85rem" }}>{user.email}</td>
      <td style={{ fontSize: "0.85rem" }}>{user.phone || <span style={{ opacity: 0.3 }}>—</span>}</td>
      <td style={{ fontSize: "0.85rem" }}>
        {user.familyMembers ? (
          <span style={{ lineHeight: 1.5 }}>{user.familyMembers}</span>
        ) : (
          <span style={{ opacity: 0.3, fontSize: "0.8rem" }}>—</span>
        )}
      </td>
      <td>
        {m ? (
          <span className={`status-badge ${isActive ? "status-active" : isRejected ? "" : "status-pending"}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
              background: isActive ? "rgba(13,127,120,0.1)" : isRejected ? "rgba(220,38,38,0.1)" : "rgba(249,168,38,0.12)",
              color: isActive ? "var(--teal)" : isRejected ? "#dc2626" : "#b45309",
            }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: isActive ? "var(--teal)" : isRejected ? "#dc2626" : "#d97706",
              display: "inline-block"
            }} />
            {m.status}
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
      <td>
        {user.email === currentUserEmail ? (
          <span style={{ fontSize: "0.8rem", opacity: 0.4, fontStyle: "italic" }}>You</span>
        ) : (
          <div className="action-buttons" style={{ flexWrap: "nowrap" }}>
            {isPending ? (
              <>
                <button
                  className="btn-small"
                  onClick={() => m ? onOpenReview(m, user.id) : onOpenCreate(user.id)}
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
                  <>
                    <button
                      className="btn-small"
                      onClick={() => {
                        onConfirm({
                          title: "Reject Application",
                          message: `Reject ${user.name || user.email}'s membership application?`,
                          onConfirm: () => onUpdateStatus(m.id, "REJECTED"),
                        });
                      }}
                      title="Reject application"
                      style={{
                        background: "rgba(220,38,38,0.1)", color: "#dc2626",
                        padding: "0.4rem 0.75rem", fontSize: "0.75rem",
                        borderRadius: "8px", border: "none", cursor: "pointer",
                        fontWeight: 500, whiteSpace: "nowrap"
                      }}>
                      Reject
                    </button>
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
                  </>
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
        )}
      </td>
    </tr>
  );
});

export default function AdminMembershipsPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingMembership | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    setLoading(true);
    fetch("/api/admin/memberships", { method: "GET" }).then(r => r.json()).then(data => {
      if (data.ok) setUsers(data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/memberships", { method: "GET" });
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

  function openCreate(userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({
      id: 0,
      userId,
      status: "ACTIVE",
      type: "Regular",
      userName: u?.name || "",
      userPhone: u?.phone || "",
      userFamilyMembers: u?.familyMembers || "",
    });
  }

  function openReview(m: Membership, userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({
      id: m.id,
      userId,
      status: "ACTIVE",
      type: m.type || "",
      userName: u?.name || "",
      userPhone: u?.phone || "",
      userFamilyMembers: u?.familyMembers || "",
    });
  }

  function openEdit(m: Membership, userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({
      id: m.id,
      userId,
      status: m.status,
      type: m.type || "",
      userName: u?.name || "",
      userPhone: u?.phone || "",
      userFamilyMembers: u?.familyMembers || "",
    });
  }

  async function saveEditing() {
    if (!editing) return;
    const isNew = editing.id === 0;
    let res: Response;
    if (isNew) {
      res = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editing.userId,
          action: "CREATE_MEMBERSHIP",
          type: editing.type || undefined,
        }),
      });
    } else {
      res = await fetch("/api/admin/memberships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          status: editing.status,
          type: editing.type || undefined,
        }),
      });
    }
    const data = await res.json();
    if (!data.ok) {
      setEditing(null);
      setConfirm({ title: "Error", message: data.error || "Failed to save", onConfirm: () => {} });
      return;
    }
    await fetch("/api/admin/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_USER", userId: editing.userId, name: editing.userName || undefined, phone: editing.userPhone || undefined, familyMembers: editing.userFamilyMembers || undefined }),
    });
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

  const editingUser = useMemo(() =>
    editing ? users.find(u => u.id === editing.userId) : null
  , [editing, users]);

  const isReview = editing && editing.id !== 0 && editingUser?.memberships[0]?.status === "PENDING";

  const filteredUsers = useMemo(() => {
    let list = users.filter(u => { const m = u.memberships[0]; return !m || (m.status !== "EXPIRED" && m.status !== "REJECTED"); });
    if (statusFilter === "pending") {
      list = list.filter(u => { const m = u.memberships[0]; return !m || m.status === "PENDING"; });
    } else if (statusFilter === "active") {
      list = list.filter(u => { const m = u.memberships[0]; return m?.status === "ACTIVE"; });
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(u =>
      (u.name?.toLowerCase() || "").includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone?.toLowerCase() || "").includes(q)
    );
  }, [users, search, statusFilter]);

  if (authLoading || loading) {
    return (
      <section className="panel-stack">
        <section className="admin-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="skeleton skeleton-heading" style={{ width: "260px" }} />
            <div className="skeleton skeleton-line" style={{ width: "320px", marginTop: "0.35rem" }} />
          </div>
          <div className="skeleton skeleton-line" style={{ width: "140px" }} />
        </section>
        <div className="stats-grid" style={{ marginBottom: "2.5rem" }}>
          {["Pending Review", "Active Members", "Total Users"].map((_, i) => (
            <div key={i} className="stat-card" style={{ pointerEvents: "none", textAlign: "center", padding: "1.5rem" }}>
              <div className="skeleton skeleton-heading" style={{ width: "28px", height: "28px", margin: "0 auto" }} />
              <div className="skeleton skeleton-line" style={{ width: "50%", margin: "0.5rem auto 0" }} />
            </div>
          ))}
        </div>
        <section className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
            <div className="skeleton skeleton-block" style={{ flex: 1, maxWidth: "320px", height: "40px", borderRadius: "8px" }} />
            <div className="skeleton skeleton-line" style={{ width: "120px" }} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: i < 3 ? "1px solid rgba(29,35,59,0.08)" : "none" }}>
              <div className="skeleton skeleton-block" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-heading" style={{ width: "180px", height: "16px" }} />
                <div className="skeleton skeleton-line" style={{ width: "240px", marginTop: "0.25rem" }} />
              </div>
              <div className="skeleton skeleton-line" style={{ width: "80px", alignSelf: "center" }} />
            </div>
          ))}
        </section>
      </section>
    );
  }

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  return (
    <section className="panel-stack">
      <section className="admin-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1>Membership Applications</h1>
          <p style={{ marginBottom: "0.75rem" }}>Review and manage membership applications.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <div className="stats-grid" style={{ marginBottom: "2.5rem" }}>
        <div className="stat-card" onClick={() => setStatusFilter("pending")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ color: "var(--teal)" }}>⏳</div>
          <h3>{pendingCount}</h3>
          <p>Pending Review</p>
        </div>
        <div className="stat-card" onClick={() => setStatusFilter("active")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ color: "var(--teal)" }}>✓</div>
          <h3>{activeCount}</h3>
          <p>Active Members</p>
        </div>
        <div className="stat-card" onClick={() => setStatusFilter("all")} style={{ cursor: "pointer" }}>
          <div className="stat-icon" style={{ color: "var(--teal)" }}>👥</div>
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
      </div>

      <section className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.25rem", background: "rgba(29,35,59,0.04)", padding: "3px", borderRadius: "10px" }}>
            {(["pending", "active", "all"] as const).map(tab => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                style={{
                  padding: "0.35rem 0.85rem", borderRadius: "8px", border: "none",
                  font: "inherit", fontSize: "0.8rem", fontWeight: statusFilter === tab ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                  background: statusFilter === tab ? "white" : "transparent",
                  color: statusFilter === tab ? "var(--deep)" : "rgba(16,16,16,0.5)",
                  boxShadow: statusFilter === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}>
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
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
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Family Members</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th style={{ width: "1px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filteredUsers.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      currentUserEmail={user?.email || ""}
                      onOpenCreate={openCreate}
                      onOpenReview={openReview}
                      onOpenEdit={openEdit}
                      onConfirm={setConfirm}
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
                {editing.id === 0 ? "Create Membership" : isReview ? "Review Application" : "Edit Membership"}
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
              {editingUser && (
                <div style={{
                  background: "rgba(30,58,68,0.04)", borderRadius: "12px",
                  padding: "1rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.85rem", opacity: 0.7 }}>
                    {editing.id === 0 ? "New Membership" : "Applicant Details"}
                  </div>
                  <div><strong>Name:</strong> {editingUser.name || "—"}</div>
                  <div><strong>Email:</strong> {editingUser.email}</div>
                  <div><strong>Phone:</strong> {editingUser.phone || "—"}</div>
                  {editingUser.familyMembers && (
                    <div><strong>Family Members:</strong> {editingUser.familyMembers}</div>
                  )}
                  <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", opacity: 0.6 }}>
                    Applied {new Date(editingUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
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

              <div style={{ borderTop: "1px solid rgba(29,35,59,0.1)", paddingTop: "1rem" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem", opacity: 0.6 }}>User Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>Name</label>
                    <input value={editing.userName} onChange={e => setEditing({ ...editing, userName: e.target.value })} className="modal-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>Phone</label>
                    <input value={editing.userPhone} onChange={e => setEditing({ ...editing, userPhone: e.target.value })} className="modal-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>Family Members</label>
                    <textarea value={editing.userFamilyMembers} onChange={e => setEditing({ ...editing, userFamilyMembers: e.target.value })} className="modal-field" rows={3} />
                  </div>
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
                {editing.id === 0 || isReview ? "Approve & Save" : "Save Changes"}
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
