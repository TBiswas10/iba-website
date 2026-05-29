export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { z } from "zod";
import Stripe from "stripe";

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

  let invoicePdfUrl: string | undefined;

  const stripeKey = env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const stripe = new Stripe(stripeKey);

      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name || parsed.data.recipientName,
        metadata: { userId: String(dbUser.id) },
      });

      const productId = await getOrCreateReimbursementProduct(stripe);

      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: "charge_automatically",
        metadata: { reimbursementUserId: String(dbUser.id) },
        auto_advance: false,
      });

      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        price_data: {
          currency: "aud",
          product: productId,
          unit_amount: parsed.data.amountCents,
        },
        description: parsed.data.description,
      });

      await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
      const paidInvoice = await stripe.invoices.retrieve(invoice.id);
      invoicePdfUrl = paidInvoice.invoice_pdf || undefined;
    } catch (err) {
      console.error("Failed to generate Stripe invoice PDF:", err);
    }
  }

  const invoice = await prisma.reimbursementInvoice.create({
    data: {
      userId: dbUser.id,
      recipientName: parsed.data.recipientName,
      amountCents: parsed.data.amountCents,
      description: parsed.data.description,
      category: parsed.data.category,
      receiptUrl: parsed.data.receiptUrl,
      invoicePdfUrl,
    },
  });

  return NextResponse.json({ ok: true, data: invoice }, { status: 201 });
}

async function getOrCreateReimbursementProduct(stripe: Stripe): Promise<string> {
  const existing = await stripe.products.list({
    limit: 100,
    active: true,
  });

  const match = existing.data.find(
    (p) => "name" in p && p.name === "IBA Reimbursement"
  );

  if (match) return match.id;

  const product = await stripe.products.create({
    name: "IBA Reimbursement",
    description: "Reimbursement invoice for Life member expenses",
  });

  return product.id;
}

