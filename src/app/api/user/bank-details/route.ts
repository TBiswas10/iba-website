import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  bankAccountName: z.string().min(1).optional(),
  bankBsb: z.string().min(1).optional(),
  bankAccountNumber: z.string().min(1).optional(),
});

export async function POST() {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });

  return NextResponse.json({ ok: true, data: { bankAccountName: dbUser.bankAccountName, bankBsb: dbUser.bankBsb, bankAccountNumber: dbUser.bankAccountNumber } });
}

export async function PUT(request: Request) {
  const dbUser = await getCurrentUser();
  if (!dbUser) return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: dbUser.id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, data: { bankAccountName: updated.bankAccountName, bankBsb: updated.bankBsb, bankAccountNumber: updated.bankAccountNumber } });
}
