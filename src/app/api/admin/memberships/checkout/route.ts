import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { env } from "@/lib/env";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const { tier, userId, email } = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product: "prod_ULJggcxX0PHnDF",
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/membership?canceled=true`,
      metadata: {
        userId: String(userId),
        email: email,
        tier: tier,
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create checkout session" }, { status: 500 });
  }
}
