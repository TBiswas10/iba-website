"use client";

import { DonationForm } from "@/components/donation-form";
import { useSearchParams } from "next/navigation";

function ThankYouMessage() {
  return (
    <section className="glass-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", color: "var(--sunset)" }}>
        Thank You for Your Donation!
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        Your generosity helps us continue our mission of building a vibrant Bengali community in the Illawarra region.
      </p>
      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        Your contribution will be used to:
      </p>
      <ul style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto 2rem", fontSize: "1.1rem", lineHeight: "1.8" }}>
        <li>🏆 Support cultural programs and festivals that celebrate our heritage</li>
        <li>👨‍👩‍👧‍👦 Fund youth development initiatives and educational workshops</li>
        <li>🤝 Organize inclusive community gatherings that bring families together</li>
        <li>📚 Provide resources and support for community members of all ages</li>
        <li>🎭 Host cultural nights, art exhibitions, and traditional performances</li>
      </ul>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--teal)" }}>
        Every donation makes a difference. Thank you for being part of the IBA family!
      </p>
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <a href="/" className="btn-primary">Go Back to Home Page</a>
        <a href="/donations" className="btn-primary">Make Another Donation</a>
      </div>
    </section>
  );
}

export default function DonationsPage() {
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
    </section>
  );
}
