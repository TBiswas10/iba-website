import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { membershipSchema } from "@/lib/validators";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  const memberships = await prisma.membership.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(memberships);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const parsed = membershipSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid membership payload", 400, parsed.error.flatten());
    }

    const created = await prisma.membership.create({
      data: {
        userId: parsed.data.userId,
        status: parsed.data.status,
        startDate: new Date(parsed.data.startDate),
        expiryDate: new Date(parsed.data.expiryDate),
      },
    });

    return ok(created, 201);
  } catch (error) {
    return fail("Error creating membership", 500, error);
  }
}
