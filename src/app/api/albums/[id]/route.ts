import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const albumId = parseInt(params.id, 10);
  if (isNaN(albumId)) return fail("Invalid album ID", 400);

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      event: { select: { id: true, title: true, start: true, slug: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!album) return fail("Album not found", 404);
  return ok(album);
}

const patchAlbumSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  eventId: z.number().int().positive().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const albumId = parseInt(params.id, 10);
  if (isNaN(albumId)) return fail("Invalid album ID", 400);

  try {
    const body = await request.json();
    const parsed = patchAlbumSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

    const album = await prisma.album.update({
      where: { id: albumId },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.coverUrl !== undefined && { coverUrl: parsed.data.coverUrl }),
        ...(parsed.data.eventId !== undefined && { eventId: parsed.data.eventId }),
      },
      include: {
        event: { select: { id: true, title: true, start: true, slug: true } },
        _count: { select: { items: true } },
      },
    });

    return ok(album);
  } catch (error) {
    return fail("Error updating album", 500, error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const albumId = parseInt(params.id, 10);
  if (isNaN(albumId)) return fail("Invalid album ID", 400);

  try {
    // GalleryItems cascade via onDelete: SetNull — delete them explicitly first
    await prisma.galleryItem.deleteMany({ where: { albumId } });
    await prisma.album.delete({ where: { id: albumId } });
    return ok({ deleted: true });
  } catch (error) {
    return fail("Error deleting album", 500, error);
  }
}
