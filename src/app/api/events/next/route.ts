import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    if (!nextEvent) {
      return ok(null);
    }

    return ok(nextEvent);
  } catch (error) {
    return fail("Error fetching next event", 500, error);
  }
}