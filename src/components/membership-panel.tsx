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
  const [familyMembersList, setFamilyMembersList] = useState([""]);
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

      // Sign them in then show application submitted screen
      try {
        await signInWithEmail(email, password);
      } catch { /* ignore — user already created */ }
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
      <section className="glass-panel member-welcome" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem", color: "var(--teal, #2a9d8f)" }}>✓</div>
        <h2>Application Submitted</h2>
        <p style={{ marginTop: "1rem", maxWidth: "400px", marginInline: "auto" }}>
          Your membership application has been submitted to the management team for review.
          You will be notified once it has been approved.
        </p>
        <div className="button-row" style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
          <button className="btn-ghost" onClick={() => logout()} type="button">
            Log out
          </button>
        </div>
      </section>
    );
  }

  if (user) {
    if (user.role === "ADMIN") {
      return (
        <section className="glass-panel member-welcome">
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>👑</div>
          <h2>Welcome, {user.name || "Administrator"}</h2>
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

    const isActive = membership?.status === "ACTIVE";
    const isPending = membership?.status === "PENDING";

    return (
      <section className="glass-panel member-welcome">
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{isActive ? "👋" : "⏳"}</div>
        <h2>Welcome back!</h2>
        <p>{user.name || user.email}</p>
        
        {isActive ? (
          <div style={{ marginTop: "1.5rem" }}>
            <p className="status-badge active" style={{ display: "inline-block" }}>Membership Active</p>
            {membership!.type && <p style={{ marginTop: "0.5rem" }}>Type: <strong>{membership!.type}</strong></p>}
          </div>
        ) : isPending ? (
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p className="status-badge" style={{ display: "inline-block", background: "var(--yellow, #e9c46a)", color: "#333" }}>Pending Review</p>
            <p style={{ marginTop: "1rem" }}>Your application is being reviewed by the management team.</p>
          </div>
        ) : (
          <p style={{ marginTop: "1.5rem", textAlign: "center" }}>No active membership found. Contact the association for assistance.</p>
        )}

        {isLifeMember && (
          <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(29,35,59,0.1)" }}>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Reimbursement Invoices</h3>

            {showForm ? (
              <form onSubmit={async e => {
                e.preventDefault(); setFormMsg("");
                let receiptUrl = "";
                if (formReceipt) {
                  const fd = new FormData(); fd.append("file", formReceipt);
                  const r = await fetch("/api/reimbursements/upload", { method: "POST", body: fd });
                  const rd = await r.json();
                  if (!rd.ok) { setFormMsg("Upload failed"); return; }
                  receiptUrl = rd.url;
                }
                const res = await fetch("/api/reimbursements", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipientName: formRecipient,
                    amountCents: Math.round(parseFloat(formAmount) * 100),
                    description: formDesc,
                    category: formCategory || undefined,
                    receiptUrl: receiptUrl || undefined,
                  }),
                });
                const d = await res.json();
                if (!d.ok) { setFormMsg(d.error || "Failed"); return; }
                setShowForm(false); setFormRecipient(""); setFormAmount(""); setFormDesc(""); setFormCategory(""); setFormReceipt(null);
                fetch("/api/reimbursements").then(r => r.json()).then(dd => { if (dd.ok) setInvoices(dd.data || []); });
              }} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                <input required placeholder="Recipient name" value={formRecipient} onChange={e => setFormRecipient(e.target.value)} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit" }} />
                <input required type="number" step="0.01" placeholder="Amount ($)" value={formAmount} onChange={e => setFormAmount(e.target.value)} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit" }} />
                <input placeholder="Category (optional)" value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit" }} />
                <textarea required placeholder="Description" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit", resize: "vertical" }} />
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Receipt (optional)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={e => setFormReceipt(e.target.files?.[0] || null)} style={{ fontSize: "0.85rem" }} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn-primary" type="submit" style={{ fontSize: "0.85rem" }}>Submit Invoice</button>
                  <button className="btn-ghost" type="button" onClick={() => setShowForm(false)} style={{ fontSize: "0.85rem" }}>Cancel</button>
                </div>
                {formMsg && <p style={{ fontSize: "0.85rem", color: "#c42" }}>{formMsg}</p>}
              </form>
            ) : (
              <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                + New Invoice
              </button>
            )}

            {invoices.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {invoices.map(inv => (
                  <div key={inv.id} style={{
                    padding: "0.75rem 1rem", borderRadius: "10px",
                    background: "rgba(255,255,255,0.5)", border: "1px solid rgba(29,35,59,0.06)",
                    fontSize: "0.85rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong>{inv.recipientName}</strong>
                      <span style={{
                        padding: "2px 10px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 600,
                        background: inv.status === "APPROVED" ? "rgba(13,127,120,0.1)" : inv.status === "REJECTED" ? "rgba(220,38,38,0.1)" : "rgba(249,168,38,0.12)",
                        color: inv.status === "APPROVED" ? "var(--teal)" : inv.status === "REJECTED" ? "#dc2626" : "#b45309",
                      }}>
                        {inv.status}
                      </span>
                    </div>
                    <div style={{ opacity: 0.7 }}>${(inv.amountCents / 100).toFixed(2)} — {inv.description}</div>
                    {inv.category && <span style={{ fontSize: "0.75rem", opacity: 0.5 }}>{inv.category}</span>}
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      {inv.invoicePdfUrl && <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--teal)" }}>Invoice PDF ↗</a>}
                      {inv.receiptUrl && <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--teal)" }}>Receipt ↗</a>}
                    </div>
                    {inv.adminNotes && <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", fontStyle: "italic", opacity: 0.6 }}>Admin: {inv.adminNotes}</div>}
                    <div style={{ fontSize: "0.7rem", opacity: 0.4, marginTop: "0.25rem" }}>{new Date(inv.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              !showForm && <p style={{ fontSize: "0.85rem", opacity: 0.5 }}>No invoices yet.</p>
            )}
          </section>
        )}

        <section style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(29,35,59,0.1)" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Bank Details for Reimbursement</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "0.75rem" }}>
            Enter your bank account details so the association can pay approved reimbursement invoices.
          </p>
          <form onSubmit={async e => {
            e.preventDefault(); setMessage("");
            const res = await fetch("/api/user/bank-details", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankAccountName, bankBsb, bankAccountNumber }) });
            const d = await res.json(); if (d.ok) setMessage("Bank details saved"); else setMessage("Failed to save");
          }} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input name="bankAccountName" placeholder="Account name" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit", fontSize: "0.85rem" }} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input name="bankBsb" placeholder="BSB" value={bankBsb} onChange={e => setBankBsb(e.target.value)} style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit", fontSize: "0.85rem" }} />
              <input name="bankAccountNumber" placeholder="Account number" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} style={{ flex: 2, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(29,35,59,0.2)", font: "inherit", fontSize: "0.85rem" }} />
            </div>
            <button className="btn-primary" type="submit" style={{ fontSize: "0.85rem", alignSelf: "flex-start" }}>{bankAccountName || bankAccountNumber ? "Edit Bank Details" : "Save Bank Details"}</button>
          </form>
        </section>

        <div className="button-row" style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="btn-primary">Home</Link>
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
