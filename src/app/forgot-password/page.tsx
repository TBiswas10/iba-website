"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);

    if (err) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <section className="glass-panel" style={{ width: "100%", maxWidth: "440px" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
            <h2 style={{ marginBottom: "0.75rem" }}>Check your email</h2>
            <p style={{ color: "rgba(16,16,16,0.65)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              We&apos;ve sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
            </p>
            <Link href="/membership" className="btn-ghost" style={{ display: "inline-block" }}>
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: "0.25rem" }}>Forgot password?</h2>
            <p style={{ color: "rgba(16,16,16,0.55)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="membership-fields">
              <label className="membership-field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
              {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
              <button className="btn-primary membership-submit" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link href="/membership" style={{ fontSize: "0.8rem", color: "var(--berry)", textDecoration: "none" }}>
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
