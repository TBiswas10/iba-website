"use client";

import { FormEvent, useState } from "react";

export function DonationForm() {
  const [status, setStatus] = useState<string>("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creating donation intent...");

    const formData = new FormData(event.currentTarget);
    const amountDollars = Number(formData.get("amount") || 0);
    const payload = {
      amountCents: Math.round(amountDollars * 100),
      donorName: String(formData.get("name") || ""),
      donorEmail: String(formData.get("email") || ""),
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
        <input required name="name" placeholder="Your name" />
      </label>
      <label>
        Email
        <input required type="email" name="email" placeholder="you@example.com" />
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
