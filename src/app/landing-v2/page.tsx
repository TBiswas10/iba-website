import { prisma } from "@/lib/prisma";
import { LandingV2 } from "@/components/landing-v2";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

async function getNextEvent() {
  try {
    const now = new Date();
    return await prisma.event.findFirst({
      where: {
        start: { gte: now },
      },
      orderBy: { start: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
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
