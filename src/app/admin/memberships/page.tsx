"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Membership = {
  id: number;
  status: string;
  expiryDate: string;
};

type UserData = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  memberships: Membership[];
};

type AdminUser = {
  uid: string;
  email: string;
  role: string;
};

export default function AdminMembershipsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push("/membership");
          return;
        }
        if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setAdminUser(data.user);
        fetchUsers();
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/memberships");
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
    if (!confirm("Are you sure you want to delete this membership?")) return;
    await fetch(`/api/admin/memberships?id=${id}`, { method: "DELETE" });
    fetchUsers();
  }

  async function toggleRole(userId: number, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const msg = currentRole === "ADMIN" 
      ? "Demote this admin to a regular user?" 
      : "Promote this user to an administrator?";
    
    if (!confirm(msg)) return;

    await fetch("/api/admin/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "CHANGE_ROLE", role: newRole }),
    });
    fetchUsers();
  }

  async function createMembership(userId: number) {
    if (!confirm("Manually create an active 1-year membership for this user?")) return;
    await fetch("/api/admin/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "CREATE_MEMBERSHIP" }),
    });
    fetchUsers();
  }

  if (!adminUser) {
    return (
      <section className="panel-stack">
        <section className="glass-panel"><p>Loading...</p></section>
      </section>
    );
  }

  return (
    <section className="panel-stack">
      <section className="admin-header">
        <div>
          <h1>Users & Memberships</h1>
          <p>Manage all users and their membership status.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Membership Status</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const m = u.memberships[0];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.name || "—"}</div>
                        <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>{u.email}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ 
                            fontSize: "0.75rem", 
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            background: u.role === "ADMIN" ? "var(--berry)" : "rgba(0,0,0,0.05)",
                            color: u.role === "ADMIN" ? "white" : "inherit"
                          }}>
                            {u.role}
                          </span>
                          {adminUser.email === "tirthabiswasm@gmail.com" && u.email !== adminUser.email && (
                            <button 
                              className="btn-small" 
                              style={{ padding: "1px 4px", fontSize: "0.65rem", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "var(--ink)" }}
                              onClick={() => toggleRole(u.id, u.role)}
                            >
                              {u.role === "ADMIN" ? "Demote" : "Make Admin"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {m ? (
                          <span className={`status-badge ${m.status.toLowerCase()}`}>
                            {m.status}
                          </span>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>None</span>
                        )}
                      </td>
                      <td>
                        {m ? new Date(m.expiryDate).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!m ? (
                            <button className="btn-small" onClick={() => createMembership(u.id)}>
                              Join
                            </button>
                          ) : (
                            <>
                              {m.status !== "ACTIVE" && (
                                <button className="btn-small" onClick={() => updateStatus(m.id, "ACTIVE")}>
                                  Approve
                                </button>
                              )}
                              {m.status === "ACTIVE" && (
                                <button className="btn-small" onClick={() => updateStatus(m.id, "EXPIRED")}>
                                  Expire
                                </button>
                              )}
                              <button className="btn-small btn-danger" onClick={() => deleteMembership(m.id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}