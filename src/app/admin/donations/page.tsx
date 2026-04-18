"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Donation = {
  id: number;
  donorName: string;
  donorEmail: string;
  amountCents: number;
  status: string;
  message: string;
  createdAt: string;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

export default function AdminDonationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

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
        fetchDonations(1);
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchDonations(pageNum: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/donations?page=${pageNum}`);
    const data = await res.json();
    if (data.ok) {
      setDonations(data.data || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNum);
      setTotalAmount(data.total || 0);
    }
    setLoading(false);
  }

  if (!user) {
    return (
      <section className="panel-stack">
        <section className="glass-panel"><p>Loading...</p></section>
      </section>
    );
  }

  const totalCents = totalAmount;

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Donations</h1>
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
                      <span className="donation-value">{new Date(d.createdAt).toLocaleDateString("en-AU")}</span>
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