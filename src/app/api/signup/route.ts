import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { checkSignupEmailRateLimit, checkSignupRateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const rate = checkSignupRateLimit(request);
  if (!rate.allowed) {
    const response = NextResponse.json(
      {
        ok: false,
        error: {
          message: "Too many signup attempts. Please try again later.",
          details: null,
        },
      },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(rate.retryAfterSeconds));
    return response;
  }

  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Signup request could not be processed", 400);
    }

    const { email, name, password, tier = "FAMILY" } = parsed.data;
    const emailRate = checkSignupEmailRateLimit(email);
    if (!emailRate.allowed) {
      const response = NextResponse.json(
        {
          ok: false,
          error: {
            message: "Too many signup attempts. Please try again later.",
            details: null,
          },
        },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(emailRate.retryAfterSeconds));
      return response;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return ok(
        {
          message:
            "If this email is eligible, your account request has been accepted. Please continue to sign in.",
        },
        202
      );
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: password ? await hash(password, 10) : null,
        memberships: {
          create: {
            tier,
            status: "ACTIVE",
            startDate: now,
            expiryDate: expiry,
          },
        },
      },
    });

    return ok(
      {
        message:
          "If this email is eligible, your account request has been accepted. Please continue to sign in.",
      },
      202
    );
  } catch (error) {
    return fail("Signup request failed", 500);
  }
}
