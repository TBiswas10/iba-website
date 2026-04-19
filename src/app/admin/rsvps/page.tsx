"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Event = {
  id: number;
  title: string;
  start: string;
  end: string;
};

type Rsvp = {
  id: number;
  eventId: number;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  kidsCount: number | null;
  kidsAges: string | null;
  createdAt: string;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

function formatKidsAges(agesJson: string | null) {
  if (!agesJson) return null;
  try {
    return JSON.parse(agesJson).join(", ");
  } catch {
    return agesJson;
  }
}

export default function AdminRsvpsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "">("");
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
    const res = await fetch("/api/events");
    const data = await res.json();
    if (data.ok) {
      setEvents(data.data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (selectedEventId) {
      fetch(`/api/rsvps?eventId=${selectedEventId}`)
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setRsvps(data.data || []);
          }
        });
    } else {
      setRsvps([]);
    }
  }, [selectedEventId]);

  async function deleteRsvp(id: number) {
    if (!confirm("Are you sure you want to delete this RSVP?")) return;
    await fetch(`/api/rsvps?id=${id}`, { method: "DELETE" });
    setRsvps(rsvps.filter(r => r.id !== id));
  }

  const totalAdults = rsvps.reduce((sum, r) => sum + r.attendees, 0);
  const totalKids = rsvps.reduce((sum, r) => sum + (r.kidsCount || 0), 0);

  if (!user) {
    return (
      <section className="panel-stack">
        <section className="glass-panel"><p>Loading...</p></section>
      </section>
    );
  }

  return (
    <section className="panel-stack admin-rsvps">
      <header className="glass-panel admin-rsvps-header">
        <div>
          <h1>RSVPs</h1>
          <p>View and manage event RSVPs.</p>
        </div>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </header>

      <section className="glass-panel">
        <label className="event-select-label">
          Select Event
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : "")}
            className="event-select"
          >
            <option value="">— Select an event —</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({new Date(event.start).toLocaleDateString(undefined)})
              </option>
            ))}
          </select>
        </label>
      </section>

      {selectedEventId && (
        <>
          <section className="glass-panel stats-row">
            <div className="stat-item">
              <span className="stat-value">{rsvps.length}</span>
              <span className="stat-label">Total RSVPs</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalAdults}</span>
              <span className="stat-label">Adults</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalKids}</span>
              <span className="stat-label">Kids</span>
            </div>
          </section>

          <section className="glass-panel">
            {rsvps.length === 0 ? (
              <p className="empty-state">No RSVPs for this event yet.</p>
            ) : (
              <div className="rsvp-cards">
                {rsvps.map(rsvp => (
                  <div key={rsvp.id} className="rsvp-card">
                    <div className="rsvp-card-header">
                      <h3>{rsvp.name}</h3>
                      <span className="rsvp-count">{rsvp.attendees} adult{rsvp.attendees !== 1 ? "s" : ""}{rsvp.kidsCount && rsvp.kidsCount > 0 ? ` + ${rsvp.kidsCount} kid${rsvp.kidsCount !== 1 ? "s" : ""}` : ""}</span>
                    </div>
                    <div className="rsvp-card-body">
                      <div className="rsvp-row">
                        <span className="rsvp-label">Email</span>
                        <span className="rsvp-value">{rsvp.email}</span>
                      </div>
                      <div className="rsvp-row">
                        <span className="rsvp-label">Phone</span>
                        <span className="rsvp-value">{rsvp.phone || "—"}</span>
                      </div>
                      {rsvp.kidsCount !== null && rsvp.kidsCount > 0 && (
                        <div className="rsvp-row">
                          <span className="rsvp-label">Kids</span>
                          <span className="rsvp-value">
                            {rsvp.kidsCount}
                            {rsvp.kidsAges && <span className="rsvp-meta"> (Ages: {formatKidsAges(rsvp.kidsAges)})</span>}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="rsvp-card-footer">
                      <span className="rsvp-date">{new Date(rsvp.createdAt).toLocaleDateString(undefined)}</span>
                      <button className="btn-danger btn-sm" onClick={() => deleteRsvp(rsvp.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}