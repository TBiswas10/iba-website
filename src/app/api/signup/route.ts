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

    const { email, name, password, tier = "MEMBER" } = parsed.data;
    
    // Validate password for email signup (not required for Google)
    if (password !== undefined && password.length > 0 && password.length < 8) {
      return fail("Password must be at least 8 characters", 400);
    }
    
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

    // Handle Google signup (no password) vs email signup (with password)
    if (password && password.length >= 8) {
      // Email signup with password
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: await hash(password, 12),
          memberships: {
            create: {
              tier: tier as any,
              status: "ACTIVE",
              startDate: now,
              expiryDate: expiry,
            },
          },
        },
      });
    } else {
      // Google signup (no password) - create user without membership
      // Membership will be created by Stripe webhook after payment
      await prisma.user.create({
        data: {
          email,
          name,
          // No passwordHash - Google auth
        },
      });
    }

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
