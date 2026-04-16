import Stripe from "stripe";

import { fail, ok } from "@/lib/api";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return fail("Webhook not configured", 503);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return fail("Missing stripe signature", 400);
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

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
        return ok({ received: true, duplicate: true });
      }
      throw error;
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const donationId = Number(intent.metadata.donationId);

      if (Number.isFinite(donationId)) {
        await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: "SUCCEEDED",
          },
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const donationId = Number(intent.metadata.donationId);

      if (Number.isFinite(donationId)) {
        await prisma.donation.update({
          where: { id: donationId },
          data: {
            status: "FAILED",
          },
        });
      }
    }

    await prisma.webhookEvent.update({
      where: {
        providerEventId: event.id,
      },
      data: {
        processedAt: new Date(),
      },
    });

    return ok({ received: true });
  } catch (error) {
    return fail("Webhook handling failed", 400, error);
  }
}
