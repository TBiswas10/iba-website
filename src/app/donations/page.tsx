"use client";

import Link from "next/link";
import { DonationForm } from "@/components/donation-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouMessage() {
  return (
    <section className="glass-panel" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "var(--sunset)" }}>
        Thank You for Your Donation!
      </h1>
      <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
        Your generosity helps us continue our mission of building a vibrant Bengali community in the Illawarra region.
      </p>
      <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
        Your contribution will be used to:
      </p>
      <ul style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto 1.5rem", fontSize: "0.95rem", lineHeight: "1.7", paddingLeft: "1.25rem" }}>
        <li>🏆 Support cultural programs and festivals that celebrate our heritage</li>
        <li>👨‍👩‍👧‍👦 Fund youth development initiatives and educational workshops</li>
        <li>🤝 Organize inclusive community gatherings that bring families together</li>
        <li>📚 Provide resources and support for community members of all ages</li>
        <li>🎭 Host cultural nights, art exhibitions, and traditional performances</li>
      </ul>
      <p style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--teal)" }}>
        Every donation makes a difference. Thank you for being part of the IBA family!
      </p>
      <div className="button-row" style={{ marginTop: "1.5rem", justifyContent: "center" }}>
        <Link href="/" className="btn-primary">Go Back to Home Page</Link>
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <Link href="/donations" className="btn-ghost">Make Another Donation</Link>
      </div>
    </section>
  );
}

function DonationsContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (success === "true") {
    return (
      <section className="panel-stack">
        <ThankYouMessage />
      </section>
    );
  }

  return (
    <section className="panel-stack form-full-width">
      <section className="glass-panel">
        <h1>Donations</h1>
        <p>
          Support cultural programs, youth development, and inclusive community gatherings in
          Illawarra.
        </p>
      </section>
      <section className="glass-panel">
        <DonationForm />
      </section>
      <section className="glass-panel direct-transfer">
        <h2>Or Direct Bank Transfer / PayID</h2>
        <p className="transfer-subtitle">Donations of any amount welcome</p>
        <div className="transfer-options">
          <div className="transfer-card">
            <span className="transfer-label">PayID</span>
            <span className="transfer-value">0411633762</span>
          </div>
          <div className="transfer-card">
            <span className="transfer-label">Bank Name</span>
            <span className="transfer-value">Debabrata Biswas</span>
          </div>
          <div className="transfer-card">
            <span className="transfer-label">BSB</span>
            <span className="transfer-value">062105</span>
          </div>
          <div className="transfer-card">
            <span className="transfer-label">A/C</span>
            <span className="transfer-value">10300439</span>
          </div>
        </div>
      </section>
    </section>
  );
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<div className="panel-stack"><div className="glass-panel">Loading...</div></div>}>
      <DonationsContent />
    </Suspense>
  );
}
