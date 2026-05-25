import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
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

  if (membership && membership.status === "ACTIVE" && new Date(membership.expiryDate) < new Date()) {
    await prisma.membership.update({
      where: { id: membership.id },
      data: { status: "EXPIRED" },
    });
    membership.status = "EXPIRED";
  }

  return ok(membership);
}
