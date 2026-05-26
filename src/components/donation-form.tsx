"use client";

import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "@/components/supabase-auth-context";

export function DonationForm() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    if (user?.email) {
      setEmail(user.email);
      if (user.name) {
        setName(user.name);
      } else {
        fetch("/api/session", { method: "POST", signal: controller.signal })
          .then(res => res.json())
          .then(data => {
            if (!controller.signal.aborted && data.user?.name) {
              setName(data.user.name);
            }
          })
          .catch(() => {});
      }
    }
    return () => controller.abort();
  }, [user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating donation intent...");

    const formData = new FormData(event.currentTarget);
    const amountDollars = Number(formData.get("amount") || 0);
    const payload = {
      amountCents: Math.round(amountDollars * 100),
      donorName: name,
      donorEmail: email,
      message: String(formData.get("message") || ""),
    };

    const response = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setStatus(json?.error?.message || "Donation failed.");
      return;
    }

    if (json.data?.url) {
      window.location.href = json.data.url;
    } else if (json.data?.mode === "offline-dev") {
      setStatus("Donation saved. Visit admin to set up payment.");
    }
  }

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <label>
        Amount (AUD)
        <input required type="number" min={5} name="amount" defaultValue={10} />
      </label>
      <label>
        Name
        <input required name="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input required type="email" name="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="span-2">
        Message
        <textarea name="message" placeholder="Optional message..." />
      </label>
      <div className="span-2 button-row">
        <button className="btn-primary" type="submit">
          Donate via Stripe
        </button>
      </div>
      {status ? <p className="span-2">{status}</p> : null}
    </form>
    );
    }
