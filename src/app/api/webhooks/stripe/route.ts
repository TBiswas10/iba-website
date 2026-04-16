import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY || "");
const endpointSecret = env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tier, email, donationId } = session.metadata || {};

    if (donationId) {
        await prisma.donation.update({
            where: { id: parseInt(donationId) },
            data: { status: "COMPLETED" },
        });
    } else if (userId && email) {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);

      // Create or update membership
      await prisma.membership.upsert({
        where: { id: parseInt(userId) }, 
        update: {
          status: "ACTIVE",
          expiryDate: expiry,
        },
        create: {
          userId: parseInt(userId),
          tier: tier as any,
          status: "ACTIVE",
          startDate: now,
          expiryDate: expiry,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
