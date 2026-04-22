import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { eventSchema } from "@/lib/validators";

function parseLocalDateTime(value: string): Date {
  if (value.includes("T") && !value.includes("Z")) {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  return new Date(value);
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return fail("Invalid event id", 400);
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return fail("Event not found", 404);
  }

  return ok(event);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return fail("Invalid event id", 400);
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid event payload", 400, parsed.error.flatten());
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: parsed.data.title,
        start: parseLocalDateTime(parsed.data.start),
        end: parseLocalDateTime(parsed.data.end),
        location: parsed.data.location,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl,
      },
    });

    return ok(updated);
  } catch (error) {
    return fail("Error updating event", 500, error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return fail("Invalid event id", 400);
  }

  try {
    await prisma.event.delete({ where: { id } });
    return ok({ id });
  } catch (error) {
    return fail("Error deleting event", 500, error);
  }
}
