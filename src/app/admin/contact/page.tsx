"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

export default function AdminContactPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
        fetchSubmissions();
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchSubmissions() {
    const res = await fetch("/api/admin/contact");
    const data = await res.json();
    if (data.ok) {
      setSubmissions(data.data || []);
    }
    setLoading(false);
  }

  async function deleteSubmission(id: number) {
    await fetch(`/api/admin/contact?id=${id}`, { method: "DELETE" });
    fetchSubmissions();
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
      <section className="glass-panel">
        <h1>Contact Inbox</h1>
        <p>View and manage contact form submissions.</p>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        {loading ? (
          <p>Loading...</p>
        ) : submissions.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td>{sub.name}</td>
                  <td>{sub.email}</td>
                  <td>{sub.phone || "—"}</td>
                  <td className="message-cell">{sub.message}</td>
                  <td>
                    <button className="btn-danger" onClick={() => deleteSubmission(sub.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}