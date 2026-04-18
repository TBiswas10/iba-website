import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.donation.count(),
    ]);
    return NextResponse.json({ ok: true, data: donations, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch donations" }, { status: 500 });
  }
}