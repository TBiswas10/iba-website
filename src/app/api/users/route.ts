import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(users);
  } catch (error) {
    return fail("Error fetching users", 500, error);
  }
}
