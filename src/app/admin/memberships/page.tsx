"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Membership = {
  id: number;
  status: string;
  expiryDate: string;
  user: {
    name: string | null;
    email: string;
  } | null;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

export default function AdminMembershipsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
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
        setUser(data.user);
        fetchMemberships();
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchMemberships() {
    const res = await fetch("/api/admin/memberships");
    const data = await res.json();
    if (data.ok) {
      setMemberships(data.data || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/memberships", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchMemberships();
  }

  async function deleteMembership(id: number) {
    await fetch(`/api/admin/memberships?id=${id}`, { method: "DELETE" });
    fetchMemberships();
  }

  if (!user) {
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
          <h1>Memberships</h1>
          <p>View and manage member subscriptions.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : memberships.length === 0 ? (
          <p>No memberships yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m.id}>
                    <td>{m.user?.name || "—"}</td>
                    <td>{m.user?.email || "—"}</td>
                    <td>
                      <span className={`status-badge ${m.status.toLowerCase()}`}>{m.status}</span>
                    </td>
                    <td>{new Date(m.expiryDate).toLocaleDateString(undefined)}</td>
                    <td>
                      <div className="action-buttons">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}