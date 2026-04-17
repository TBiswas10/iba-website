"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Event = {
  id: number;
  title: string;
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
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
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
        setFormData({ title: "", start: "", end: "", location: "", description: "", imageUrl: "" });
        fetchEvents();
      }
    });
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      location: event.location || "",
      description: event.description || "",
      imageUrl: event.imageUrl || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ title: "", start: "", end: "", location: "", description: "", imageUrl: "" });
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
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        <h2>{editingId ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit} className="grid-form">
          <label>
            Title
            <input 
              required 
              name="title" 
              placeholder="Event title" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </label>
          <label>
            Start
            <input 
              required 
              type="datetime-local" 
              name="start"
              value={formData.start}
              onChange={(e) => setFormData({ ...formData, start: e.target.value })}
            />
          </label>
          <label>
            End
            <input 
              required 
              type="datetime-local" 
              name="end"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            />
          </label>
          <label>
            Location
            <input 
              name="location" 
              placeholder="Event location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </label>
          <label className="span-2">
            Description
            <textarea 
              name="description" 
              rows={3} 
              placeholder="Event description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>
          <label className="span-2">
            Image URL
            <input 
              name="imageUrl" 
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
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
          <p>No events yet.</p>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div>
                  <strong>{event.title}</strong>
                  <br />
                  <small>
                    {new Date(event.start).toLocaleDateString("en-AU")} - {event.location}
                  </small>
                </div>
                <div className="button-row">
                  <button
                    className="btn-ghost"
                    onClick={() => startEdit(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}