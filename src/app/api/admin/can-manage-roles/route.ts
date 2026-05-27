import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const dbUser = await getCurrentUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, canManageRoles: false }, { status: 401 });
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "tirthabiswasm@gmail.com";
  const canManageRoles = dbUser.email === superAdminEmail;

  return NextResponse.json({ ok: true, canManageRoles });
}
