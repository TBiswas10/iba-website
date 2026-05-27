import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    return fail("Authentication required", 401);
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(membership);
}
