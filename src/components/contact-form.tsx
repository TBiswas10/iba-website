"use client";

import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "@/components/supabase-auth-context";

export function ContactForm() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      if (user.name) {
        setName(user.name);
      } else {
        fetch("/api/session", { method: "POST" })
          .then(res => res.json())
          .then(data => {
            if (data.user?.name) {
              setName(data.user.name);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("Submitting...");

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setStatus(json?.error?.message || "Submission failed.");
      return;
    }

    setStatus("Thanks. Your message has been sent.");
  }

  return (
    <form className="grid-form" onSubmit={onSubmit}>
      <label>
        Name
        <input required name="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input required type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Phone
        <input name="phone" />
      </label>
      <label className="span-2">
        Message
        <textarea required minLength={10} name="message" />
      </label>
      <div className="span-2 button-row">
        <button className="btn-primary" type="submit">
          Send message
        </button>
      </div>
      {status ? <p className="span-2">{status}</p> : null}
    </form>
  );
}
