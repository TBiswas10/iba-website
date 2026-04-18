"use client";

import { useState, useRef, useCallback } from "react";
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
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  function startEdit(album: Album) {
    setEditingAlbum(album.id);
    setEditForm({ title: album.title, description: album.description || "" });
  }

  async function saveEdit(albumId: number) {
    try {
      const res = await fetch(`/api/admin/gallery/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setAlbums(albums.map(a => 
          a.id === albumId ? { ...a, title: editForm.title, description: editForm.description || null } : a
        ));
        if (selectedAlbum?.id === albumId) {
          setSelectedAlbum({ ...selectedAlbum, title: editForm.title, description: editForm.description || null });
        }
        setEditingAlbum(null);
      }
    } catch (error) {
      console.error("Failed to update album:", error);
    }
  }

  async function uploadImage(file: File, albumId: number) {
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
              ? { ...a, items: [...(a.items || []), data.item], coverUrl: a.coverUrl || data.item.mediaUrl }
              : a
          )
        );
        if (selectedAlbum?.id === albumId) {
          setSelectedAlbum({
            ...selectedAlbum,
            items: [...(selectedAlbum.items || []), data.item],
            coverUrl: selectedAlbum.coverUrl || data.item.mediaUrl
          });
        }
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (!selectedAlbum) return;
    setUploading(true);
    const fileArray = Array.from(files);
    for (let i = 0; i < fileArray.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);
      await uploadImage(fileArray[i], selectedAlbum.id);
    }
    setUploading(false);
    setUploadProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedAlbum, uploadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedAlbum, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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
            items: (a.items || []).filter((i) => i.id !== id),
          }))
        );
        if (selectedAlbum) {
          setSelectedAlbum({
            ...selectedAlbum,
            items: (selectedAlbum.items || []).filter((i) => i.id !== id)
          });
        }
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
            + New Album
          </button>
        </div>
      </section>

      {showCreateAlbum && (
        <section className="glass-panel">
          <h2>Create New Album</h2>
          <form action={createAlbum} className="grid-form">
            <label>
              Album Title
              <input required name="title" placeholder="e.g., Annual Dinner 2024" />
            </label>
            <label>
              Link to Event
              <select name="eventId">
                <option value="">None</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Description (optional)
              <textarea name="description" rows={2} placeholder="Brief description of this album" />
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
        <h2>Albums ({albums.length})</h2>
        {albums.length === 0 ? (
          <div className="empty-state">
            <p>No albums yet.</p>
            <button className="btn-primary" onClick={() => setShowCreateAlbum(true)}>
              Create Your First Album
            </button>
          </div>
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
                  {editingAlbum === album.id ? (
                    <div className="edit-form">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="edit-title"
                        placeholder="Album title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="edit-desc"
                        placeholder="Description"
                        rows={2}
                      />
                      <div className="edit-actions">
                        <button className="btn-sm" onClick={() => saveEdit(album.id)}>Save</button>
                        <button className="btn-sm btn-ghost" onClick={() => setEditingAlbum(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3>{album.title}</h3>
                      {album.event && <span className="album-event">{album.event.title}</span>}
                      <span className="album-count">{(album.items || []).length} photos</span>
                    </>
                  )}
                </div>
                <div className="album-actions">
                  <button
                    className="btn-sm"
                    onClick={() => setSelectedAlbum(album)}
                  >
                    View
                  </button>
                  {editingAlbum !== album.id && (
                    <button
                      className="btn-sm btn-ghost"
                      onClick={() => startEdit(album)}
                    >
                      Edit
                    </button>
                  )}
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
        <section className="glass-panel album-detail-panel">
          <div className="album-detail-header">
            <div>
              <h2>{selectedAlbum.title}</h2>
              {selectedAlbum.event && <span className="album-event-label">{selectedAlbum.event.title}</span>}
              <p className="album-desc">{selectedAlbum.description || "No description"}</p>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedAlbum(null)}>
              ← Back to Albums
            </button>
          </div>

          <div 
            ref={dropZoneRef}
            className={`drop-zone ${uploading ? 'uploading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              style={{ display: "none" }}
            />
            <div className="drop-zone-content">
              {uploading ? (
                <div className="upload-status">
                  <span className="spinner">⏳</span>
                  <p>{uploadProgress || "Uploading..."}</p>
                </div>
              ) : (
                <>
                  <span className="drop-icon">📤</span>
                  <p>Drag & drop photos here or click to browse</p>
                  <span className="drop-hint">Supports multiple files</span>
                </>
              )}
            </div>
          </div>

          {(selectedAlbum.items || []).length > 0 && (
            <div className="photos-section">
              <h3>Photos ({selectedAlbum.items.length})</h3>
              <div className="photos-grid">
                {(selectedAlbum.items || []).map((item) => (
                  <div key={item.id} className="photo-card">
                    <div className="photo-img">
                      <Image src={item.mediaUrl} alt={item.title} width={300} height={200} />
                    </div>
                    <div className="photo-info">
                      <span className="photo-title">{item.title}</span>
                      <button
                        className="photo-delete"
                        onClick={() => deleteItem(item.id, "item")}
                        title="Delete photo"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selectedAlbum.items || []).length === 0 && (
            <div className="empty-state">
              <p>No photos in this album yet.</p>
            </div>
          )}
        </section>
      )}

      {items.length > 0 && (
        <section className="glass-panel">
          <h2>Unassigned Photos ({items.length})</h2>
          <div className="photos-grid">
            {items.map((item) => (
              <div key={item.id} className="photo-card">
                <div className="photo-img">
                  <Image src={item.mediaUrl} alt={item.title} width={300} height={200} />
                </div>
                <div className="photo-info">
                  <span className="photo-title">{item.title}</span>
                  <button
                    className="photo-delete"
                    onClick={() => deleteItem(item.id, "item")}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 2rem;
        }
        .empty-state p {
          color: rgba(16, 16, 16, 0.5);
          margin-bottom: 1rem;
        }
        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .album-card {
          border: 1px solid rgba(29, 35, 59, 0.1);
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .album-cover {
          height: 160px;
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
          min-height: 80px;
        }
        .album-info h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }
        .album-event {
          display: block;
          font-size: 0.8rem;
          color: var(--teal);
          margin-bottom: 0.25rem;
        }
        .album-event-label {
          display: inline-block;
          font-size: 0.8rem;
          color: var(--teal);
          margin-bottom: 0.5rem;
        }
        .album-count {
          font-size: 0.8rem;
          color: rgba(16, 16, 16, 0.5);
        }
        .album-desc {
          color: rgba(16, 16, 16, 0.7);
          margin: 0.5rem 0 0;
        }
        .album-actions {
          padding: 0.5rem 1rem 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .edit-title {
          padding: 0.5rem;
          border: 1px solid rgba(29, 35, 59, 0.2);
          border-radius: 6px;
          font-size: 0.95rem;
        }
        .edit-desc {
          padding: 0.5rem;
          border: 1px solid rgba(29, 35, 59, 0.2);
          border-radius: 6px;
          font-size: 0.85rem;
          resize: vertical;
        }
        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .album-detail-panel {
          margin-top: 1.5rem;
        }
        .album-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .album-detail-header h2 {
          margin: 0 0 0.25rem;
        }
        
        .drop-zone {
          border: 2px dashed rgba(29, 35, 59, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(13, 127, 120, 0.03);
          margin-bottom: 1.5rem;
        }
        .drop-zone:hover {
          border-color: var(--teal);
          background: rgba(13, 127, 120, 0.06);
        }
        .drop-zone.uploading {
          pointer-events: none;
          border-color: var(--teal);
        }
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .drop-icon {
          font-size: 2rem;
        }
        .drop-zone p {
          margin: 0;
          color: var(--ink);
        }
        .drop-hint {
          font-size: 0.8rem;
          color: rgba(16, 16, 16, 0.5);
        }
        .upload-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .spinner {
          font-size: 1.5rem;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .photos-section {
          margin-top: 1.5rem;
        }
        .photos-section h3 {
          margin-bottom: 1rem;
        }
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .photo-card {
          border: 1px solid rgba(29, 35, 59, 0.1);
          border-radius: 10px;
          overflow: hidden;
          background: white;
        }
        .photo-img {
          aspect-ratio: 4/3;
          overflow: hidden;
        }
        .photo-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .photo-info {
          padding: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .photo-title {
          font-size: 0.8rem;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .photo-delete {
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .photo-delete:hover {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </div>
  );
}