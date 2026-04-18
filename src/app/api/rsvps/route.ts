import { Prisma } from "@prisma/client";

import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { rsvpSchema } from "@/lib/validators";
import { sendRsvpConfirmationEmail } from "@/lib/email";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const query = searchParams.get("q")?.trim();

    const where: Prisma.RsvpWhereInput = {};

    if (eventId) {
      const parsed = Number(eventId);
      if (Number.isFinite(parsed)) {
        where.eventId = parsed;
      }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        {
          event: {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const rsvps = await prisma.rsvp.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(rsvps);
  } catch (error) {
    return fail("Error fetching RSVP submissions", 500, error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid RSVP payload", 400, parsed.error.flatten());
    }

    const event = await prisma.event.findUnique({
      where: { id: parsed.data.eventId },
    });

    if (!event) {
      return fail("Event not found", 404);
    }

    const created = await prisma.rsvp.create({
      data: {
        eventId: event.id,
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        attendees: parsed.data.adults,
        kidsCount: parsed.data.kidsCount,
        kidsAges: JSON.stringify(parsed.data.kidsAges || []),
      },
    });

    try {
      await sendRsvpConfirmationEmail({
        event,
        rsvp: {
          name: created.name,
          email: created.email,
          phone: created.phone,
          attendees: created.attendees,
          kidsCount: created.kidsCount,
          kidsAges: created.kidsAges ? JSON.parse(created.kidsAges) : null,
        },
      });

      const updated = await prisma.rsvp.update({
        where: { id: created.id },
        data: {
          confirmationEmailSentAt: new Date(),
          confirmationEmailError: null,
        },
        include: {
          event: true,
        },
      });

      return ok({
        rsvp: updated,
        confirmationEmailSent: true,
      }, 201);
    } catch (error) {
      await prisma.rsvp.update({
        where: { id: created.id },
        data: {
          confirmationEmailError: error instanceof Error ? error.message : "Email failed",
        },
      });

      const result = await prisma.rsvp.findUnique({
        where: { id: created.id },
        include: {
          event: true,
        },
      });

      return ok({
        rsvp: result,
        confirmationEmailSent: false,
        confirmationEmailError: error instanceof Error ? error.message : "Email failed",
      }, 201);
    }
  } catch (error) {
    return fail("Error submitting RSVP", 500, error);
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return fail("RSVP ID required", 400);
    }

    await prisma.rsvp.delete({
      where: { id: Number(id) },
    });

    return ok({ message: "RSVP deleted" });
  } catch (error) {
    return fail("Error deleting RSVP", 500, error);
  }
}