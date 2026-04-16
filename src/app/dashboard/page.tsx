"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

type Membership = {
  id: number;
  tier: string;
  status: string;
  expiryDate: string;
};

function DashboardContent() {
  const { user, loading, logout } = useFirebaseAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success");

  useEffect(() => {
    if (!user?.email) return;

    fetch(`/api/memberships/mine`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          setMembership(data.data);
        }
      })
      .catch(console.error);
  }, [user?.email]);

  if (loading) {
    return (
      <section className="panel-stack">
        <section className="glass-panel">
          <p>Loading...</p>
        </section>
      </section>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/membership";
    }
    return null;
  }

  const role = user.role || "MEMBER";

  if (role === "ADMIN") {
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
    return null;
  }

  return (
    <section className="panel-stack">
      <section className="admin-header">
        <div>
          <h1>Member Dashboard</h1>
          <p>{user.email}</p>
        </div>
        <button className="btn-ghost" onClick={() => logout()}>
          Log out
        </button>
      </section>

      {isSuccess && !membership && (
        <section className="glass-panel" style={{ border: "2px solid var(--teal)" }}>
          <h3>Payment successful!</h3>
          <p>Your membership is being processed. Please refresh this page in a few moments.</p>
        </section>
      )}

      {membership ? (
        <section className="glass-panel">
          <h2>Your Membership</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <p><strong>Tier:</strong> {membership.tier}</p>
            <p><strong>Status:</strong> {membership.status === "ACTIVE" ? "Paid (Active)" : "Pending Approval"}</p>
            <p><strong>Valid until:</strong> {new Date(membership.expiryDate).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}</p>
          </div>
        </section>
      ) : (
        <section className="glass-panel">
          <p>No membership record yet. Ask an admin to activate your membership.</p>
        </section>
      )}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
