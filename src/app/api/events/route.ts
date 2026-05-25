import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { eventSchema } from "@/lib/validators";
import { parseSydneyDatetime } from "@/lib/dates";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const hasBody = contentType.includes("application/json");

    if (!hasBody) {
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
    }

    const denied = await requireAdmin();
    if (denied) {
      return denied;
    }

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
        start: parseSydneyDatetime(payload.start),
        end: parseSydneyDatetime(payload.end),
        location: payload.location,
        description: payload.description,
        imageUrl: payload.imageUrl,
      },
    });

    return ok(created, 201);
  } catch (error) {
    return fail("Error processing event request", 500, error);
  }
}
