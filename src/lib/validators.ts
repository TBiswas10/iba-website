import { MembershipStatus, MembershipTier } from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().optional());

export const eventSchema = z.object({
  title: z.string().min(2),
  start: z.string().datetime(),
  end: z.string().datetime(),
  location: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export const resourceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  url: z.string().url(),
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  mediaUrl: z.string().url(),
  mediaType: z.string().min(3),
});

export const donationSchema = z.object({
  amountCents: z.number().int().positive(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  message: z.string().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().optional(),
  tier: z.nativeEnum(MembershipTier).default("FAMILY"),
});

export const membershipSchema = z.object({
  userId: z.number().int().positive(),
  tier: z.nativeEnum(MembershipTier),
  status: z.nativeEnum(MembershipStatus),
  startDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
});

export const rsvpSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  attendees: z.coerce.number().int().positive(),
  volunteerInterest: z.string().min(2),
  kidsCount: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  }, z.coerce.number().int().nonnegative().optional()),
  dietaryNotes: optionalText,
  donationIntent: optionalText,
  additionalNotes: optionalText,
});
