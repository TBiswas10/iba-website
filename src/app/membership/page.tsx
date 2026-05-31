"use client";

import { MembershipPanel } from "@/components/membership-panel";
import { useAuth } from "@/components/supabase-auth-context";

const BENEFITS = [
  {
    icon: "🤝",
    title: "Community Connection",
    description: "Join a warm, welcoming network of Bengali families across the Illawarra. Build lasting friendships and a real sense of belonging.",
  },
  {
    icon: "🎉",
    title: "Cultural Events",
    description: "Get priority access and invites to Pohela Boishakh, Durga Puja, community dinners, and more throughout the year.",
  },
  {
    icon: "📚",
    title: "Resources & Support",
    description: "Access community resources, stay informed through our member network, and connect with others who share your language and culture.",
  },
];

export default function MembershipPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="panel-stack">
        <div style={{ height: "340px", borderRadius: "22px", background: "rgba(255,255,255,0.5)" }} />
        <div style={{ height: "480px", borderRadius: "22px", background: "rgba(255,255,255,0.5)" }} />
      </div>
    );
  }

  // Logged-in: centered member panel, fills viewport
  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <section className="glass-panel" style={{ width: "100%", maxWidth: "480px", padding: "1.5rem 2rem" }}>
          <MembershipPanel />
        </section>
      </div>
    );
  }

  // Logged-out: show full marketing page + form
  return (
    <div className="panel-stack">

      {/* Hero */}
      <section className="glass-panel membership-hero-panel">
        <div className="membership-hero-grid">
          <div className="membership-hero-text">
            <p className="eyebrow" style={{ color: "var(--berry)", marginBottom: "1rem" }}>IBA Membership</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15, marginBottom: "1.25rem" }}>
              Be part of something real.
            </h1>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "rgba(16,16,16,0.65)", marginBottom: "2rem", maxWidth: "36ch" }}>
              The Illawarra Bengali Association brings families together through culture, events, and community — and membership is how you stay connected.
            </p>
            <a href="#join-form" className="btn-primary" style={{ display: "inline-block", width: "fit-content" }}>
              Become a Member
            </a>
          </div>
          <div className="membership-hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero3.jpeg" alt="IBA community" />
            <div className="membership-hero-overlay" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="glass-panel">
        <div className="membership-benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="membership-benefit-card">
              <div className="membership-benefit-icon">{b.icon}</div>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "1.05rem" }}>{b.title}</h3>
              <p style={{ fontSize: "0.93rem", lineHeight: 1.65, color: "rgba(16,16,16,0.68)", margin: 0 }}>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="glass-panel" id="join-form" style={{ scrollMarginTop: "100px", maxWidth: "560px", margin: "0 auto", width: "100%" }}>
        <MembershipPanel />
      </section>

    </div>
  );
}
