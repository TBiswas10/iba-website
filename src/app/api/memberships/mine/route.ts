import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;

  if (!email) {
    return fail("Authentication required", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
  });
  if (!dbUser) {
    return fail("User not found", 404);
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
