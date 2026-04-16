import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const donations = await prisma.donation.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, data: donations });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch donations" }, { status: 500 });
  }
}