"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";

type Invoice = {
  id: number;
  recipientName: string;
  amountCents: number;
  description: string;
  category: string | null;
  receiptUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: { name: string | null; email: string };
};

export default function AdminReimbursementsPage() {
  const { user, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});

  async function fetchInvoices() {
    setLoading(true);
    const res = await fetch("/api/admin/reimbursements", { method: "GET" });
    const data = await res.json();
    if (data.ok) setInvoices(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    fetchInvoices();
  }, [user, authLoading]);

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/reimbursements", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNotes: notes[id] || undefined }),
    });
    fetchInvoices();
  }

  if (authLoading || loading) {
    return (
      <section className="panel-stack">
        <section className="admin-header" style={{ marginBottom: "1.5rem" }}>
          <div className="skeleton skeleton-heading" style={{ width: "260px" }} />
          <div className="skeleton skeleton-line" style={{ width: "140px" }} />
        </section>
        <section className="glass-panel" style={{ padding: "1.5rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: i < 3 ? "1px solid rgba(29,35,59,0.08)" : "none" }}>
              <div style={{ flex: 2 }}><div className="skeleton skeleton-line" style={{ width: "80%" }} /></div>
              <div style={{ flex: 1 }}><div className="skeleton skeleton-line" style={{ width: "60%" }} /></div>
              <div style={{ flex: 1 }}><div className="skeleton skeleton-line" style={{ width: "40%" }} /></div>
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
          <h1>Reimbursement Invoices</h1>
          <p>Review and approve/reject Life member reimbursement requests.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel" style={{ padding: "1.5rem" }}>
        {invoices.length === 0 ? (
          <div className="empty-state">No reimbursement invoices yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Date</th>
                  <th style={{ width: "1px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.user.name || inv.user.email}</td>
                    <td>{inv.recipientName}</td>
                    <td>${(inv.amountCents / 100).toFixed(2)}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.description}</td>
                    <td>{inv.category || "—"}</td>
                    <td>{inv.receiptUrl ? <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)", fontSize: "0.85rem" }}>View</a> : "—"}</td>
                    <td>
                      <span style={{
                        padding: "2px 10px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 600,
                        background: inv.status === "APPROVED" ? "rgba(13,127,120,0.1)" : inv.status === "REJECTED" ? "rgba(220,38,38,0.1)" : "rgba(249,168,38,0.12)",
                        color: inv.status === "APPROVED" ? "var(--teal)" : inv.status === "REJECTED" ? "#dc2626" : "#b45309",
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.status === "PENDING" ? (
                        <input
                          placeholder="Admin note..."
                          value={notes[inv.id] || ""}
                          onChange={e => setNotes({ ...notes, [inv.id]: e.target.value })}
                          style={{ width: "120px", padding: "0.3rem 0.5rem", fontSize: "0.75rem", borderRadius: "6px", border: "1px solid rgba(29,35,59,0.15)", font: "inherit" }}
                        />
                      ) : (
                        <span style={{ fontSize: "0.8rem", fontStyle: "italic", opacity: 0.6 }}>{inv.adminNotes || "—"}</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>
                      {inv.status === "PENDING" ? (
                        <div className="action-buttons" style={{ flexWrap: "nowrap" }}>
                          <button
                            onClick={() => updateStatus(inv.id, "APPROVED")}
                            style={{
                              background: "var(--teal)", color: "white", border: "none",
                              padding: "0.35rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem",
                              fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                            }}>
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(inv.id, "REJECTED")}
                            style={{
                              background: "transparent", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)",
                              padding: "0.35rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem",
                              fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap"
                            }}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8rem", opacity: 0.4 }}>—</span>
                      )}
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
