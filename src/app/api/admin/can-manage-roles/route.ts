import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const dbUser = await getCurrentUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, canManageRoles: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, canManageRoles: true });
}
