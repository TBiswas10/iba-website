import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { cookies } from "next/headers";

const updateMembershipSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING"]),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const users = await prisma.user.findMany({
      include: { 
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1
        } 
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch users and memberships" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Use a direct auth check instead of middleware for robustness
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (action === "CREATE_MEMBERSHIP") {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + 1);

      const membership = await prisma.membership.create({
        data: {
          userId,
          status: "ACTIVE",
          startDate: now,
          expiryDate: expiry,
        },
      });
      return NextResponse.json({ ok: true, data: membership });
    }

    if (action === "CHANGE_ROLE") {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "tirthabiswasm@gmail.com";

      if (email !== superAdminEmail) {
        return NextResponse.json({ ok: false, error: "Only the Super Admin can change roles" }, { status: 403 });
      }

      const { role } = body;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({ ok: true, data: updated });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to perform action" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateMembershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const { id, status } = parsed.data;

    const membership = await prisma.membership.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, data: membership });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update membership" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;
  
  if (!email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID required" }, { status: 400 });
    }

    await prisma.membership.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to delete membership" }, { status: 500 });
  }
}