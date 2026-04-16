import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { eventSchema } from "@/lib/validators";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        start: "asc",
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
    const created = await prisma.event.create({
      data: {
        title: payload.title,
        start: new Date(payload.start),
        end: new Date(payload.end),
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
