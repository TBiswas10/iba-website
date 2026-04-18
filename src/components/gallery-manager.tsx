"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Album = {
  id: number;
  title: string;
  description: string | null;
  coverUrl: string | null;
  eventId: number | null;
  event?: { id: number; title: string } | null;
  items: GalleryItem[];
  createdAt: Date | string;
};

type GalleryItem = {
  id: number;
  title: string;
  description: string | null;
  mediaUrl: string;
  mediaType: string;
  albumId: number | null;
  createdAt?: Date | string;
};

type Event = {
  id: number;
  title: string;
};

interface GalleryManagerProps {
  initialAlbums: Album[];
  initialItems: GalleryItem[];
  events: Event[];
}

export function GalleryManager({
  initialAlbums,
  initialItems,
  events,
}: GalleryManagerProps) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function createAlbum(formData: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-album",
          title: formData.get("title"),
          description: formData.get("description"),
          eventId: formData.get("eventId") || null,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAlbums([data.album, ...albums]);
        setShowCreateAlbum(false);
      }
    } catch (error) {
      console.error("Failed to create album:", error);
    }
    setLoading(false);
  }

  async function uploadImage(file: File, albumId: number) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("action", "upload-image");
      formData.append("albumId", String(albumId));
      formData.append("title", file.name);
      formData.append("file", file);

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        setAlbums(
          albums.map((a) =>
            a.id === albumId
              ? { ...a, items: [...a.items, data.item], coverUrl: a.coverUrl || data.item.mediaUrl }
              : a
          )
        );
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
    setUploading(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedAlbum || !e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      await uploadImage(file, selectedAlbum.id);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deleteItem(id: number, type: "album" | "item") {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      await fetch(`/api/admin/gallery/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (type === "album") {
        setAlbums(albums.filter((a) => a.id !== id));
      } else {
        setItems(items.filter((i) => i.id !== id));
        setAlbums(
          albums.map((a) => ({
            ...a,
            items: a.items.filter((i) => i.id !== id),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }

  return (
    <div>
      <section className="glass-panel">
        <div className="admin-header">
          <div>
            <h1>Gallery</h1>
            <p>Manage albums and photos.</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateAlbum(true)}
          >
            Create Album
          </button>
        </div>
      </section>

      {showCreateAlbum && (
        <section className="glass-panel">
          <h2>New Album</h2>
          <form action={createAlbum} className="grid-form">
            <label>
              Title
              <input required name="title" placeholder="Album title" />
            </label>
            <label>
              Link to Event (optional)
              <select name="eventId">
                <option value="">No event</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Description
              <textarea name="description" rows={2} placeholder="Optional description" />
            </label>
            <div className="span-2 button-row">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Album"}
              </button>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setShowCreateAlbum(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="glass-panel">
        <h2>Albums</h2>
        {albums.length === 0 ? (
          <p>No albums yet. Create one to get started.</p>
        ) : (
          <div className="albums-grid">
            {albums.map((album) => (
              <div key={album.id} className="album-card">
                <div
                  className="album-cover"
                  onClick={() => setSelectedAlbum(album)}
                >
                  {album.coverUrl ? (
                    <Image
                      src={album.coverUrl}
                      alt={album.title}
                      width={300}
                      height={200}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="album-placeholder">📷</div>
                  )}
                </div>
                <div className="album-info">
                  <h3>{album.title}</h3>
                  {album.event && <span className="album-event">{album.event.title}</span>}
                  <span className="album-count">{(album.items || []).length} photos</span>
                </div>
                <div className="album-actions">
                  <button
                    className="btn-sm"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    Manage
                  </button>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => deleteItem(album.id, "album")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedAlbum && (
        <section className="glass-panel">
          <div className="admin-header">
            <h2>{selectedAlbum.title}</h2>
            <button className="btn-ghost" onClick={() => setSelectedAlbum(null)}>
              Close
            </button>
          </div>
          <p>{selectedAlbum.description || "No description"}</p>
          
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Photos"}
            </button>
          </div>

          {selectedAlbum && (selectedAlbum.items || []).length === 0 ? (
            <p>No photos in this album yet.</p>
          ) : (
            <div className="gallery-grid">
              {(selectedAlbum.items || []).map((item) => (
                <div key={item.id} className="gallery-item-admin">
                  <Image src={item.mediaUrl} alt={item.title} width={200} height={150} />
                  <div className="gallery-item-info">
                    <h3>{item.title}</h3>
                  </div>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => deleteItem(item.id, "item")}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {items.length > 0 && (
        <section className="glass-panel">
          <h2>Unassigned Items</h2>
          <div className="gallery-grid">
            {items.map((item) => (
              <div key={item.id} className="gallery-item-admin">
                <Image src={item.mediaUrl} alt={item.title} width={200} height={150} />
                <div className="gallery-item-info">
                  <h3>{item.title}</h3>
                </div>
                <button
                  className="btn-danger btn-sm"
                  onClick={() => deleteItem(item.id, "item")}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .album-card {
          border: 1px solid rgba(29, 35, 59, 0.1);
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .album-cover {
          height: 150px;
          cursor: pointer;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .album-cover:hover {
          opacity: 0.9;
        }
        .album-placeholder {
          font-size: 3rem;
        }
        .album-info {
          padding: 1rem;
        }
        .album-info h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
        }
        .album-event {
          display: block;
          font-size: 0.8rem;
          color: var(--teal);
          margin-bottom: 0.25rem;
        }
        .album-count {
          font-size: 0.8rem;
          color: rgba(16, 16, 16, 0.5);
        }
        .album-actions {
          padding: 0.5rem 1rem 1rem;
          display: flex;
          gap: 0.5rem;
        }
        .upload-section {
          margin: 1rem 0;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .gallery-item-admin {
          border: 1px solid rgba(29, 35, 59, 0.1);
          border-radius: 8px;
          padding: 0.5rem;
          background: white;
        }
        .gallery-item-admin img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
        }
        .gallery-item-info {
          padding: 0.5rem 0;
        }
        .gallery-item-info h3 {
          margin: 0;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}