import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/role";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { membershipId } = body;

    if (!membershipId) {
      return NextResponse.json({ ok: false, error: "Membership ID required" }, { status: 400 });
    }

    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Find membership and verify ownership
    const membership = await prisma.membership.findFirst({
      where: { 
        id: Number(membershipId),
        userId: dbUser.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ ok: false, error: "Membership not found" }, { status: 404 });
    }

    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("Activate membership error:", error);
    return NextResponse.json({ ok: false, error: "Failed to activate membership" }, { status: 500 });
  }
}