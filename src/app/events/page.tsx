import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { EventsBoard } from "@/components/events-board";

export const dynamic = "force-dynamic";

async function getNextEvent() {
  const now = new Date();
  const nextEvent = await prisma.event.findFirst({
    where: {
      start: {
        gte: now,
      },
    },
    orderBy: {
      start: "asc",
    },
    take: 1,
  });
  return nextEvent;
}

export default async function EventsPage() {
  return (
    <section className="panel-stack">
      <section className="glass-panel content-grid events-intro">
        <div className="section-head">
          <p className="eyebrow">Events</p>
          <h1>One calendar for the year, one RSVP flow for the next gathering.</h1>
          <p>
            The Illawarra Bengali Association runs cultural events throughout the year — from
            Pohela Boishakh to Durga Puja, Independence Day, and community dinners.
          </p>
        </div>
      </section>

      <EventsBoard isAdmin={false} />
    </section>
  );
}