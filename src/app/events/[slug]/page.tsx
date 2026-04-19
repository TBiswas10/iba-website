import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function formatICS(title: string, start: string, end: string, location: string | null, description: string | null) {
  const formatDate = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const desc = description ? description.replace(/[\n\r]/g, "\\n") : "";
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IBA//Events//EN
BEGIN:VEVENT
UID:${title.replace(/\s+/g, "-").toLowerCase()}@iba.org
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${location || ""}
END:VEVENT
END:VCALENDAR`;
}

function getGoogleCalendarUrl(title: string, start: string, end: string, location: string | null, description: string | null): string {
  const t = encodeURIComponent(title);
  const d = description ? encodeURIComponent(description) : "";
  const l = location ? encodeURIComponent(location) : "";
  const s = new Date(start).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const e = new Date(end).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&details=${d}&location=${l}&dates=${s}/${e}`;
}

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    notFound();
  }

  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/events/${event.slug}`;

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
          {(() => {
            const start = event.start.toString();
            const end = event.end.toString();
            return (
              <>
                <div className="event-detail-row">
                  <span className="event-detail-label">Date</span>
                  <span className="event-detail-value">
                    {new Date(start).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="event-detail-row">
                  <span className="event-detail-label">Time</span>
                  <span className="event-detail-value">
                    {new Date(start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - {new Date(end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </>
            );
          })()}
          
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
          <div className="calendar-buttons">
            <a
              href={getGoogleCalendarUrl(event.title, event.start.toISOString(), event.end.toISOString(), event.location, event.description)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Google Calendar
            </a>
            <form method="get" action="/api/calendar" style={{ display: "inline" }}>
              <input type="hidden" name="title" value={event.title} />
              <input type="hidden" name="start" value={event.start.toISOString()} />
              <input type="hidden" name="end" value={event.end.toISOString()} />
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