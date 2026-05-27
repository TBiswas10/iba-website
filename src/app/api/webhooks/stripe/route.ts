import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { DONATION_STATUS } from "@/lib/constants";
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

  // Idempotency check
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: "stripe",
        providerEventId: event.id,
        eventType: event.type,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw error;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, email, donationId, membershipId } = session.metadata || {};

    console.log("Stripe webhook: checkout.session.completed", { userId, email, donationId, membershipId });

    if (donationId) {
      await prisma.donation.update({
        where: { id: parseInt(donationId) },
        data: { status: DONATION_STATUS.SUCCEEDED },
      });
    } else if (membershipId) {
      await prisma.membership.update({
        where: { id: parseInt(membershipId) },
        data: { status: "ACTIVE" },
      });
    } else if (userId && email) {
      console.log("Processing membership for userId:", userId, "email:", email);

      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        console.error("Invalid userId in webhook:", userId);
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
      }

      try {
        const existingMembership = await prisma.membership.findFirst({
          where: { userId: parsedUserId },
          orderBy: { createdAt: "desc" },
        });

        console.log("Existing membership:", existingMembership);

        if (existingMembership) {
          const updated = await prisma.membership.update({
            where: { id: existingMembership.id },
            data: { status: "ACTIVE" },
          });
          console.log("Membership updated:", updated);
        } else {
          const created = await prisma.membership.create({
            data: {
              userId: parsedUserId,
              status: "ACTIVE",
              startDate: new Date(),
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
