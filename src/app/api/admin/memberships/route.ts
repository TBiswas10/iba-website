import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const updateMembershipSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING", "REJECTED"]).optional(),
  type: z.string().optional(),
});

const updateUserSchema = z.object({
  userId: z.number().int().positive(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  familyMembers: z.string().optional(),
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

      // Send approval email
      if (userExists.email) {
        const memberName = userExists.name || "Member";
        const memberType = membership.type || "General Member";
        sendEmail({
          to: userExists.email,
          subject: "Welcome to IBA — Your membership has been approved!",
          text: `Hi ${memberName},\n\nGreat news! Your ${memberType} membership with the Illawarra Bengali Association has been approved.\n\nYou can now log in to access member resources, RSVP to events, and more.\n\nVisit us at https://illawarrabengali.org\n\nWarm regards,\nIllawarra Bengali Association`,
        }).catch(err => console.error("Approval email failed:", err));
      }

      return NextResponse.json({ ok: true, data: membership });
    }

    if (action === "CHANGE_ROLE") {
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

    if (action === "UPDATE_USER") {
      const parsed = updateUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
      if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

      if (parsed.data.email && parsed.data.email !== user.email && user.supabaseUserId) {
        await getSupabaseAdmin().auth.admin.updateUserById(user.supabaseUserId, { email: parsed.data.email });
      }

      const updated = await prisma.user.update({
        where: { id: parsed.data.userId },
        data: {
          ...(parsed.data.name !== undefined && { name: parsed.data.name }),
          ...(parsed.data.email !== undefined && { email: parsed.data.email }),
          ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
          ...(parsed.data.familyMembers !== undefined && { familyMembers: parsed.data.familyMembers }),
        },
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

    const before = await prisma.membership.findUnique({ where: { id }, include: { user: true } });

    const membership = await prisma.membership.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(type !== undefined && { type }),
      },
    });

    // Send approval email when status is set to ACTIVE for the first time
    if (status === "ACTIVE" && before?.status !== "ACTIVE" && before?.user?.email) {
      const memberName = before.user.name || "Member";
      const memberType = membership.type || "General Member";
      sendEmail({
        to: before.user.email,
        subject: "Welcome to IBA — Your membership has been approved!",
        text: `Hi ${memberName},\n\nGreat news! Your ${memberType} membership with the Illawarra Bengali Association has been approved.\n\nYou can now log in to access member resources, RSVP to events, and more.\n\nVisit us at https://illawarrabengali.org\n\nWarm regards,\nIllawarra Bengali Association`,
      }).catch(err => console.error("Approval email failed:", err));
    }

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
