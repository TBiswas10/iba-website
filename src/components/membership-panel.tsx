"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/supabase-auth-context";

type Membership = {
  id: number;
  status: string;
  type: string | null;
  startDate: string;
};

type Invoice = {
  id: number;
  recipientName: string;
  amountCents: number;
  description: string;
  category: string | null;
  receiptUrl: string | null;
  invoicePdfUrl: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

export function MembershipPanel() {
  const { user, loading, signInWithEmail, logout } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formRecipient, setFormRecipient] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formReceipt, setFormReceipt] = useState<File | null>(null);
  const [formMsg, setFormMsg] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBsb, setBankBsb] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  useEffect(() => {
    if (user?.email) {
      fetch("/api/user/bank-details", { method: "POST" })
        .then(r => r.json())
        .then(d => { if (d.ok) { setBankAccountName(d.data.bankAccountName || ""); setBankBsb(d.data.bankBsb || ""); setBankAccountNumber(d.data.bankAccountNumber || ""); } })
        .catch(() => {});
    }
  }, [user]);

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

  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/reimbursements")
      .then(r => r.json())
      .then(d => { if (d.ok) setInvoices(d.data || []); })
      .catch(() => {});
  }, [user]);

  const isLifeMember = membership?.type === "Life Member" && membership?.status === "ACTIVE";

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "");
    const phone = String(formData.get("phone") || "");
    const familyMembers = String(formData.get("familyMembers") || "");

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

      // Show "check your email" screen — user must confirm before logging in
      setApplicationSubmitted(true);
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

  if (applicationSubmitted) {
    return (
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
        <h2 style={{ marginBottom: "0.75rem" }}>Check your email</h2>
        <p style={{ color: "rgba(16,16,16,0.65)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
          We&apos;ve sent a confirmation link to your email address. Click it to verify your account.
        </p>
        <p style={{ color: "rgba(16,16,16,0.5)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
          Once confirmed, your membership application will be reviewed by the committee. You&apos;ll receive another email when it&apos;s approved.
        </p>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (user) {
    if (user.role === "ADMIN") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👑</div>
          <p className="eyebrow" style={{ color: "var(--berry)", marginBottom: "0.25rem" }}>Admin Account</p>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{user.name || "Administrator"}</h2>
          <p style={{ color: "rgba(16,16,16,0.5)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{user.email}</p>
          <span className="member-badge">ADMIN</span>
          <div style={{ borderTop: "1px solid rgba(29,35,59,0.08)", margin: "1.25rem 0" }} />
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link href="/admin" className="btn-primary">Admin Console</Link>
            <button className="btn-ghost" onClick={() => logout()} type="button">Log out</button>
          </div>
        </div>
      );
    }

    const isActive = membership?.status === "ACTIVE";
    const isPending = membership?.status === "PENDING";

    return (
      <div style={{ padding: "1rem 0" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: isActive ? "linear-gradient(135deg, var(--teal), #2a9d8f)" : "linear-gradient(135deg, #f9a826, #e07b00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem" }}>
            {isActive ? "👋" : "⏳"}
          </div>
          <p className="eyebrow" style={{ color: "var(--berry)", marginBottom: "0.5rem" }}>Member Portal</p>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>Welcome back, {user.name?.split(" ")[0] || "Member"}!</h2>
          <p style={{ color: "rgba(16,16,16,0.5)", fontSize: "0.95rem" }}>{user.email}</p>
        </div>

        <div style={{ background: "rgba(29,35,59,0.03)", borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          {isActive ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(16,16,16,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Membership Status</p>
                <p style={{ fontWeight: 700, color: "var(--teal)", fontSize: "1rem" }}>Active</p>
              </div>
              {membership!.type && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(16,16,16,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Type</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{membership!.type}</p>
                </div>
              )}
            </div>
          ) : isPending ? (
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(16,16,16,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Membership Status</p>
              <p style={{ fontWeight: 700, color: "#b45309", fontSize: "1rem", marginBottom: "0.5rem" }}>Pending Review</p>
              <p style={{ fontSize: "0.875rem", color: "rgba(16,16,16,0.55)" }}>Your application is being reviewed by the committee. You will receive an email once approved.</p>
            </div>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "rgba(16,16,16,0.55)" }}>No active membership found. Contact us at iba.illawarra@gmail.com for assistance.</p>
          )}
        </div>

        <div className="button-row" style={{ marginTop: "1.5rem", justifyContent: "center" }}>
          <Link href="/" className="btn-primary">Home</Link>
          <button className="btn-ghost" onClick={() => logout()} type="button">Log out</button>
        </div>
        {message && <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>{message}</p>}
      </div>
    );
  }

  return (
    <div className="membership-form-root">
      {/* Sign up */}
      <div className="membership-form-section">
        <h2 className="membership-form-heading">Membership Registration Form</h2>
        <form className="membership-fields" onSubmit={handleSignup}>
          <label className="membership-field">
            <span>Full name</span>
            <input required name="name" placeholder="Your name" />
          </label>
          <label className="membership-field">
            <span>Email</span>
            <input required type="email" name="email" placeholder="you@example.com" />
          </label>
          <label className="membership-field">
            <span>Password</span>
            <span className="password-wrapper">
              <input required minLength={8} type={showSignupPassword ? "text" : "password"} placeholder="Min. 8 characters" name="password" />
              <button type="button" className="password-toggle" onClick={() => setShowSignupPassword(!showSignupPassword)} tabIndex={-1}>
                {showSignupPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          <label className="membership-field">
            <span>Phone <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></span>
            <input type="tel" name="phone" placeholder="0400000000" />
          </label>
          <label className="membership-field">
            <span>Family size <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></span>
            <input type="number" name="familyMembers" min="0" max="20" placeholder="0" />
          </label>
          <button className="btn-primary membership-submit" type="submit">Submit Application</button>
        </form>
      </div>

      {/* Divider */}
      <div className="membership-divider">
        <span>Already a member?</span>
      </div>

      {/* Log in */}
      <div className="membership-form-section">
        <h2 className="membership-form-heading">Login to Membership Portal</h2>
        <form className="membership-fields" onSubmit={handleLogin}>
          <label className="membership-field">
            <span>Email</span>
            <input required type="email" placeholder="you@example.com" ref={loginEmailRef} />
          </label>
          <label className="membership-field">
            <span>Password</span>
            <span className="password-wrapper">
              <input required type={showLoginPassword ? "text" : "password"} placeholder="Your password" ref={loginPasswordRef} />
              <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)} tabIndex={-1}>
                {showLoginPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          <button className="btn-ghost membership-submit" type="submit">Log in</button>
        </form>
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <a href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--berry)", textDecoration: "none" }}>
            Forgot password?
          </a>
        </div>
      </div>

      {message && (
        <p style={{ color: "#c42", marginTop: "1rem", fontSize: "0.9rem" }}>{message}</p>
      )}
      <p style={{ marginTop: "1.25rem", fontSize: "0.8rem", color: "rgba(16,16,16,0.4)", textAlign: "center", lineHeight: 1.6 }}>
        Your application will be reviewed by the management team before approval.
      </p>
    </div>
  );
}
