"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";

type Counts = {
  events: number;
  memberships: number;
  donations: number;
  gallery: number;
  resources: number;
  rsvps: number;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetch("/api/stats", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setCounts(data.data);
        }
      });
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/membership");
  };

  if (authLoading) {
    return (
      <section className="glass-panel skeleton-panel">
        <div className="skeleton skeleton-heading" style={{ width: "40%" }} />
        <div className="skeleton skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton skeleton-block" style={{ width: "100%", height: "200px", marginTop: "1.5rem" }} />
      </section>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <section className="panel-stack">
      <section className="admin-header">
        <div>
          <h1>Admin Console</h1>
          <p>{user.email}</p>
        </div>
        <button className="btn-ghost" onClick={handleLogout}>Log out</button>
      </section>

      <section className="stats-grid">
        <Link href="/admin/events" className="stat-card">
          <h3>{counts?.events || 0}</h3>
          <p>Events</p>
        </Link>
        <Link href="/admin/memberships" className="stat-card">
          <h3>{counts?.memberships || 0}</h3>
          <p>Memberships</p>
        </Link>
        <Link href="/admin/donations" className="stat-card">
          <h3>{counts?.donations || 0}</h3>
          <p>Donations</p>
        </Link>
        <Link href="/admin/rsvps" className="stat-card">
          <h3>{counts?.rsvps || 0}</h3>
          <p>RSVPs</p>
        </Link>
        <Link href="/admin/gallery" className="stat-card">
          <h3>{counts?.gallery || 0}</h3>
          <p>Gallery</p>
        </Link>
        <Link href="/admin/email" className="stat-card">
          <h3>✉️</h3>
          <p>Email Members</p>
        </Link>
      </section>
    </section>
  );
}