"use client";

import { FormEvent, useState } from "react";

export function PasswordSetup() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirm = String(formData.get("confirm") || "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const response = await fetch("/api/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Failed to set password");
      return;
    }

    setMessage("Password set! You can now sign in with email + password.");
    event.currentTarget.reset();
  }

  return (
    <section className="glass-panel">
      <h2>Set a Password</h2>
      <p className="text-muted">Set a password so you can sign in without Google.</p>
      <form onSubmit={handleSetPassword}>
        <label>
          Password
          <input type="password" name="password" minLength={6} required />
        </label>
        <label>
          Confirm Password
          <input type="password" name="confirm" minLength={6} required />
        </label>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <button className="btn-primary" type="submit">
          Set Password
        </button>
      </form>
    </section>
  );
}