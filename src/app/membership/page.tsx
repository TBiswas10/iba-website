"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MembershipPanel } from "@/components/membership-panel";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

export default function MembershipPage() {
  const { loading } = useFirebaseAuth();

  if (loading) {
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
      <section className="glass-panel">
        <h1>Membership</h1>
        <p>Join as a family, individual, or student member and access community programs.</p>
      </section>
      <MembershipPanel />
    </section>
  );
}