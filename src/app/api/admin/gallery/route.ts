import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { uploadImageToStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = formData.get("action") as string;

      if (action === "create-album") {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const eventId = formData.get("eventId") as string | null;

        const album = await prisma.album.create({
          data: {
            title,
            description: description || null,
            eventId: eventId ? parseInt(eventId) : null,
          },
        });

        return NextResponse.json({ ok: true, album });
      }

      if (action === "upload-image") {
        const albumId = formData.get("albumId") as string;
        const title = formData.get("title") as string;
        const file = formData.get("file") as File;

        if (!file) {
          return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const mimeType = file.type || "image/jpeg";

        const mediaUrl = await uploadImageToStorage(buffer, fileName, mimeType);

        const item = await prisma.galleryItem.create({
          data: {
            title: title || fileName,
            mediaUrl,
            mediaType: "image",
            albumId: parseInt(albumId),
          },
        });

        const album = await prisma.album.findUnique({
          where: { id: parseInt(albumId) },
          include: { items: true },
        });

        if (album && !album.coverUrl) {
          await prisma.album.update({
            where: { id: parseInt(albumId) },
            data: { coverUrl: mediaUrl },
          });
        }

        return NextResponse.json({ ok: true, item });
      }
    }

    const body = await request.json();

    if (body.action === "create-album") {
      const { title, description, eventId } = body;

      const album = await prisma.album.create({
        data: {
          title,
          description: description || null,
          eventId: eventId || null,
        },
      });

      return NextResponse.json({ ok: true, album });
    }

    const { title, mediaUrl, albumId } = body;

    const item = await prisma.galleryItem.create({
      data: {
        title,
        mediaUrl,
        mediaType: "image",
        albumId: albumId ? parseInt(albumId) : null,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("Gallery API error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const albums = await prisma.album.findMany({
      include: {
        event: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const itemsWithoutAlbum = await prisma.galleryItem.findMany({
      where: { albumId: null },
    });

    return NextResponse.json({ albums, items: itemsWithoutAlbum });
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery data" }, { status: 500 });
  }
}