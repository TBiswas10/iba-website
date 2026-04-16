import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { gallerySchema } from "@/lib/validators";

export async function GET() {
  const items = await prisma.galleryItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(items);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid gallery payload", 400, parsed.error.flatten());
    }

    const item = await prisma.galleryItem.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        mediaUrl: parsed.data.mediaUrl,
        mediaType: parsed.data.mediaType,
      },
    });

    return ok(item, 201);
  } catch (error) {
    return fail("Error creating gallery item", 500, error);
  }
}
