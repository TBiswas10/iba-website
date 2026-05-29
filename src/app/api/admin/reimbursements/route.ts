import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export async function GET() {
  const dbUser = await getCurrentUser();
  if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Admin required" }, { status: 403 });

  const invoices = await prisma.reimbursementInvoice.findMany({
    include: { user: { select: { name: true, email: true, bankAccountName: true, bankBsb: true, bankAccountNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: invoices });
}

export async function PUT(request: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Admin required" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const invoice = await prisma.reimbursementInvoice.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes },
  });

  return NextResponse.json({ ok: true, data: invoice });
}

export async function DELETE(request: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ ok: false, error: "Admin required" }, { status: 403 });

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });

  try {
    await prisma.reimbursementInvoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
