import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const { tier = "MEMBER" } = await request.json();

    // Get user from session cookie - don't trust client-side userId
    const cookieStore = await cookies();
    const email = cookieStore.get("userEmail")?.value;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Check if user already has an active membership
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: dbUser.id, status: "ACTIVE" },
    });

    if (existingMembership) {
      return NextResponse.json({ ok: false, error: "Already a member" }, { status: 400 });
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    // Create membership as PENDING (will activate after payment confirmation)
    const membership = await prisma.membership.create({
      data: {
        userId: dbUser.id,
        tier: tier,
        status: "PENDING",
        startDate: now,
        expiryDate: expiry,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product: "prod_ULJggcxX0PHnDF",
            unit_amount: 100, // $1.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?success=true&membershipId=${membership.id}`,
      cancel_url: `${baseUrl}/membership?canceled=true`,
      metadata: {
        userId: String(dbUser.id),
        email: email,
        tier: tier,
        membershipId: String(membership.id),
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create checkout session" }, { status: 500 });
  }
}
