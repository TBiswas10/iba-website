import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    const isMembershipActive = membership?.status === "ACTIVE" && new Date(membership.expiryDate) > new Date();

    return NextResponse.json({
      user: {
        id: String(dbUser.id),
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        supabaseUserId: dbUser.supabaseUserId,
        membershipStatus: isMembershipActive ? "ACTIVE" : "NONE",
        membershipExpiry: membership?.expiryDate || null,
      },
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ user: null });
  }
}
