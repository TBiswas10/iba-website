import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return fail("Invalid RSVP id", 400);
  }

  try {
    await prisma.rsvp.delete({
      where: { id },
    });

    return ok({ id });
  } catch (error) {
    return fail("Error deleting RSVP", 500, error);
  }
}