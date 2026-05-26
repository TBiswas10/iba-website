import nodemailer from "nodemailer";

import { env } from "@/lib/env";

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type EventDetails = {
  title: string;
  start: Date;
  end: Date;
  location?: string | null;
};

type RsvpDetails = {
  name: string;
  email: string;
  phone: string;
  attendees: number;
  kidsCount?: number | null;
  kidsAges?: string[] | null;
};

function getTransport() {
  const hasSmtpConfig = env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD;

  if (!hasSmtpConfig) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const port = Number(env.SMTP_PORT);

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const from = env.SMTP_FROM || "Illawarra Bengali Association <hello@illawarrabengali.org>";
  const transport = getTransport();

  try {
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error("Email send failed:", err);
    throw err;
  }
}

export async function sendRsvpConfirmationEmail({
  event,
  rsvp,
}: {
  event: EventDetails;
  rsvp: RsvpDetails;
}) {
  const from = env.SMTP_FROM || "Illawarra Bengali Association <hello@illawarrabengali.org>";
  const transport = getTransport();

  const eventRange = `${event.start.toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Australia/Sydney",
  })} to ${event.end.toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Australia/Sydney",
  })}`;

  const kidsAgesStr = rsvp.kidsAges ? `Ages: ${rsvp.kidsAges.join(", ")}` : null;
  const notes = [
    `Adults: ${rsvp.attendees}`,
    rsvp.kidsCount !== undefined && rsvp.kidsCount !== null ? `Kids: ${rsvp.kidsCount}` : null,
    kidsAgesStr,
  ]
    .filter(Boolean)
    .join("\n");

  return transport.sendMail({
    from,
    to: rsvp.email,
    subject: `RSVP confirmed for ${event.title}`,
    text: [
      `Thanks ${rsvp.name},`,
      "",
      `We have received your RSVP for ${event.title}.`,
      `Event time: ${eventRange}`,
      event.location ? `Location: ${event.location}` : null,
      "",
      notes,
      "",
      "We will follow up if anything changes.",
      "",
      "Illawarra Bengali Association",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#101010">
        <h1 style="margin-bottom:0.5rem">RSVP confirmed for ${escHtml(event.title)}</h1>
        <p>Thanks ${escHtml(rsvp.name)}, we have received your RSVP.</p>
        <p><strong>Event time:</strong> ${escHtml(eventRange)}</p>
        ${event.location ? `<p><strong>Location:</strong> ${escHtml(event.location)}</p>` : ""}
        <ul>
          <li><strong>Adults:</strong> ${escHtml(String(rsvp.attendees))}</li>
          ${rsvp.kidsCount !== undefined && rsvp.kidsCount !== null ? `<li><strong>Kids:</strong> ${escHtml(String(rsvp.kidsCount))}</li>` : ""}
          ${rsvp.kidsAges ? `<li><strong>Kids ages:</strong> ${escHtml(rsvp.kidsAges.join(", "))}</li>` : ""}
        </ul>
        <p>We will follow up if anything changes.</p>
      </div>
    `,
  });
}