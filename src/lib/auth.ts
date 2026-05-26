import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email) return null;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    return dbUser;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}
