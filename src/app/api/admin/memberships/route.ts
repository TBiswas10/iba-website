import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { getCurrentUser } from "@/lib/auth";

const updateMembershipSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING"]).optional(),
  type: z.string().optional(),
});

async function checkAdmin() {
  const dbUser = await getCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }
  if (dbUser.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }
  return dbUser;
}

export async function GET() {
  const dbUser = await checkAdmin();
  if (dbUser instanceof NextResponse) return dbUser;

  try {
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const dbUser = await checkAdmin();
  if (dbUser instanceof NextResponse) return dbUser;

  try {
    const body = await request.json();
    const { userId, action } = body;

    if (action === "CREATE_MEMBERSHIP") {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
      }

      const membership = await prisma.membership.create({
        data: {
          userId,
          status: "ACTIVE",
          type: body.type || null,
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
        },
      });
      return NextResponse.json({ ok: true, data: membership });
    }

    if (action === "CHANGE_ROLE") {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "tirthabiswasm@gmail.com";

      if (dbUser.email !== superAdminEmail) {
        return NextResponse.json({ ok: false, error: "Only the Super Admin can change roles" }, { status: 403 });
      }

      const { role } = body;
      if (!["ADMIN", "MEMBER", "USER"].includes(role)) {
        return NextResponse.json({ ok: false, error: "Invalid role" }, { status: 400 });
      }
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
  const adminUser = await checkAdmin();
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const body = await request.json();
    const parsed = updateMembershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const { id, status, type } = parsed.data;

    const membership = await prisma.membership.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(type !== undefined && { type }),
      },
    });

    return NextResponse.json({ ok: true, data: membership });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to update membership" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminUser = await checkAdmin();
  if (adminUser instanceof NextResponse) return adminUser;

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
