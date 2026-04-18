import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    const body = await request.json();
    const type = body.type;

    if (type === "album") {
      await prisma.album.delete({ where: { id: parsedId } });
    } else {
      await prisma.galleryItem.delete({ where: { id: parsedId } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}