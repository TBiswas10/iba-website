import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const albumId = parseInt(id);
    if (isNaN(albumId)) return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });
    const body = await request.json();
    const { title, description, eventId } = body;

    await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(eventId !== undefined && { eventId: eventId ? parseInt(eventId) : null }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Album update error:", error);
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 });
  }
}