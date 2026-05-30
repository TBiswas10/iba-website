import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");
  if (!id) return NextResponse.json({ ok: false, error: "User ID required" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    // Delete from Supabase Auth first (best-effort)
    if (user.supabaseUserId) {
      await getSupabaseAdmin().auth.admin.deleteUser(user.supabaseUserId);
    }

    // Delete from Prisma — cascades memberships and reimbursements
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete user" }, { status: 500 });
  }
}

export async function POST() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(users);
  } catch (error) {
    return fail("Error fetching users", 500, error);
  }
}
