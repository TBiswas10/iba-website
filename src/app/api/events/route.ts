import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { eventSchema } from "@/lib/validators";

function parseLocalDateTime(value: string): Date {
  if (value.includes("T") && !value.includes("Z")) {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    // Treat input as Sydney time, convert to UTC for storage
    const inputAsSydney = new Date(year, month - 1, day, hour, minute);
    const sydneyOffset = 660; // Sydney is UTC+11 (660 minutes ahead)
    const utcDate = new Date(inputAsSydney.getTime() - sydneyOffset * 60000);
    return utcDate;
  }
  return new Date(value);
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        start: "asc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        start: true,
        end: true,
        location: true,
        description: true,
        imageUrl: true,
      },
    });
    return ok(events);
  } catch (error) {
    return fail("Error fetching events", 500, error);
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid event payload", 400, parsed.error.flatten());
    }

    const payload = parsed.data;
    const slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const created = await prisma.event.create({
      data: {
        title: payload.title,
        slug,
        start: parseLocalDateTime(payload.start),
        end: parseLocalDateTime(payload.end),
        location: payload.location,
        description: payload.description,
        imageUrl: payload.imageUrl,
      },
    });

    return ok(created, 201);
  } catch (error) {
    return fail("Error creating event", 500, error);
  }
}
