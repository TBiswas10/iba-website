import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json({ ok: false, error: "Cannot delete event with existing RSVPs. Remove RSVPs first." }, { status: 409 });
    }
    if (error?.code === "P2025") {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Failed to delete event" }, { status: 500 });
  }
}
