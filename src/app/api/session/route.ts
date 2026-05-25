import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleSession(request);
}

export async function POST(request: Request) {
  return handleSession(request);
}

async function handleSession(request: Request) {
  try {
    let email: string | undefined;

    // Try Authorization header (Bearer token) first
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      email = authUser?.email;
    }

    // Fall back to cookie-based session
    if (!email) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      email = user?.email;
    }

    if (!email) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
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
