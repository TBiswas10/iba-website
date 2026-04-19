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
    const [donations, count, totalSum] = await Promise.all([
      prisma.donation.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.donation.count(),
      prisma.donation.aggregate({
        _sum: {
          amountCents: true,
        },
        where: {
          status: "COMPLETED",
        },
      }),
    ]);
    return NextResponse.json({ 
      ok: true, 
      data: donations, 
      count, 
      totalAmount: totalSum._sum.amountCents || 0,
      page, 
      totalPages: Math.ceil(count / limit) 
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch donations" }, { status: 500 });
  }
}