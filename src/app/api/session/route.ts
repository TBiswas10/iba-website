import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Middleware (src/middleware.ts) refreshes the auth token before this runs,
// so the server client always has a valid session via cookies.

export async function GET() {
  return handleSession();
}

export async function POST() {
  return handleSession();
}

async function handleSession() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser?.email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email },
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
    console.error("Session error:", error);
    return NextResponse.json({ user: null, error: "Session lookup failed" }, { status: 500 });
  }
}
