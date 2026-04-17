"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import Link from "next/link";

moment.locale("en-au");
const localizer = momentLocalizer(moment);

type ApiEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  location?: string | null;
  description?: string | null;
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location?: string | null;
  description?: string | null;
};

const emptyForm = {
  title: "",
  start: "",
  end: "",
  location: "",
  description: "",
};

export function EventsBoard({ isAdmin }: { isAdmin: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId) || null,
    [events, selectedId]
  );

  const loadEvents = async () => {
    setError(null);
    const response = await fetch("/api/events", { cache: "no-store" });
    const json = await response.json();

    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Failed to load events");
      return;
    }

    const mapped = (json.data as ApiEvent[]).map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      location: event.location,
      description: event.description,
    }));

    setEvents(mapped);
  };

  useEffect(() => {
    startTransition(() => {
      loadEvents();
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload = {
      title: form.title,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
      location: form.location,
      description: form.description,
    };

    const method = selectedId ? "PUT" : "POST";
    const path = selectedId ? `/api/events/${selectedId}` : "/api/events";

    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Could not save event");
      return;
    }

    setForm(emptyForm);
    setSelectedId(null);
    await loadEvents();
  };

  const beginEdit = (event: CalendarEvent) => {
    setSelectedId(event.id);
    setForm({
      title: event.title,
      start: event.start.toISOString().slice(0, 16),
      end: event.end.toISOString().slice(0, 16),
      location: event.location || "",
      description: event.description || "",
    });
  };

  const remove = async (id: number) => {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    const json = await response.json();
    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Could not delete event");
      return;
    }

    setSelectedId(null);
    setForm(emptyForm);
    await loadEvents();
  };

  const upcomingEvents = events
    .filter((e) => e.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <div className="panel-stack">
      <section className="glass-panel events-calendar">
        <div className="section-head">
          <h2>Events Calendar</h2>
          <p className="calendar-subtitle">Plan festivals, workshops, and community gatherings with a single source of truth.</p>
        </div>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          date={date}
          onNavigate={(d) => setDate(d)}
          view={view}
          onView={(v) => setView(v)}
          onSelectEvent={(event) => setSelectedId((event as CalendarEvent).id)}
          style={{ height: 560 }}
        />
      </section>

      {upcomingEvents.length > 0 && (
        <section className="glass-panel upcoming-events">
          <h3>Upcoming Events</h3>
          <div className="upcoming-list">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="upcoming-item"
                onClick={() => setSelectedId(event.id)}
              >
                <div className="upcoming-date">
                  {event.start.toLocaleDateString("en-AU", { month: "short", day: "numeric" })}
                </div>
                <div className="upcoming-details">
                  <h4>{event.title}</h4>
                  <p>{event.start.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <div className="event-popup-overlay" onClick={() => setSelectedId(null)}>
          <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <button className="event-popup-close" onClick={() => setSelectedId(null)} aria-label="Close">
              ×
            </button>
            <h3>{selected.title}</h3>
            
            <span className="event-popup-label">Date & Time</span>
            <p className="event-popup-date">
              {selected.start.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              {" - "}
              {selected.end.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="event-popup-date">
              {selected.start.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })} - {selected.end.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
            </p>
            
            {selected.location && (
              <>
                <span className="event-popup-label">Location</span>
                <p className="event-popup-location">{selected.location}</p>
              </>
            )}
            
            {selected.description && (
              <>
                <span className="event-popup-label">About</span>
                <p className="event-popup-desc">{selected.description}</p>
              </>
            )}
            
            <div className="event-popup-actions">
              {isAdmin && (
                <>
                  <Link href="/admin/events" className="btn-ghost btn-sm">
                    Edit
                  </Link>
                  <button type="button" className="btn-danger btn-sm" onClick={() => remove(selected.id)}>
                    Delete
                  </button>
                </>
              )}
              <Link className="btn-primary btn-sm" href={`/events/rsvp?eventId=${selected.id}`}>
                RSVP Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}