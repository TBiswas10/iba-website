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
  slug: string;
  start: string;
  end: string;
  location?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

type CalendarEvent = {
  id: number;
  title: string;
  slug?: string;
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

function formatICS(event: CalendarEvent): string {
  const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const description = event.description ? event.description.replace(/[\n\r]/g, "\\n") : "";
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IBA//Events//EN
BEGIN:VEVENT
UID:${event.id}@iba.org
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
}

function downloadICS(event: CalendarEvent) {
  const ics = formatICS(event);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getGoogleCalendarUrl(event: CalendarEvent): string {
  const title = encodeURIComponent(event.title);
  const details = event.description ? encodeURIComponent(event.description) : "";
  const location = event.location ? encodeURIComponent(event.location) : "";
  const start = event.start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = event.end.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
}

export function EventsBoard({ isAdmin }: { isAdmin: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

  function getEventSlug(event: CalendarEvent): string {
    return event.slug || `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${event.id}`;
  }

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
      slug: event.slug,
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
                <p className="event-popup-desc">
                  {selected.description.length > 200 ? (
                    <>
                      {selected.description.slice(0, 200).split("\n").map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                      <Link href={`/events/${getEventSlug(selected)}`} className="view-more-link">
                        View More
                      </Link>
                    </>
                  ) : (
                    selected.description.split("\n").map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))
                  )}
                </p>
              </>
            )}
            
            <div className="event-popup-actions">
              <Link href={`/events/${getEventSlug(selected)}`} className="btn-ghost btn-sm">
                View Details
              </Link>
              <div className="calendar-buttons">
                <a
                  href={getGoogleCalendarUrl(selected)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost btn-sm"
                >
                  Google Calendar
                </a>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => downloadICS(selected)}
                >
                  Add to Calendar
                </button>
              </div>
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