import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  recipientName: z.string().min(1),
  amountCents: z.number().int().positive(),
  description: z.string().min(1),
  category: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export async function GET() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });

  const invoices = await prisma.reimbursementInvoice.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, data: invoices });
}

export async function POST(request: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });

  const membership = await prisma.membership.findFirst({
    where: { userId: dbUser.id, status: "ACTIVE", type: "Life" },
    orderBy: { createdAt: "desc" },
  });
  if (!membership) return NextResponse.json({ ok: false, error: "Only Life members can create reimbursement invoices" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const invoice = await prisma.reimbursementInvoice.create({
    data: {
      userId: dbUser.id,
      recipientName: parsed.data.recipientName,
      amountCents: parsed.data.amountCents,
      description: parsed.data.description,
      category: parsed.data.category,
      receiptUrl: parsed.data.receiptUrl,
    },
  });

  return NextResponse.json({ ok: true, data: invoice }, { status: 201 });
}
