"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Event = {
  id: number;
  title: string;
  slug: string;
  start: string;
  end: string;
  location: string;
  description: string;
  imageUrl: string;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    start: "",
    end: "",
    location: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetch("/api/session")
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push("/membership");
          return;
        }
        if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);
        fetchEvents();
      })
      .catch(() => router.push("/membership"));
  }, [router]);

  async function fetchEvents() {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    if (data.ok) {
      setEvents(data.data || []);
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const payload = {
      id: editingId,
      title: formData.title,
      slug: (formData.slug || formData.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      start: formData.start,
      end: formData.end,
      location: formData.location,
      description: formData.description,
      imageUrl: formData.imageUrl,
    };

    const isEdit = editingId !== null;
    const url = isEdit ? `/api/admin/events` : "/api/admin/events";
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(res => {
      if (res.ok) {
        setEditingId(null);
        setFormData({ title: "", slug: "", start: "", end: "", location: "", description: "", imageUrl: "" });
        fetchEvents();
      }
    });
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    const formatForInput = (d: string) => {
      try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const pad = (n: number) => n.toString().padStart(2, "0");
        const sydneyStr = date.toLocaleString("en-AU", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
        const sydneyDate = new Date(sydneyStr);
        return `${sydneyDate.getFullYear()}-${pad(sydneyDate.getMonth() + 1)}-${pad(sydneyDate.getDate())}T${pad(sydneyDate.getHours())}:${pad(sydneyDate.getMinutes())}`;
      } catch {
        return d;
      }
    };
    setFormData({
      title: event.title,
      slug: event.slug || "",
      start: formatForInput(event.start),
      end: formatForInput(event.end),
      location: event.location || "",
      description: event.description || "",
      imageUrl: event.imageUrl || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ title: "", slug: "", start: "", end: "", location: "", description: "", imageUrl: "" });
  }

  async function deleteEvent(id: number) {
    const res = await fetch(`/api/admin/events/${id}/delete`, { method: "POST" });
    if (res.ok) {
      fetchEvents();
    }
  }

  if (!user) {
    return (
      <section className="panel-stack">
        <section className="glass-panel"><p>Loading...</p></section>
      </section>
    );
  }

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Events</h1>
        <p>Create and manage community events.</p>
        <div className="admin-back-link">
          <a href="/admin" className="btn-ghost">← Back to Admin</a>
        </div>
      </section>

      <section className="glass-panel">
        <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit} className="grid-form admin-event-form">
          <label className="form-field">
            Title
            <input 
              required 
              name="title" 
              placeholder="Event title" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label className="form-field">
            URL Slug
            <input 
              name="slug" 
              placeholder="e.g., pohela-boishakh-2026"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </label>
          <label className="form-field">
            Start
            <input 
              required 
              type="datetime-local" 
              name="start"
              value={formData.start}
              onChange={(e) => setFormData({ ...formData, start: e.target.value })}
            />
          </label>
          <label className="form-field">
            End
            <input 
              required 
              type="datetime-local" 
              name="end"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            />
          </label>
          <label className="form-field span-2">
            Location
            <input 
              name="location" 
              placeholder="Event location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </label>
          <label className="form-field span-2">
            Description
            <textarea 
              name="description" 
              rows={3} 
              placeholder="Event description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>
          <label className="form-field span-2">
            Image URL
            <input 
              name="imageUrl" 
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formDataToSend = new FormData();
                  formDataToSend.append("file", file);
                  formDataToSend.append("action", "upload-event-image");
                  
                  try {
                    const res = await fetch("/api/admin/events", {
                      method: "POST",
                      body: formDataToSend,
                    });
                    const data = await res.json();
                    if (data.ok && data.url) {
                      setFormData(prev => ({ ...prev, imageUrl: data.url }));
                    }
                  } catch (err) {
                    console.error("Upload failed:", err);
                  }
                }}
              />
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <button 
                    type="button" 
                    className="btn-ghost btn-sm"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </label>
          <div className="span-2 button-row">
            <button className="btn-primary" type="submit">
              {editingId ? "Update Event" : "Create Event"}
            </button>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="glass-panel">
        <h2>Existing Events</h2>
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p className="empty-state">No events yet.</p>
        ) : (
          <div className="event-cards">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <span className="event-date">{new Date(event.start).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}</span>
                </div>
                <div className="event-card-body">
                  {event.location && (
                    <div className="event-row">
                      <span className="event-label">Location</span>
                      <span className="event-value">{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <div className="event-row">
                      <span className="event-label">Description</span>
                      <span className="event-value">{event.description.slice(0, 100)}{event.description.length > 100 ? "..." : ""}</span>
                    </div>
                  )}
                </div>
                <div className="event-card-footer">
                  <span className="event-meta">
                    {new Date(event.start).toLocaleString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })} - {new Date(event.end).toLocaleString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })}
                  </span>
                  <div className="event-actions">
                    <button className="btn-ghost btn-sm" onClick={() => startEdit(event)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => deleteEvent(event.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}