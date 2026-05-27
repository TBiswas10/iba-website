"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";


type Donation = {
  id: number;
  donorName: string;
  donorEmail: string;
  amountCents: number;
  status: string;
  message: string;
  createdAt: string;
};

export default function AdminDonationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    fetchDonations(1);
  }, [user, authLoading]);

  async function fetchDonations(pageNum: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/donations?page=${pageNum}`, { method: "GET" });
    const data = await res.json();
    if (data.ok) {
      setDonations(data.data || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNum);
      setTotalAmount(data.totalAmount || 0);
    }
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <div className="skeleton skeleton-heading" style={{ width: "220px" }} />
          <div className="skeleton skeleton-line" style={{ width: "200px", marginTop: "0.35rem" }} />
          <div className="skeleton skeleton-line" style={{ width: "160px", marginTop: "0.75rem" }} />
          <div className="skeleton skeleton-line" style={{ width: "140px", marginTop: "0.5rem" }} />
        </section>
        <section className="glass-panel">
          <div className="donation-cards">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="donation-card">
                <div className="donation-card-header">
                  <div className="skeleton skeleton-heading" style={{ width: "100px", height: "24px" }} />
                  <div className="skeleton skeleton-line" style={{ width: "80px" }} />
                </div>
                <div className="skeleton skeleton-line" style={{ width: "160px", marginTop: "0.5rem" }} />
                <div className="skeleton skeleton-line" style={{ width: "220px" }} />
              </div>
            ))}
          </div>
        </section>
      </section>
    );
  }

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  const totalCents = totalAmount;

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Donations via Stripe</h1>
        <p>Track all contributions to IBA.</p>
        <p className="stat-highlight">
          Total: <strong>${(totalCents / 100).toFixed(2)} AUD</strong>
        </p>
        <div className="admin-back-link">
          <a href="/admin" className="btn-ghost">← Back to Admin</a>
        </div>
      </section>

      <section className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : donations.length === 0 ? (
          <p className="empty-state">No donations yet.</p>
        ) : (
          <>
            <div className="donation-cards">
              {donations.map((d) => (
                <div key={d.id} className="donation-card">
                  <div className="donation-card-header">
                    <span className="donation-amount">${(d.amountCents / 100).toFixed(2)}</span>
                    <span className={`status-badge ${d.status.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="donation-card-body">
                    <div className="donation-row">
                      <span className="donation-label">Donor</span>
                      <span className="donation-value">{d.donorName || "—"}</span>
                    </div>
                    <div className="donation-row">
                      <span className="donation-label">Email</span>
                      <span className="donation-value">{d.donorEmail || "—"}</span>
                    </div>
                    <div className="donation-row">
                      <span className="donation-label">Date</span>
                      <span className="donation-value">{new Date(d.createdAt).toLocaleDateString(undefined)}</span>
                    </div>
                    {d.message && (
                      <div className="donation-row">
                        <span className="donation-label">Message</span>
                        <span className="donation-value">{d.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn-ghost" 
                  disabled={page <= 1}
                  onClick={() => fetchDonations(page - 1)}
                >
                  Previous
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button 
                  className="btn-ghost" 
                  disabled={page >= totalPages}
                  onClick={() => fetchDonations(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
}