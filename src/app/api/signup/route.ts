import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { checkSignupEmailRateLimit, checkSignupRateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

// Regular (anon) client — triggers Supabase's built-in email confirmation system
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

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

    // Use the regular anon client signUp — this triggers Supabase's built-in
    // confirmation email (requires "Confirm email" enabled in Supabase dashboard)
    const origin = request.headers.get("origin") || "https://iba-website-i8fy.vercel.app";
    const { data: authData, error: authError } = await getAnonClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${origin}/auth/callback?next=/membership`,
      },
    });

    if (authError) {
      if (authError.message?.includes("already registered") || authError.message?.includes("already been registered")) {
        // User exists in Auth but not linked — find and use their existing ID
        const authUser = await findAuthUserByEmail(email);
        if (!authUser) return fail("Account already exists. Please sign in.", 409);

        // Create or update Prisma record
        if (existingUser) {
          await prisma.user.update({ where: { email }, data: { supabaseUserId: authUser.id, name: name || existingUser.name, phone, familyMembers } });
        } else {
          await prisma.user.create({ data: { email, name, phone, familyMembers, supabaseUserId: authUser.id, memberships: { create: { status: "PENDING", startDate: new Date() } } } });
        }
        return ok({ message: "Account created. Please check your email to confirm your address." });
      }
      return fail("Failed to create account", 500);
    }

    if (!authData.user) return fail("Failed to create account", 500);

    const supabaseUserId = authData.user.id;

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

    return ok({ message: "Account created. Please check your email to confirm your address." });
  } catch (error) {
    console.error("Signup error:", error);
    return fail("Signup request failed", 500);
  }
}
