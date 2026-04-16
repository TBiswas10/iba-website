import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const [events, members, donations, galleryItems, resources] = await Promise.all([
      prisma.event.count(),
      prisma.membership.count(),
      prisma.donation.count(),
      prisma.galleryItem.count(),
      prisma.resource.count(),
    ]);

    return ok({
      events,
      members,
      donations,
      galleryItems,
      resources,
    });
  } catch (error) {
    return fail("Failed to load dashboard stats", 500, error);
  }
}
