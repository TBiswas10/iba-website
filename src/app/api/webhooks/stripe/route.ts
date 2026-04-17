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

    console.log("Stripe webhook: checkout.session.completed", { userId, tier, email, donationId });

    if (donationId) {
        try {
            await prisma.donation.update({
                where: { id: parseInt(donationId) },
                data: { status: "COMPLETED" },
            });
            console.log("Donation updated to COMPLETED");
        } catch (e) {
            console.error("Error updating donation:", e);
        }
    } else if (userId && email) {
      console.log("Processing membership for userId:", userId, "email:", email, "tier:", tier);

      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);

      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        console.error("Invalid userId in webhook:", userId);
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
      }

      try {
        // Check if membership exists for this user, get the most recent one
        const existingMembership = await prisma.membership.findFirst({
          where: { userId: parsedUserId },
          orderBy: { createdAt: "desc" },
        });

        console.log("Existing membership:", existingMembership);

        if (existingMembership) {
          // Update existing membership
          const updated = await prisma.membership.update({
            where: { id: existingMembership.id },
            data: {
              status: "ACTIVE",
              expiryDate: expiry,
              tier: tier as any,
            },
          });
          console.log("Membership updated:", updated);
        } else {
          // Create new membership
          const created = await prisma.membership.create({
            data: {
              userId: parsedUserId,
              tier: tier as any,
              status: "ACTIVE",
              startDate: now,
              expiryDate: expiry,
            },
          });
          console.log("Membership created:", created);
        }
      } catch (e) {
        console.error("Error creating/updating membership:", e);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
