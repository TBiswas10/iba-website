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
    const donationId = session.metadata?.donationId;

    if (donationId) {
      await prisma.donation.update({
        where: { id: parseInt(donationId) },
        data: { status: DONATION_STATUS.SUCCEEDED },
      });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const donationId = Number(intent.metadata?.donationId);

    if (Number.isFinite(donationId)) {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: DONATION_STATUS.SUCCEEDED },
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const donationId = Number(intent.metadata?.donationId);

    if (Number.isFinite(donationId)) {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: DONATION_STATUS.FAILED },
      });
    }
  }

  await prisma.webhookEvent.update({
    where: { providerEventId: event.id },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ received: true });
}
