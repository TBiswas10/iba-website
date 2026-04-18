import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, title: true, start: true, slug: true } },
      _count: { select: { items: true } },
    },
  });
  return ok(albums);
}

const createAlbumSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventId: z.number().int().positive().optional().nullable(),
});

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = createAlbumSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid album payload", 400, parsed.error.flatten());
    }

    const album = await prisma.album.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        eventId: parsed.data.eventId ?? null,
      },
      include: {
        event: { select: { id: true, title: true, start: true, slug: true } },
        _count: { select: { items: true } },
      },
    });

    return ok(album, 201);
  } catch (error) {
    return fail("Error creating album", 500, error);
  }
}
