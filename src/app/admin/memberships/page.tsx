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
  userEmail: string;
  userPhone: string;
  userFamilyMembers: string;
};

type ConfirmAction = { title: string; message: string; onConfirm: () => void } | null;

const MEMBERSHIP_TYPES = ["", "General Member", "Associate Member", "Life Member", "Honorary Member"];

// ── SVG Icons ──
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "badge badge-active",
    PENDING: "badge badge-pending",
    EXPIRED: "badge badge-expired",
    REJECTED: "badge badge-rejected",
  };
  return <span className={map[status] || "badge badge-expired"}>{status}</span>;
}

const UserRow = memo(function UserRow({
  user, currentUserEmail, canManageRoles,
  onOpenCreate, onOpenReview, onOpenEdit, onConfirm,
  onUpdateStatus, onDeleteMembership, onChangeRole, onDeleteUser,
}: {
  user: UserData;
  currentUserEmail: string;
  canManageRoles: boolean;
  onOpenCreate: (userId: number) => void;
  onOpenReview: (m: Membership, userId: number) => void;
  onOpenEdit: (m: Membership, userId: number) => void;
  onConfirm: (a: ConfirmAction) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDeleteMembership: (id: number) => void;
  onChangeRole: (userId: number, newRole: string) => void;
  onDeleteUser: (userId: number, name: string) => void;
}) {
  const m = user.memberships[0];
  const isPending = !m || m.status === "PENDING";
  const isActive = m?.status === "ACTIVE";
  const isSelf = user.email === currentUserEmail;

  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: user.role === "ADMIN" ? "rgba(196,90,59,0.15)" : "rgba(30,58,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 700,
            color: user.role === "ADMIN" ? "var(--berry)" : "var(--teal)",
          }}>
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--ink)" }}>
              {user.name || "—"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(16,16,16,0.45)" }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={{ fontSize: "0.8rem", color: "rgba(16,16,16,0.5)" }}>{user.phone || "—"}</td>
      <td style={{ fontSize: "0.8rem", color: "rgba(16,16,16,0.5)", textAlign: "center" }}>{user.familyMembers || "—"}</td>
      <td>
        {m ? <StatusBadge status={m.status} /> : <span className="badge badge-pending">PENDING</span>}
      </td>
      <td>
        {user.role === "ADMIN" && <span className="badge badge-admin">Admin</span>}
        {m?.type && <span className="badge badge-expired" style={{ marginLeft: user.role === "ADMIN" ? 4 : 0 }}>{m.type}</span>}
        {!user.role && !m?.type && <span style={{ color: "rgba(16,16,16,0.3)", fontSize: "0.8rem" }}>—</span>}
      </td>
      <td>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {!isSelf && isPending && (
            <>
              <button
                className="admin-icon-btn approve"
                title={m ? "Approve" : "Create membership"}
                onClick={() => m ? onOpenReview(m, user.id) : onOpenCreate(user.id)}
              ><CheckIcon /></button>
              {m && (
                <button
                  className="admin-icon-btn reject"
                  title="Reject"
                  onClick={() => onConfirm({
                    title: "Reject Application",
                    message: `Reject ${user.name || user.email}'s membership application?`,
                    onConfirm: () => onUpdateStatus(m.id, "REJECTED"),
                  })}
                ><XIcon /></button>
              )}
            </>
          )}
          {!isSelf && !isPending && m && (
            <>
              {isActive && (
                <button
                  className="admin-icon-btn reject"
                  title="Expire membership"
                  onClick={() => onConfirm({
                    title: "Expire Membership",
                    message: `Expire ${user.name || user.email}'s membership?`,
                    onConfirm: () => onUpdateStatus(m.id, "EXPIRED"),
                  })}
                ><XIcon /></button>
              )}
              <button className="admin-icon-btn edit" title="Edit" onClick={() => onOpenEdit(m, user.id)}>
                <EditIcon />
              </button>
            </>
          )}
          {!isSelf && canManageRoles && (
            <button
              className="admin-icon-btn edit"
              title={user.role === "ADMIN" ? "Remove admin" : "Make admin"}
              onClick={() => onConfirm({
                title: user.role === "ADMIN" ? "Remove Admin" : "Make Admin",
                message: user.role === "ADMIN"
                  ? `Remove admin access from ${user.name || user.email}?`
                  : `Give ${user.name || user.email} full admin access?`,
                onConfirm: () => onChangeRole(user.id, user.role === "ADMIN" ? "USER" : "ADMIN"),
              })}
              style={{ color: user.role === "ADMIN" ? "#dc2626" : "rgba(16,16,16,0.4)" }}
            ><ShieldIcon /></button>
          )}
          {!isSelf && (
            <button
              className="admin-icon-btn danger"
              title="Delete user"
              onClick={() => onDeleteUser(user.id, user.name || user.email)}
            ><TrashIcon /></button>
          )}
          {isSelf && <span style={{ fontSize: "0.75rem", color: "rgba(16,16,16,0.35)", fontStyle: "italic" }}>You</span>}
        </div>
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
  const [canManageRoles, setCanManageRoles] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetch("/api/admin/memberships").then(r => r.json()),
      fetch("/api/admin/can-manage-roles", { method: "POST" }).then(r => r.json()),
    ]).then(([membData, rolesData]) => {
      if (membData.ok) setUsers(membData.data || []);
      if (rolesData.ok) setCanManageRoles(rolesData.canManageRoles ?? false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  async function fetchUsers() {
    const res = await fetch("/api/admin/memberships");
    const data = await res.json();
    if (data.ok) setUsers(data.data || []);
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/memberships", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchUsers();
  }

  async function deleteMembership(id: number) {
    await fetch(`/api/admin/memberships?id=${id}`, { method: "DELETE" });
    fetchUsers();
  }

  async function changeRole(userId: number, role: string) {
    await fetch("/api/admin/memberships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CHANGE_ROLE", userId, role }) });
    fetchUsers();
  }

  function confirmDeleteUser(userId: number, name: string) {
    setConfirm({
      title: "Delete User",
      message: `Permanently delete ${name}? This removes them from the site and Supabase. Donation records are kept.`,
      onConfirm: async () => { await fetch(`/api/users?id=${userId}`, { method: "DELETE" }); fetchUsers(); },
    });
  }

  function openCreate(userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({ id: 0, userId, status: "ACTIVE", type: "General Member", userName: u?.name || "", userEmail: u?.email || "", userPhone: u?.phone || "", userFamilyMembers: u?.familyMembers || "" });
  }

  function openReview(m: Membership, userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({ id: m.id, userId, status: "ACTIVE", type: m.type || "", userName: u?.name || "", userEmail: u?.email || "", userPhone: u?.phone || "", userFamilyMembers: u?.familyMembers || "" });
  }

  function openEdit(m: Membership, userId: number) {
    const u = users.find(x => x.id === userId);
    setEditing({ id: m.id, userId, status: m.status, type: m.type || "", userName: u?.name || "", userEmail: u?.email || "", userPhone: u?.phone || "", userFamilyMembers: u?.familyMembers || "" });
  }

  async function saveEditing() {
    if (!editing) return;
    const isNew = editing.id === 0;
    const res = await fetch("/api/admin/memberships", {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew
        ? { userId: editing.userId, action: "CREATE_MEMBERSHIP", type: editing.type || undefined }
        : { id: editing.id, status: editing.status, type: editing.type || undefined }
      ),
    });
    const data = await res.json();
    if (!data.ok) { setEditing(null); setConfirm({ title: "Error", message: data.error || "Failed to save", onConfirm: () => {} }); return; }
    await fetch("/api/admin/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_USER", userId: editing.userId, name: editing.userName || undefined, email: editing.userEmail || undefined, phone: editing.userPhone || undefined, familyMembers: editing.userFamilyMembers || undefined }),
    });
    setEditing(null);
    fetchUsers();
  }

  const pendingCount = useMemo(() => users.filter(u => { const m = u.memberships[0]; return !m || m.status === "PENDING"; }).length, [users]);
  const activeCount = useMemo(() => users.filter(u => u.memberships[0]?.status === "ACTIVE").length, [users]);
  const editingUser = useMemo(() => editing ? users.find(u => u.id === editing.userId) : null, [editing, users]);
  const isReview = editing && editing.id !== 0 && editingUser?.memberships[0]?.status === "PENDING";

  const filteredUsers = useMemo(() => {
    let list = users.filter(u => { const m = u.memberships[0]; return !m || (m.status !== "EXPIRED" && m.status !== "REJECTED"); });
    if (statusFilter === "pending") list = list.filter(u => { const m = u.memberships[0]; return !m || m.status === "PENDING"; });
    else if (statusFilter === "active") list = list.filter(u => u.memberships[0]?.status === "ACTIVE");
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(u => (u.name?.toLowerCase() || "").includes(q) || u.email.toLowerCase().includes(q) || (u.phone?.toLowerCase() || "").includes(q));
  }, [users, search, statusFilter]);

  if (authLoading || loading) return (
    <div>
      <div className="admin-page-header">
        <div className="skeleton skeleton-heading" style={{ width: 200 }} />
        <div className="skeleton skeleton-line" style={{ width: 140, marginTop: 6 }} />
      </div>
      <div className="admin-stat-strip" style={{ marginBottom: "1.5rem" }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 16, background: "white" }} />)}
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", border: "1px solid rgba(29,35,59,0.07)" }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 48, borderBottom: "1px solid rgba(29,35,59,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div style={{ flex: 1 }}><div className="skeleton skeleton-line" style={{ width: 140 }} /><div className="skeleton skeleton-line" style={{ width: 200, marginTop: 4 }} /></div>
        </div>)}
      </div>
    </div>
  );

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="admin-page-title">Memberships</h1>
          <p className="admin-page-subtitle">Review applications and manage members</p>
        </div>
        {pendingCount > 0 && (
          <span style={{ background: "rgba(249,168,38,0.12)", color: "#b45309", fontSize: "0.8rem", fontWeight: 700, padding: "0.3rem 0.85rem", borderRadius: 100 }}>
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="admin-stat-strip" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: "1.5rem" }}>
        <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setStatusFilter("pending")}>
          <div className="admin-stat-card-top">
            <div className="admin-stat-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="admin-stat-number">{pendingCount}</div>
          <div className="admin-stat-label">Pending Review</div>
        </div>
        <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setStatusFilter("active")}>
          <div className="admin-stat-card-top">
            <div className="admin-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div className="admin-stat-number">{activeCount}</div>
          <div className="admin-stat-label">Active Members</div>
        </div>
        <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => setStatusFilter("all")}>
          <div className="admin-stat-card-top">
            <div className="admin-stat-icon teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="admin-stat-number">{users.length}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(29,35,59,0.07)", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(29,35,59,0.06)", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div className="admin-tabs">
            {(["pending","active","all"] as const).map(tab => (
              <button key={tab} className={`admin-tab${statusFilter === tab ? " active" : ""}`} onClick={() => setStatusFilter(tab)}>
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="admin-search"
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: "0.8rem", color: "rgba(16,16,16,0.4)", whiteSpace: "nowrap" }}>
            {filteredUsers.length} of {users.length}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "rgba(16,16,16,0.4)", fontSize: "0.875rem" }}>
            {search ? "No users match your search." : "No users found."}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Phone</th>
                  <th style={{ textAlign: "center" }}>Family Size</th>
                  <th>Status</th>
                  <th>Role / Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    currentUserEmail={user?.email || ""}
                    canManageRoles={canManageRoles}
                    onOpenCreate={openCreate}
                    onOpenReview={openReview}
                    onOpenEdit={openEdit}
                    onConfirm={setConfirm}
                    onUpdateStatus={updateStatus}
                    onDeleteMembership={deleteMembership}
                    onChangeRole={changeRole}
                    onDeleteUser={confirmDeleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                {editing.id === 0 ? "Create Membership" : isReview ? "Review Application" : "Edit Membership"}
              </h2>
              <button onClick={() => setEditing(null)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.06)", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {editingUser && (
                <div style={{ background: "rgba(30,58,68,0.04)", borderRadius: 10, padding: "0.85rem 1rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.5, marginBottom: "0.4rem" }}>Applicant</div>
                  <div><strong>{editingUser.name || "—"}</strong> · {editingUser.email}</div>
                  {editingUser.phone && <div style={{ opacity: 0.6 }}>{editingUser.phone}</div>}
                  <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: 4 }}>Applied {new Date(editingUser.createdAt).toLocaleDateString()}</div>
                </div>
              )}

              <div>
                <label className="modal-label">Status</label>
                <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="modal-field">
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
              <div>
                <label className="modal-label">Membership Type</label>
                <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className="modal-field">
                  {MEMBERSHIP_TYPES.map(t => <option key={t} value={t}>{t || "— None —"}</option>)}
                </select>
              </div>

              <div style={{ borderTop: "1px solid rgba(29,35,59,0.08)", paddingTop: "1rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.5, marginBottom: "0.75rem" }}>User Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Name", key: "userName", type: "text" },
                    { label: "Email", key: "userEmail", type: "email" },
                    { label: "Phone", key: "userPhone", type: "text" },
                    { label: "Number of Family Members", key: "userFamilyMembers", type: "number" },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="modal-label">{label}</label>
                      <input
                        type={type}
                        min={type === "number" ? 0 : undefined}
                        max={type === "number" ? 20 : undefined}
                        value={(editing as any)[key]}
                        onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                        className="modal-field"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button className="btn-ghost" onClick={() => setEditing(null)} style={{ fontSize: "0.875rem" }}>Cancel</button>
              <button className="btn-primary" onClick={saveEditing} style={{ fontSize: "0.875rem" }}>
                {editing.id === 0 || isReview ? "Approve & Save" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-panel" style={{ maxWidth: 380, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(220,38,38,0.1)", color: "#dc2626", fontSize: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>!</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>{confirm.title}</h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(16,16,16,0.6)", lineHeight: 1.6, marginBottom: "1.5rem" }}>{confirm.message}</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setConfirm(null)} style={{ fontSize: "0.875rem" }}>Cancel</button>
              <button
                onClick={() => { confirm.onConfirm(); setConfirm(null); }}
                style={{ background: "#dc2626", color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: 100, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--ink); margin-bottom: 0.3rem; opacity: 0.7; }
        .modal-field { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid rgba(29,35,59,0.12); border-radius: 8px; font-family: var(--font-body); font-size: 0.9rem; background: white; transition: border-color 0.15s; box-sizing: border-box; }
        .modal-field:focus { outline: none; border-color: var(--berry); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-panel { background: white; border-radius: 18px; padding: 1.75rem; width: 100%; max-width: 500px; box-shadow: 0 24px 64px rgba(0,0,0,0.18); }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
      `}</style>
    </div>
  );
}
