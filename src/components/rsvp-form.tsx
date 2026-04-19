"use client";

import { FormEvent, useState } from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFirebaseAuth } from "@/components/firebase-auth-context";

type EventOption = {
  id: number;
  title: string;
  slug?: string;
  start: string;
  end: string;
  location?: string | null;
};

const emptyForm = {
  adults: "1",
  name: "",
  email: "",
  phone: "",
  kidsCount: "0",
  kidsAges: [] as string[],
};

export function RsvpForm() {
  const { user } = useFirebaseAuth();
  const params = useSearchParams();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.displayName || prev.name,
      }));
      if (!user.displayName) {
        fetch("/api/session")
          .then(res => res.json())
          .then(data => {
            if (data.user?.name) {
              setForm(prev => ({ ...prev, name: data.user.name }));
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

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

  function getEventSlug(event: EventOption): string {
    return event.slug || `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${event.id}`;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      eventId: Number(selectedEventId),
      name: form.name,
      email: form.email,
      phone: form.phone,
      adults: Number(form.adults),
      kidsCount: Number(form.kidsCount) || 0,
      kidsAges: form.kidsAges,
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

    setEmailSent(json.data.confirmationEmailSent);
    setShowModal(true);
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
            <br />
            <Link href={`/events/${getEventSlug(selectedEvent)}`} className="event-details-link">
              View event details
            </Link>
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
                  {eventOption.title} - {new Date(eventOption.start).toLocaleDateString(undefined)}
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
            Number of adults
            <input
              required
              min={1}
              type="number"
              value={form.adults}
              onChange={(event) => setForm((prev) => ({ ...prev, adults: event.target.value }))}
            />
          </label>
          <label>
            Number of kids
            <input
              min={0}
              type="number"
              value={form.kidsCount}
              onChange={(event) => {
                const count = parseInt(event.target.value) || 0;
                const currentAges = form.kidsAges;
                const newAges = Array(count).fill("").map((_, i) => currentAges[i] || "");
                setForm((prev) => ({ ...prev, kidsCount: event.target.value, kidsAges: newAges }));
              }}
            />
          </label>
          {Number(form.kidsCount) > 0 && (
            <label className="span-2">
              Kids ages
              <div className="kids-ages-grid">
                {Array(Number(form.kidsCount))
                  .fill(0)
                  .map((_, i) => (
                    <select
                      key={i}
                      required
                      value={form.kidsAges[i] || ""}
                      onChange={(event) => {
                        const newAges = [...form.kidsAges];
                        newAges[i] = event.target.value;
                        setForm((prev) => ({ ...prev, kidsAges: newAges }));
                      }}
                    >
                      <option value="" disabled>
                        Select age
                      </option>
                      {Array.from({ length: 18 }, (_, i) => i + 1).map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  ))}
              </div>
            </label>
          )}
          <div className="button-row span-2">
            <button className="btn-primary" type="submit" disabled={isSubmitting || !selectedEventId}>
              {isSubmitting ? "Submitting..." : "Submit RSVP"}
            </button>
          </div>
        </form>
        {message ? <p className="note-text">{message}</p> : null}
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">✓</div>
            <h2>RSVP Confirmed!</h2>
            <p className="modal-message">
              {emailSent
                ? "Thank you for your RSVP! A confirmation email has been sent to your inbox."
                : "Your RSVP has been received and saved. We couldn't send a confirmation email right now, but we're excited to see you at the event!"}
            </p>
            <p className="modal-event">{selectedEvent?.title}</p>
            <button className="btn-primary" onClick={() => setShowModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}