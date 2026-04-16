import nodemailer from "nodemailer";

import { env } from "@/lib/env";

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
  volunteerInterest: string;
  kidsCount?: number | null;
  dietaryNotes?: string | null;
  donationIntent?: string | null;
  additionalNotes?: string | null;
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

  await transport.sendMail({ from, to, subject, text });
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
  })} to ${event.end.toLocaleString("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
  })}`;

  const notes = [
    `Attendees: ${rsvp.attendees}`,
    `Volunteer interest: ${rsvp.volunteerInterest}`,
    rsvp.kidsCount !== undefined && rsvp.kidsCount !== null ? `Kids count: ${rsvp.kidsCount}` : null,
    rsvp.dietaryNotes ? `Dietary notes: ${rsvp.dietaryNotes}` : null,
    rsvp.donationIntent ? `Donation intent: ${rsvp.donationIntent}` : null,
    rsvp.additionalNotes ? `Additional notes: ${rsvp.additionalNotes}` : null,
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
        <h1 style="margin-bottom:0.5rem">RSVP confirmed for ${event.title}</h1>
        <p>Thanks ${rsvp.name}, we have received your RSVP.</p>
        <p><strong>Event time:</strong> ${eventRange}</p>
        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ""}
        <ul>
          <li><strong>Attendees:</strong> ${rsvp.attendees}</li>
          <li><strong>Volunteer interest:</strong> ${rsvp.volunteerInterest}</li>
          ${rsvp.kidsCount !== undefined && rsvp.kidsCount !== null ? `<li><strong>Kids count:</strong> ${rsvp.kidsCount}</li>` : ""}
          ${rsvp.dietaryNotes ? `<li><strong>Dietary notes:</strong> ${rsvp.dietaryNotes}</li>` : ""}
          ${rsvp.donationIntent ? `<li><strong>Donation intent:</strong> ${rsvp.donationIntent}</li>` : ""}
          ${rsvp.additionalNotes ? `<li><strong>Additional notes:</strong> ${rsvp.additionalNotes}</li>` : ""}
        </ul>
        <p>We will follow up if anything changes.</p>
      </div>
    `,
  });
}