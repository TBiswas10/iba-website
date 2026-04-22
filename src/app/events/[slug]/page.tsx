import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventDetailsClient } from "./event-details-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.description?.slice(0, 160) || `Join us for ${event.title} organized by Illawarra Bengali Association`,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160) || `Join us for ${event.title} organized by Illawarra Bengali Association`,
      type: "website",
      url: `/events/${slug}`,
      images: event.imageUrl ? [{ url: event.imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description?.slice(0, 160) || `Join us for ${event.title} organized by Illawarra Bengali Association`,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

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

  const eventWithStrings = {
    ...event,
    start: event.start instanceof Date ? event.start.toISOString() : event.start,
    end: event.end instanceof Date ? event.end.toISOString() : event.end,
  };

  return (
    <EventDetailsClient event={eventWithStrings} />
  );
}