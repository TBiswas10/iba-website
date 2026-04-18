import { prisma } from "@/lib/prisma";
import Image from "next/image";

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
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Gallery</h1>
        <p>Celebrating our community through moments, memories, and milestones.</p>
      </section>

      {albumsWithEvent.length > 0 && (
        <section className="glass-panel">
          <h2>Event Albums</h2>
          <div className="albums-grid-public">
            {albumsWithEvent.map((album) => (
              <article key={album.id} className="album-card-public">
                <a href={`/gallery/${album.id}`} className="album-link">
                  <div className="album-cover-public">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        width={400}
                        height={250}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="album-placeholder-public">📷</div>
                    )}
                    <div className="album-overlay">
                      <span className="photo-count">{album.items.length} photos</span>
                    </div>
                  </div>
                  <div className="album-info-public">
                    <h3>{album.title}</h3>
                    {album.event && <span className="album-event-label">{album.event.title}</span>}
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {albumsWithoutEvent.length > 0 && (
        <section className="glass-panel">
          <h2>Albums</h2>
          <div className="albums-grid-public">
            {albumsWithoutEvent.map((album) => (
              <article key={album.id} className="album-card-public">
                <a href={`/gallery/${album.id}`} className="album-link">
                  <div className="album-cover-public">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        width={400}
                        height={250}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="album-placeholder-public">📷</div>
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
          <h2>Photos</h2>
          <div className="gallery-grid-public">
            {standaloneItems.map((item) => (
              <article key={item.id} className="gallery-item-public">
                <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="gallery-image-link">
                  <Image
                    src={item.mediaUrl}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="gallery-image"
                  />
                </a>
                <div className="gallery-caption">
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {albums.length === 0 && standaloneItems.length === 0 && (
        <section className="glass-panel">
          <h3>No gallery items yet</h3>
          <p>Add media via admin dashboard.</p>
        </section>
      )}
    </section>
  );
}