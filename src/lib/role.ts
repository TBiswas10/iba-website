import { fail } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email) {
      return fail("Authentication required", 401);
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return fail("Admin access required", 403);
    }

    return null;
  } catch (err) {
    console.error("requireAdmin error:", err);
    return fail("Server error during authentication", 500);
  }
}
