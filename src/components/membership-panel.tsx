"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/supabase-auth-context";

type Membership = {
  id: number;
  status: string;
  expiryDate: string;
};

export function MembershipPanel() {
  const { user, loading, signInWithEmail, logout } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [familyMembersList, setFamilyMembersList] = useState([""]);
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.email) {
      setIsChecking(true);
      fetch("/api/memberships/mine", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data) {
            setMembership(data.data);
          } else {
            setMembership(null);
          }
        })
        .catch(() => setMembership(null))
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
    const phone = String(formData.get("phone") || "");
    const familyMembers = familyMembersList.map((_, i) => String(formData.get(`familyMember-${i}`) || "")).filter(Boolean).join(", ");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone: phone || undefined, familyMembers: familyMembers || undefined }),
      });
      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error?.message || "Signup failed. Please try again.");
        return;
      }

      // User created and confirmed — sign them in
      await signInWithEmail(email, password);
    } catch (error: any) {
      setMessage(error.message || "Signup failed. Please try again.");
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const email = loginEmailRef.current?.value || "";
    const password = loginPasswordRef.current?.value || "";

    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      setMessage("Invalid email or password.");
    }
  }

  if (loading || isChecking) {
    return (
      <section className="glass-panel skeleton-panel">
        <div className="skeleton skeleton-circle" />
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" style={{ width: "100%", marginTop: "1rem" }} />
        <div className="skeleton skeleton-line" style={{ width: "80%", marginTop: "0.5rem" }} />
        <div className="skeleton skeleton-line" style={{ width: "50%" }} />
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
          <span className="member-badge" style={{ marginTop: "0.5rem" }}>ADMIN</span>
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

    const isActive = membership && membership.status === "ACTIVE";

    return (
      <section className="glass-panel member-welcome">
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👋</div>
        <h2>Welcome back!</h2>
        <p>{user.name || user.email}</p>
        
        {isActive ? (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="status-badge active" style={{ display: "inline-block" }}>Membership Active</p>
            <p style={{ marginTop: "0.5rem" }}>Valid until {new Date(membership!.expiryDate).toLocaleDateString(undefined)}</p>
            <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,255,255,0.5)", borderRadius: "12px" }}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Status:</strong> {membership?.status}</p>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: "1.5rem", textAlign: "center" }}>No active membership found. Contact the association for assistance.</p>
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
        <h2 style={{ marginBottom: "1.5rem" }}>Membership Registration*</h2>

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
            <span className="password-wrapper">
              <input required minLength={8} type={showSignupPassword ? "text" : "password"} placeholder="Min 8 characters" name="password" />
              <button type="button" className="password-toggle" onClick={() => setShowSignupPassword(!showSignupPassword)} tabIndex={-1}>
                {showSignupPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          <label>
            Phone number
            <input type="tel" name="phone" placeholder="0400000000" />
          </label>
          <div>
            <label style={{ marginBottom: "0.35rem", display: "inline-block" }}>Associated family members (if any)</label>
            {familyMembersList.map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input name={`familyMember-${i}`} placeholder="Name of family member" style={{ flex: 1 }} />
                {familyMembersList.length > 1 && (
                  <button type="button" className="btn-ghost" style={{ padding: "0 0.75rem", fontSize: "1.25rem", lineHeight: 1 }} onClick={() => setFamilyMembersList(familyMembersList.filter((_, j) => j !== i))}>-</button>
                )}
                {i === familyMembersList.length - 1 && familyMembersList.length < 4 && (
                  <button type="button" className="btn-ghost" style={{ padding: "0 0.75rem", fontSize: "1.25rem", lineHeight: 1 }} onClick={() => setFamilyMembersList([...familyMembersList, ""])}>+</button>
                )}
              </div>
            ))}
          </div>
          <div className="span-2 button-row">
            <button className="btn-primary" type="submit">
              Submit Application
            </button>
          </div>
        </form>

        <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>Login to Member Portal</h3>
        <form className="grid-form grid-form-auth" onSubmit={handleLogin}>
          <label>
            Email
            <input required type="email" placeholder="you@example.com" ref={loginEmailRef} />
          </label>
          <label>
            Password
            <span className="password-wrapper">
              <input required type={showLoginPassword ? "text" : "password"} placeholder="Your password" ref={loginPasswordRef} />
              <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)} tabIndex={-1}>
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </span>
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
        <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted, #666)" }}>
          *Upon submission, your registration will be reviewed by the management team for approval.
        </p>
      </section>
    </div>
  );
}
