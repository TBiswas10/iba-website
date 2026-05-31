import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkSignupEmailRateLimit, checkSignupRateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

async function findAuthUserByEmail(email: string) {
  const { data } = await getSupabaseAdmin().auth.admin.listUsers();
  const users = (data?.users ?? []) as Array<{ id: string; email?: string }>;
  return users.find(u => u.email === email) || null;
}

export async function POST(request: Request) {
  const rate = checkSignupRateLimit(request);
  if (!rate.allowed) {
    const response = NextResponse.json(
      { ok: false, error: { message: "Too many signup attempts. Please try again later.", details: null } },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(rate.retryAfterSeconds));
    return response;
  }

  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues.map(i => i.message).join("; "), 400);
    }

    const { email, password, name, phone, familyMembers } = parsed.data;

    const emailRate = checkSignupEmailRateLimit(email);
    if (!emailRate.allowed) {
      const response = NextResponse.json(
        { ok: false, error: { message: "Too many signup attempts. Please try again later.", details: null } },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(emailRate.retryAfterSeconds));
      return response;
    }

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser?.supabaseUserId) {
      const { error: lookupError } = await getSupabaseAdmin().auth.admin.getUserById(existingUser.supabaseUserId);
      if (!lookupError) {
        return fail("An account with this email already exists.", 409);
      }
      // Auth user was deleted — clear the link and allow re-registration
      await prisma.user.update({ where: { email }, data: { supabaseUserId: null } });
    }

    let supabaseUserId: string;

    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError) {
      if (authError.status === 422 || authError.message?.includes("already been registered")) {
        const authUser = await findAuthUserByEmail(email);
        if (!authUser) return fail("Account already exists. Please sign in.", 409);
        supabaseUserId = authUser.id;
        await getSupabaseAdmin().auth.admin.updateUserById(authUser.id, {
          email_confirm: true,
          user_metadata: { full_name: name },
        });
      } else {
        return fail("Failed to create account", 500);
      }
    } else {
      supabaseUserId = authData.user.id;
    }

    // Create or link Prisma user
    if (existingUser) {
      await prisma.user.update({ where: { email }, data: { supabaseUserId, name: name || existingUser.name, phone, familyMembers } });
    } else {
      await prisma.user.create({
        data: {
          email, name, phone, familyMembers, supabaseUserId,
          memberships: { create: { status: "PENDING", startDate: new Date() } },
        },
      });
    }

    return ok({ message: "Account created. Welcome!" });
  } catch (error) {
    console.error("Signup error:", error);
    return fail("Signup request failed", 500);
  }
}
