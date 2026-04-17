import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripeKey = env.STRIPE_SECRET_KEY;
  const endpointSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !endpointSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
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

      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        console.error("Invalid userId in webhook:", userId);
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
      }

      // Check if membership exists for this user, get the most recent one
      const existingMembership = await prisma.membership.findFirst({
        where: { userId: parsedUserId },
        orderBy: { createdAt: "desc" },
      });

      if (existingMembership) {
        // Update existing membership
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: {
            status: "ACTIVE",
            expiryDate: expiry,
            tier: tier as any,
          },
        });
      } else {
        // Create new membership
        await prisma.membership.create({
          data: {
            userId: parsedUserId,
            tier: tier as any,
            status: "ACTIVE",
            startDate: now,
            expiryDate: expiry,
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
