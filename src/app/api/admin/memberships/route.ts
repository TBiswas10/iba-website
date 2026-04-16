import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const memberships = await prisma.membership.findMany({
      where: {
        user: {
          role: "MEMBER",
        },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, data: memberships });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch memberships" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ ok: false, error: "ID and status required" }, { status: 400 });
    }

    const membership = await prisma.membership.update({
      where: { id },
      data: { status: status as "ACTIVE" | "EXPIRED" | "PENDING" },
    });

    return NextResponse.json({ ok: true, data: membership });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update membership" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    }

    await prisma.membership.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete membership" }, { status: 500 });
  }
}