"use client";

import { FormEvent, useState, useEffect } from "react";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

export function ContactForm() {
  const { user } = useFirebaseAuth();
  const [status, setStatus] = useState<string>("");
  const [prefillName, setPrefillName] = useState("");
  const [prefillEmail, setPrefillEmail] = useState("");

  useEffect(() => {
    if (user?.email) {
      setPrefillEmail(user.email);
      if (user.displayName) {
        setPrefillName(user.displayName);
      } else {
        fetch("/api/session")
          .then(res => res.json())
          .then(data => {
            if (data.user?.name) {
              setPrefillName(data.user.name);
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
        <input required name="name" defaultValue={prefillName} />
      </label>
      <label>
        Email
        <input required type="email" name="email" defaultValue={prefillEmail} />
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
