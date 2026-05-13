import { fail, ok } from "@/lib/api";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { donationSchema } from "@/lib/validators";
import Stripe from "stripe";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = donationSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid donation payload", 400, parsed.error.flatten());
    }

    const draft = await prisma.donation.create({
      data: {
        amountCents: parsed.data.amountCents,
        status: "PENDING",
        donorName: parsed.data.donorName,
        donorEmail: parsed.data.donorEmail,
        message: parsed.data.message,
      },
    });

    if (!stripe) {
      return ok(
        {
          donationId: draft.id,
          mode: "offline-dev",
          url: null,
          message: "Stripe key missing; donation recorded as pending.",
        },
        201
      );
    }

    const baseUrl = env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: parsed.data.donorEmail,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: "Community Donation",
              description: `Donation from ${parsed.data.donorName}`,
            },
            unit_amount: parsed.data.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/donations?success=true`,
      cancel_url: `${baseUrl}/donations?canceled=true`,
      metadata: {
        donationId: String(draft.id),
      },
    });

    return ok({ url: session.url }, 201);
  } catch (error) {
    return fail("Error creating donation session", 500, error);
  }
}
