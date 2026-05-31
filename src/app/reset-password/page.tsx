"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message || "Failed to update password. The reset link may have expired.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/membership"), 2500);
  }

  if (done) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
        <section className="glass-panel" style={{ width: "100%", maxWidth: "440px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <h2 style={{ marginBottom: "0.5rem" }}>Password updated</h2>
          <p style={{ color: "rgba(16,16,16,0.6)", fontSize: "0.9rem" }}>Redirecting you to login…</p>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <section className="glass-panel" style={{ width: "100%", maxWidth: "440px" }}>
        <h2 style={{ marginBottom: "0.25rem" }}>Set new password</h2>
        <p style={{ color: "rgba(16,16,16,0.55)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Choose a strong password for your account.
        </p>
        <form onSubmit={handleSubmit} className="membership-fields">
          <label className="membership-field">
            <span>New password</span>
            <input
              required
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <label className="membership-field">
            <span>Confirm password</span>
            <input
              required
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </label>
          {error && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
          <button className="btn-primary membership-submit" type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
