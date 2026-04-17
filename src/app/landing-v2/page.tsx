import { prisma } from "@/lib/prisma";
import { LandingV2 } from "@/components/landing-v2";

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

export default async function LandingV2Page() {
  const nextEvent = await getNextEvent();

  return (
    <div className="v2-root-container">
      <LandingV2 
        nextEvent={nextEvent ? { 
          id: nextEvent.id, 
          title: nextEvent.title, 
          start: nextEvent.start.toISOString(), 
          location: nextEvent.location 
        } : null} 
      />
    </div>
  );
}
