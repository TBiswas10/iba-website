"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

type User = {
  uid: string;
  email: string;
  role: string;
};

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
  const { logout } = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);

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
        fetch("/api/stats")
          .then(res => res.json())
          .then(data => {
            if (data.ok) {
              setCounts(data.data);
            }
          });
      })
      .catch(() => {
        router.push("/membership");
      });
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/membership");
  };

  if (!user) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <p>Loading...</p>
        </section>
      </section>
    );
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