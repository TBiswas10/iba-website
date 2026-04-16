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
        fetchDonations();
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchDonations() {
    const res = await fetch("/api/admin/donations");
    const data = await res.json();
    if (data.ok) {
      setDonations(data.data || []);
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

  const totalCents = donations.reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Donations</h1>
        <p>Track all contributions to IBA.</p>
        <p className="stat-highlight">
          Total: <strong>${(totalCents / 100).toFixed(2)} AUD</strong>
        </p>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : donations.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>{d.donorName || "—"}</td>
                  <td>{d.donorEmail || "—"}</td>
                  <td>${(d.amountCents / 100).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${d.status.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}