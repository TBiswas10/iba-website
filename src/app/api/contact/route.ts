import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const ADMIN_EMAIL = "tirthabiswasm@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid contact payload", 400, parsed.error.flatten());
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
      },
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: ADMIN_EMAIL,
          subject: `New IBA Contact: ${parsed.data.name}`,
          text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nPhone: ${parsed.data.phone || "N/A"}\n\nMessage:\n${parsed.data.message}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(parsed.data.phone || "N/A")}</p>
            <hr/>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(parsed.data.message)}</p>
          `,
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }
    }

    return ok(submission, 201);
  } catch (error) {
    return fail("Error submitting contact form", 500, error);
  }
}
