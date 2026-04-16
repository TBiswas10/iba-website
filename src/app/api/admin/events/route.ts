import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const events = await prisma.event.findMany({
      orderBy: { start: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, start, end, location, description, imageUrl } = body;

    if (!title || !start || !end) {
      return NextResponse.json({ ok: false, error: "Title, start, and end are required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        location: location || "",
        description: description || "",
        imageUrl: imageUrl || "",
      },
    });

    return NextResponse.json({ ok: true, data: event });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create event" }, { status: 500 });
  }
}