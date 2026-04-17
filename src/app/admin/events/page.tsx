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

  async function createEvent(formData: FormData) {
    const startVal = formData.get("start") as string;
    const endVal = formData.get("end") as string;
    
    // Parse as local time (Australia/Sydney) and convert to ISO string
    const start = new Date(startVal).toISOString();
    const end = new Date(endVal).toISOString();
    
    const payload = {
      title: formData.get("title"),
      start,
      end,
      location: formData.get("location"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
    };

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchEvents();
    }
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
        <h2>Create Event</h2>
        <form action={createEvent as any} className="grid-form">
          <label>
            Title
            <input required name="title" placeholder="Event title" />
          </label>
          <label>
            Start
            <input required type="datetime-local" name="start" />
          </label>
          <label>
            End
            <input required type="datetime-local" name="end" />
          </label>
          <label>
            Location
            <input name="location" placeholder="Event location" />
          </label>
          <label className="span-2">
            Description
            <textarea name="description" rows={3} placeholder="Event description" />
          </label>
          <label className="span-2">
            Image URL
            <input name="imageUrl" placeholder="https://..." />
          </label>
          <div className="span-2">
            <button className="btn-primary" type="submit">Create Event</button>
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
                <button
                  className="btn-ghost"
                  onClick={() => deleteEvent(event.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}