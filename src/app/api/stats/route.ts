import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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