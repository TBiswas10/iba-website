import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getGalleryItems() {
  const items = await prisma.galleryItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return items;
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  const imageItems = items.filter((item) => item.mediaType.startsWith("image/"));
  const videoItems = items.filter((item) => item.mediaType.startsWith("video/"));

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Gallery</h1>
        <p>Celebrating our community through moments, memories, and milestones.</p>
      </section>

      {imageItems.length > 0 && (
        <section className="gallery-grid">
          {imageItems.map((item) => (
            <article key={item.id} className="gallery-item">
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
        </section>
      )}

      {videoItems.length > 0 && (
        <section className="gallery-videos">
          <h2>Videos</h2>
          <div className="gallery-grid">
            {videoItems.map((item) => (
              <article key={item.id} className="gallery-video-item">
                <video controls preload="metadata">
                  <source src={item.mediaUrl} type={item.mediaType} />
                  Your browser does not support video playback.
                </video>
                <div className="gallery-caption">
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <section className="glass-panel">
          <h3>No gallery items yet</h3>
          <p>Add media via admin dashboard.</p>
        </section>
      )}
    </section>
  );
}
