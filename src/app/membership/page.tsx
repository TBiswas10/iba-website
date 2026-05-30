"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MembershipPanel } from "@/components/membership-panel";
import { useAuth } from "@/components/supabase-auth-context";

export default function MembershipPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <section className="panel-stack form-full-width">
        <section className="glass-panel">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-line" style={{ width: "70%", margin: "0 auto" }} />
        </section>
        <section className="glass-panel skeleton-panel">
          <div className="skeleton skeleton-line" style={{ width: "30%" }} />
          <div className="skeleton skeleton-form-field" style={{ width: "100%", marginTop: "4px" }} />
          <div className="skeleton skeleton-form-field" style={{ width: "100%" }} />
          <div className="skeleton skeleton-form-field" style={{ width: "100%" }} />
          <div className="skeleton skeleton-btn" style={{ width: "100%" }} />
          <div className="auth-sep"><span style={{ visibility: "hidden" }}>or</span></div>
          <div className="skeleton skeleton-btn" style={{ width: "100%", height: "44px" }} />
          <div style={{ marginTop: "1.5rem", width: "100%" }}>
            <div className="skeleton skeleton-line" style={{ width: "40%", margin: "0 auto 16px" }} />
            <div className="skeleton skeleton-form-field" style={{ width: "100%" }} />
            <div className="skeleton skeleton-form-field" style={{ width: "100%" }} />
            <div className="skeleton skeleton-btn" style={{ width: "100%", height: "44px", borderRadius: "100px" }} />
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="panel-stack form-full-width">
      <section className="glass-panel">
        <h1>Membership</h1>
        <p>Join as a General, Associate, Life, or Honorary member and access community programs.</p>
      </section>
      <MembershipPanel />
    </section>
  );
}