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
  volunteerInterest: string;
  dietaryNotes: string | null;
  donationIntent: string | null;
  additionalNotes: string | null;
  createdAt: string;
};

type User = {
  uid: string;
  email: string;
  role: string;
};

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
    await fetch(`/api/rsvps?id=${id}`, { method: "DELETE" });
    setRsvps(rsvps.filter(r => r.id !== id));
  }

  const totalAttendees = rsvps.reduce((sum, r) => sum + r.attendees, 0);
  const totalKids = rsvps.reduce((sum, r) => sum + (r.kidsCount || 0), 0);

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
        <h1>RSVPs</h1>
        <p>View RSVPs for events.</p>
        <a href="/admin" className="btn-ghost">← Back to Admin</a>
      </section>

      <section className="glass-panel">
        <label>
          Select Event
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">— Select an event —</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({new Date(event.start).toLocaleDateString("en-AU")})
              </option>
            ))}
          </select>
        </label>
      </section>

      {selectedEventId && (
        <section className="glass-panel">
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <div>
              <strong>Total RSVPs:</strong> {rsvps.length}
            </div>
            <div>
              <strong>Total Attendees:</strong> {totalAttendees}
            </div>
            <div>
              <strong>Total Kids:</strong> {totalKids}
            </div>
          </div>

          {rsvps.length === 0 ? (
            <p>No RSVPs for this event yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Attendees</th>
                  <th>Kids</th>
                  <th>Volunteer</th>
                  <th>Dietary</th>
                  <th>Donation</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map(rsvp => (
                  <tr key={rsvp.id}>
                    <td>{rsvp.name}</td>
                    <td>{rsvp.email}</td>
                    <td>{rsvp.phone || "—"}</td>
                    <td>{rsvp.attendees}</td>
                    <td>{rsvp.kidsCount ?? 0}</td>
                    <td>{rsvp.volunteerInterest || "—"}</td>
                    <td>{rsvp.dietaryNotes || "—"}</td>
                    <td>{rsvp.donationIntent || "—"}</td>
                    <td>{rsvp.additionalNotes || "—"}</td>
                    <td>
                      <button className="btn-danger" onClick={() => deleteRsvp(rsvp.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </section>
  );
}