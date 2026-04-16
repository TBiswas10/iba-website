"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

const MEMBERSHIP_TIERS = [
  { id: "FAMILY", name: "Family", desc: "Up to 5 members", price: "$10" },
  { id: "INDIVIDUAL", name: "Individual", desc: "Single adult", price: "$10" },
  { id: "STUDENT", name: "Student", desc: "Full-time student", price: "$10" },
] as const;

type Membership = {
  id: number;
  tier: string;
  status: string;
  expiryDate: string;
};

export function MembershipPanel() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useFirebaseAuth();
  const [message, setMessage] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("FAMILY");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetch("/api/memberships/mine")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setMembership(data.data);
        })
        .catch(console.error)
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [user]);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "");

    try {
      await signUpWithEmail(email, password, name);
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, tier: selectedTier }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        console.error("Signup API error:", json?.error?.message);
      }
    } catch (error: any) {
      setMessage(error.message || "Signup failed. Please try again.");
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      setMessage("Invalid email or password.");
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setMessage(error.message || "Google sign-in failed.");
    }
  }

  async function handleStripeCheckout() {
    setMessage("Redirecting to payment...");
    try {
      const response = await fetch("/api/admin/memberships/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          userId: user?.uid,
          email: user?.email,
        }),
      });
      const json = await response.json();
      if (json.ok && json.url) {
        window.location.href = json.url;
      } else {
        setMessage(json.error || "Payment initiation failed.");
      }
    } catch (error) {
      setMessage("Failed to connect to payment server.");
    }
  }

  if (loading || isChecking) {
    return (
      <section className="glass-panel">
        <p>Loading...</p>
      </section>
    );
  }

  if (user) {
    if (user.role === "ADMIN") {
      return (
        <section className="glass-panel member-welcome">
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👑</div>
          <h2>Welcome, Administrator</h2>
          <p>{user.email}</p>
          <span className="member-badge">ADMIN</span>
          <div className="button-row" style={{ marginTop: "1.5rem" }}>
            <Link href="/admin" className="btn-primary">
              Admin Console
            </Link>
            <button className="btn-ghost" onClick={() => logout()} type="button">
              Log out
            </button>
          </div>
        </section>
      );
    }

    const isActive = membership?.status === "ACTIVE";

    return (
      <section className="glass-panel member-welcome">
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👋</div>
        <h2>Welcome back!</h2>
        <p>{user.displayName || user.email}</p>
        <span className="member-badge" style={{ marginTop: "0.75rem", display: "inline-block" }}>{user.role || "MEMBER"}</span>
        
        {isActive ? (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="status-badge active" style={{ display: "inline-block" }}>Membership Active</p>
            <p style={{ marginTop: "0.5rem" }}>Valid until {new Date(membership!.expiryDate).toLocaleDateString()}</p>
            <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,255,255,0.5)", borderRadius: "12px" }}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Tier:</strong> {membership?.tier}</p>
              <p><strong>Status:</strong> {membership?.status}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="tier-select" style={{ marginTop: "1rem" }}>
              {MEMBERSHIP_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  className={`tier-btn ${selectedTier === tier.id ? "selected" : ""}`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <span className="tier-name">{tier.name}</span>
                  <span className="tier-price">{tier.price}/yr</span>
                </button>
              ))}
            </div>
            <div className="button-row" style={{ marginTop: "1.5rem" }}>
              <button className="btn-primary" onClick={handleStripeCheckout}>
                Pay {MEMBERSHIP_TIERS.find(t => t.id === selectedTier)?.name} ($10/yr)
              </button>
            </div>
          </>
        )}

        <div className="button-row" style={{ marginTop: "1.5rem" }}>
          <button className="btn-ghost" onClick={() => logout()} type="button">
            Log out
          </button>
        </div>
        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </section>
    );
  }

  return (
    <div className="panel-stack">
      <section className="glass-panel">
        <h2 style={{ marginBottom: "1.5rem" }}>Join Illawarra Bengali Association</h2>

        <form className="grid-form grid-form-auth" onSubmit={handleSignup}>
          <label>
            Full name
            <input required name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input required type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Create password
            <input required minLength={8} type="password" placeholder="Min 8 characters" name="password" />
          </label>
          <input type="hidden" name="tier" value={selectedTier} />
          <div className="span-2 button-row">
            <button className="btn-primary" type="submit">
              Join IBA {MEMBERSHIP_TIERS.find(t => t.id === selectedTier)?.name}
            </button>
          </div>
        </form>

        <div className="auth-sep">
          <span>or</span>
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleSignIn}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="auth-sep">
          <span>or</span>
        </div>

        <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>Already a member?</h3>
        <form className="grid-form grid-form-auth" onSubmit={handleLogin}>
          <label>
            Email
            <input required type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input required type="password" name="password" placeholder="Your password" />
          </label>
          <div className="span-2 button-row">
            <button className="btn-ghost" type="submit">
              Log in
            </button>
          </div>
        </form>

        {message && (
          <p style={{ color: message.includes("created") ? "var(--teal)" : "#c42", marginTop: "0.5rem" }}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
