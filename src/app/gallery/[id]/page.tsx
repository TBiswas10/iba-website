import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

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
            <h1>{album.title}</h1>
            {album.event && (
              <p className="album-event-link">Event: {album.event.title}</p>
            )}
            {album.description && (
              <p className="album-description">{album.description}</p>
            )}
          </div>
          <span className="photo-count-badge">{album.items.length} photos</span>
        </div>
      </section>

      {album.items.length > 0 ? (
        <section className="glass-panel">
          <div className="photos-grid">
            {album.items.map((item) => (
              <article key={item.id} className="photo-item">
                <a href={item.mediaUrl} target="_blank" rel="noreferrer">
                  <Image
                    src={item.mediaUrl}
                    alt={item.title}
                    width={500}
                    height={400}
                    style={{ objectFit: "cover" }}
                  />
                </a>
                {item.title && <span className="photo-title">{item.title}</span>}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="glass-panel">
          <p>No photos in this album yet.</p>
        </section>
      )}
    </section>
  );
}