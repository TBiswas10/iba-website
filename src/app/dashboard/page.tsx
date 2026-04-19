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
  const [isActivating, setIsActivating] = useState(false);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success");
  const membershipId = searchParams.get("membershipId");

  useEffect(() => {
    if (!user?.email) return;

    fetch(`/api/memberships/mine`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          setMembership(data.data);
        } else {
          setMembership(null);
        }
      })
      .catch(console.error);
  }, [user?.email]);

  // Auto-activate membership when redirected from payment
  useEffect(() => {
    if (!isSuccess || !membershipId || membership || isActivating) return;

    setIsActivating(true);
    fetch(`/api/memberships/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId: Number(membershipId) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setMembership(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsActivating(false));
  }, [isSuccess, membershipId, membership, isActivating]);

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

      {isSuccess && isActivating && (
        <section className="glass-panel" style={{ border: "2px solid var(--teal)" }}>
          <h3>Payment successful!</h3>
          <p>Activating your membership...</p>
        </section>
      )}

      {membership ? (
        <section className="glass-panel">
          <h2>Your Membership</h2>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <p><strong>Status:</strong> {membership.status === "ACTIVE" ? "Active Member" : "Pending"}</p>
            <p><strong>Valid until:</strong> {new Date(membership.expiryDate).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}</p>
            {membership.status === "EXPIRED" && (
              <p style={{ color: "#c42" }}>Your membership has expired. Please renew to continue.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="glass-panel">
          <Link href="/membership" className="btn-primary">
            Join as a Member
          </Link>
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
