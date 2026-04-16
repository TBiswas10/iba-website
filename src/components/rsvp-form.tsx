"use client";

import { FormEvent, useState } from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type EventOption = {
  id: number;
  title: string;
  start: string;
  end: string;
  location?: string | null;
};

const emptyForm = {
  attendees: "1",
  name: "",
  email: "",
  phone: "",
  volunteerInterest: "",
  kidsCount: "",
  dietaryNotes: "",
  donationIntent: "",
  additionalNotes: "",
};

export function RsvpForm() {
  const params = useSearchParams();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const response = await fetch("/api/events", { cache: "no-store" });
      const json = await response.json();

      if (response.ok && json.ok) {
        const nextEvents = (json.data as EventOption[]).filter((event) => new Date(event.end) >= new Date());
        setEvents(nextEvents.length > 0 ? nextEvents : (json.data as EventOption[]));
      } else {
        setMessage(json?.error?.message || "Failed to load events");
      }

      setIsLoading(false);
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0) {
      return;
    }

    const eventFromQuery = params.get("eventId");
    const nextSelected = eventFromQuery && events.some((event) => String(event.id) === eventFromQuery)
      ? eventFromQuery
      : String(events[0].id);

    setSelectedEventId((current) => current || nextSelected);
  }, [events, params]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === selectedEventId) || null,
    [events, selectedEventId]
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      eventId: Number(selectedEventId),
      name: form.name,
      email: form.email,
      phone: form.phone,
      attendees: Number(form.attendees),
      volunteerInterest: form.volunteerInterest,
      kidsCount: form.kidsCount ? Number(form.kidsCount) : undefined,
      dietaryNotes: form.dietaryNotes,
      donationIntent: form.donationIntent,
      additionalNotes: form.additionalNotes,
    };

    const response = await fetch("/api/rsvps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setMessage(json?.error?.message || "Could not submit RSVP");
      setIsSubmitting(false);
      return;
    }

    const confirmationMessage = json.data.confirmationEmailSent
      ? "RSVP received. Confirmation email sent."
      : "RSVP received. We could not send the email right now, but your submission was saved.";

    setMessage(confirmationMessage);
    setForm(emptyForm);
    setIsSubmitting(false);
  };

  return (
    <div className="panel-stack">
      <section className="glass-panel">
        <p className="eyebrow">RSVP</p>
        <h1>Choose the event, then let us know who is coming.</h1>
        <p>
          RSVP is separate from the homepage. Keep the landing page clean, and use this page for
          the real submission flow.
        </p>
        {selectedEvent ? (
          <p className="note-text">
            Selected event: <strong>{selectedEvent.title}</strong>
          </p>
        ) : null}
      </section>

      <section className="glass-panel rsvp-form">
        {isLoading ? <p>Loading upcoming events...</p> : null}
        <form className="grid-form" onSubmit={submit}>
          <label className="span-2">
            Event
            <select
              required
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
            >
              <option value="" disabled>
                Select an event
              </option>
              {events.map((eventOption) => (
                <option key={eventOption.id} value={eventOption.id}>
                  {eventOption.title} - {new Date(eventOption.start).toLocaleDateString("en-AU")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label>
            Phone
            <input
              required
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>
          <label>
            Number of attendees
            <input
              required
              min={1}
              type="number"
              value={form.attendees}
              onChange={(event) => setForm((prev) => ({ ...prev, attendees: event.target.value }))}
            />
          </label>
          <label className="span-2">
            Volunteer interest
            <select
              required
              value={form.volunteerInterest}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, volunteerInterest: event.target.value }))
              }
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="None">None for now</option>
              <option value="Decorate">Decorate</option>
              <option value="Cook">Cook</option>
              <option value="Book hall">Book hall</option>
              <option value="Run puja">Run puja</option>
              <option value="General support">General support</option>
            </select>
          </label>
          <label>
            Kids count
            <input
              min={0}
              type="number"
              value={form.kidsCount}
              onChange={(event) => setForm((prev) => ({ ...prev, kidsCount: event.target.value }))}
            />
          </label>
          <label>
            Donation intent
            <input
              value={form.donationIntent}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, donationIntent: event.target.value }))
              }
            />
          </label>
          <label className="span-2">
            Dietary notes
            <textarea
              value={form.dietaryNotes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dietaryNotes: event.target.value }))
              }
            />
          </label>
          <label className="span-2">
            Additional notes
            <textarea
              value={form.additionalNotes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, additionalNotes: event.target.value }))
              }
            />
          </label>
          <div className="button-row span-2">
            <button className="btn-primary" type="submit" disabled={isSubmitting || !selectedEventId}>
              {isSubmitting ? "Submitting..." : "Submit RSVP"}
            </button>
          </div>
        </form>
        {message ? <p className="note-text">{message}</p> : null}
      </section>
    </div>
  );
}