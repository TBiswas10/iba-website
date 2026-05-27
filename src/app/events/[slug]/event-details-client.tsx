"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Event = {
  id: number;
  title: string;
  slug: string;
  start: string | Date;
  end: string | Date;
  location: string;
  description: string;
  imageUrl: string;
};

function getGoogleCalendarUrl(title: string, start: string, end: string, location: string | null, description: string | null): string {
  const t = encodeURIComponent(title);
  const d = description ? encodeURIComponent(description) : "";
  const l = location ? encodeURIComponent(location) : "";
  const s = new Date(start).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const e = new Date(end).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&details=${d}&location=${l}&dates=${s}/${e}`;
}

export function EventDetailsClient({ event }: { event: Event }) {
  const [copied, setCopied] = useState(false);

  const startDate = typeof event.start === "string" ? new Date(event.start) : event.start;
  const endDate = typeof event.end === "string" ? new Date(event.end) : event.end;

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${event.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <Link href="/events" className="btn-ghost btn-sm">← Back to Events</Link>
      </section>

      <section className="glass-panel event-details">
        {event.imageUrl && (
          <div className="event-details-image-wrapper">
            <Image src={event.imageUrl} alt={event.title} fill className="event-details-image" />
          </div>
        )}
        
        <h1>{event.title}</h1>
        
        <div className="event-details-meta">
          <div className="event-detail-row">
            <span className="event-detail-label">Date</span>
            <span className="event-detail-value">
              {startDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="event-detail-row">
            <span className="event-detail-label">Time</span>
            <span className="event-detail-value">
              {startDate.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })} - {endDate.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })}
            </span>
          </div>
          
          {event.location && (
            <div className="event-detail-row">
              <span className="event-detail-label">Location</span>
              <span className="event-detail-value">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="event-details-desc">
            <h2>About</h2>
            <p>{event.description}</p>
          </div>
        )}

        <div className="event-details-actions">
          <button type="button" className="btn-ghost" onClick={handleShare}>
            {copied ? "Copied!" : "Share"}
          </button>
          <div className="calendar-buttons">
            <a
              href={getGoogleCalendarUrl(event.title, startDate.toISOString(), endDate.toISOString(), event.location, event.description)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Google Calendar
            </a>
            <form method="get" action="/api/calendar" style={{ display: "inline" }}>
              <input type="hidden" name="title" value={event.title} />
              <input type="hidden" name="start" value={startDate.toISOString()} />
              <input type="hidden" name="end" value={endDate.toISOString()} />
              <input type="hidden" name="location" value={event.location || ""} />
              <input type="hidden" name="description" value={event.description || ""} />
              <button type="submit" className="btn-ghost">Add to Calendar</button>
            </form>
          </div>
          <Link className="btn-primary" href={`/events/rsvp?eventId=${event.id}`}>
            RSVP Now
          </Link>
        </div>
      </section>
    </section>
  );
}