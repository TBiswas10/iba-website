import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/role";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const members = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: { email: true, name: true },
  });

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Email Members</h1>
        <p>Send an email to all members or select recipients.</p>
      </section>

      <section className="glass-panel">
        <h2>Compose Email</h2>
        <form action="/api/admin/email" method="POST" className="grid-form">
          <label>
            Subject
            <input required name="subject" placeholder="Email subject" />
          </label>
          <label>
            Recipient Group
            <select required name="recipients">
              <option value="all">All Members</option>
              <option value="rsvps"> RSVPs Only</option>
              <option value="donors">Donors Only</option>
            </select>
          </label>
          <label className="span-2">
            Message
            <textarea required name="message" placeholder="Write your message..." rows={8} />
          </label>
          <div className="span-2">
            <button className="btn-primary" type="submit">
              Send Email
            </button>
          </div>
        </form>
      </section>

      <section className="glass-panel">
        <h2>Member Count</h2>
        <p>Total members: {members.length}</p>
      </section>
    </section>
  );
}