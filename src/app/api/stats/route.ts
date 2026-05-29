export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

async function handleStats() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const [events, memberships, donations, gallery, resources, rsvps] = await Promise.all([
      prisma.event.count(),
      prisma.membership.count({ where: { status: "ACTIVE" } }),
      prisma.donation.count(),
      prisma.album.count(),
      prisma.resource.count(),
      prisma.rsvp.count(),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        events,
        memberships,
        donations,
        gallery,
        resources,
        rsvps,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load stats" }, { status: 500 });
  }
}

export async function GET() {
  return handleStats();
}

export async function POST() {
  return handleStats();
}

