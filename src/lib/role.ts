import { fail } from "@/lib/api";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    return fail("Authentication required", 401);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return fail("Admin access required", 403);
  }

  return null;
}
