import { prisma } from "@/lib/prisma";

import { LandingPage } from "@/components/landing-page";

async function getNextEvent() {
  const now = new Date();
  return prisma.event.findFirst({
    where: {
      start: {
        gte: now,
      },
    },
    orderBy: {
      start: "asc",
    },
  });
}

export default async function HomePage() {
  const nextEvent = await getNextEvent();

  return <LandingPage nextEvent={nextEvent ? { id: nextEvent.id, title: nextEvent.title, start: nextEvent.start.toISOString(), location: nextEvent.location } : null} />;
}
