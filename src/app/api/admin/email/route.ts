import { requireAdmin } from "@/lib/role";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const { subject, message, recipients } = body;

    if (!subject || !message) {
      return NextResponse.json({ ok: false, error: { message: "Subject and message required" } }, { status: 400 });
    }

    let emails: string[] = [];

    if (recipients === "all") {
      const users = await prisma.user.findMany({
        where: { role: { not: "ADMIN" } },
        select: { email: true },
      });
      emails = users.map((u) => u.email as string);
    } else if (recipients === "rsvps") {
      const rsvps = await prisma.rsvp.findMany({
        select: { email: true },
      });
      const uniqueEmails = new Set(rsvps.map((r) => r.email));
      emails = Array.from(uniqueEmails);
    } else if (recipients === "donors") {
      const donations = await prisma.donation.findMany({
        where: { status: "succeeded" },
        select: { donorEmail: true },
      });
      const uniqueEmails = new Set(donations.map((d) => d.donorEmail));
      emails = Array.from(uniqueEmails);
    }

    const failed: string[] = [];
    for (const email of emails) {
      try {
        await sendEmail({ to: email, subject, text: message });
      } catch {
        failed.push(email);
      }
    }

    return NextResponse.json({
      ok: true,
      sent: emails.length - failed.length,
      failed: failed.length,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: { message: "Failed to send emails" } }, { status: 500 });
  }
}