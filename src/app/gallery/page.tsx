import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { GalleryViewer } from "@/components/gallery-viewer";

import "./gallery.css";

export const dynamic = "force-dynamic";

async function getAlbums() {
  const albums = await prisma.album.findMany({
    include: {
      event: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return albums;
}

async function getStandaloneItems() {
  const items = await prisma.galleryItem.findMany({
    where: { albumId: null },
    orderBy: { createdAt: "desc" },
  });
  return items;
}

export default async function GalleryPage() {
  const albums = await getAlbums();
  const standaloneItems = await getStandaloneItems();

  const albumsWithEvent = albums.filter((a) => a.eventId);
  const albumsWithoutEvent = albums.filter((a) => !a.eventId);

  return (
    <div className="panel-stack">
      <section className="glass-panel">
        <h1 className="mb-2">Gallery</h1>
        <p className="text-lg text-neutral-600 max-w-2xl">
          Celebrating our community through moments, memories, and milestones. Explore our event albums and captured memories.
        </p>
      </section>

      {albumsWithEvent.length > 0 && (
        <section className="glass-panel">
          <div className="flex items-center justify-between mb-8">
            <h2 className="!mb-0">Event Albums</h2>
            <span className="text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              {albumsWithEvent.length} Albums
            </span>
          </div>
          <div className="albums-grid-public">
            {albumsWithEvent.map((album) => (
              <article key={album.id} className="album-card-public">
                <a href={`/gallery/${album.id}`} className="album-link">
                  <div className="album-cover-public">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-4xl opacity-30">📷</div>
                    )}
                    <div className="album-overlay">
                      <span className="photo-count">{album.items.length} photos</span>
                    </div>
                  </div>
                  <div className="album-info-public">
                    {album.event && <span className="album-event-label">{album.event.title}</span>}
                    <h3>{album.title}</h3>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {albumsWithoutEvent.length > 0 && (
        <section className="glass-panel">
          <div className="flex items-center justify-between mb-8">
            <h2 className="!mb-0">General Albums</h2>
            <span className="text-sm font-semibold text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
              {albumsWithoutEvent.length} Albums
            </span>
          </div>
          <div className="albums-grid-public">
            {albumsWithoutEvent.map((album) => (
              <article key={album.id} className="album-card-public">
                <a href={`/gallery/${album.id}`} className="album-link">
                  <div className="album-cover-public">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-4xl opacity-30">📷</div>
                    )}
                    <div className="album-overlay">
                      <span className="photo-count">{album.items.length} photos</span>
                    </div>
                  </div>
                  <div className="album-info-public">
                    <h3>{album.title}</h3>
                    {album.description && <p>{album.description}</p>}
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {standaloneItems.length > 0 && (
        <section className="glass-panel">
          <div className="flex items-center justify-between mb-8">
            <h2 className="!mb-0">Individual Photos</h2>
            <span className="text-sm font-semibold text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full border border-neutral-200">
              {standaloneItems.length} Photos
            </span>
          </div>
          <GalleryViewer items={standaloneItems} />
        </section>
      )}

      {albums.length === 0 && standaloneItems.length === 0 && (
        <section className="glass-panel text-center py-16">
          <div className="text-5xl mb-4 opacity-20">📷</div>
          <h3 className="text-xl font-semibold mb-2">No gallery items yet</h3>
          <p className="text-neutral-500">Check back later for photos of our community events.</p>
        </section>
      )}
    </div>
  );
}