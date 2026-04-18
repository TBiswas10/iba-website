import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GalleryViewer } from "@/components/gallery-viewer";

import "../../gallery/gallery.css";

export const dynamic = "force-dynamic";

async function getAlbum(id: number) {
  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      event: true,
      items: true,
    },
  });
  return album;
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(parseInt(id));

  if (!album) {
    notFound();
  }

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <div className="album-detail-header">
          <div>
            <a href="/gallery" className="back-link">← Back to Gallery</a>
            <h1>{album.title}</h1>
            {album.event && (
              <p className="album-event-link">📅 {album.event.title}</p>
            )}
            {album.description && (
              <p className="album-description">{album.description}</p>
            )}
          </div>
          <span className="photo-count-badge">{album.items.length} photos</span>
        </div>
      </section>

      <section className="glass-panel">
        <GalleryViewer items={album.items} />
      </section>
    </section>
  );
}