"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";

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

const EMPTY_FORM = { title: "", slug: "", start: "", end: "", location: "", description: "", imageUrl: "" };

function formatForInput(d: string) {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const s = new Date(date.toLocaleString("en-AU", { timeZone: "Australia/Sydney" }));
    return `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}T${pad(s.getHours())}:${pad(s.getMinutes())}`;
  } catch { return d; }
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
}

export default function AdminEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") { setLoading(false); return; }
    fetchEvents();
  }, [user, authLoading]);

  async function fetchEvents() {
    const res = await fetch("/api/admin/events");
    const data = await res.json();
    if (data.ok) setEvents(data.data || []);
    setLoading(false);
  }

  function set(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      id: editingId,
      ...formData,
      slug: (formData.slug || formData.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    };
    const res = await fetch("/api/admin/events", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { cancelForm(); fetchEvents(); }
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      slug: event.slug || "",
      start: formatForInput(event.start),
      end: formatForInput(event.end),
      location: event.location || "",
      description: event.description || "",
      imageUrl: event.imageUrl || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setShowForm(false);
  }

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/admin/events/${id}/delete`, { method: "POST" });
    if (res.ok) fetchEvents();
  }

  if (authLoading || loading) return (
    <div>
      <div className="admin-page-header">
        <div className="skeleton skeleton-heading" style={{ width: 100 }} />
      </div>
      {[1, 2, 3].map(i => <div key={i} style={{ height: 72, marginBottom: 8, borderRadius: 12, background: "white" }} />)}
    </div>
  );

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="admin-page-title">Events</h1>
          <p className="admin-page-subtitle">{events.length} event{events.length !== 1 ? "s" : ""} total</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Event
          </button>
        )}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(29,35,59,0.07)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{editingId ? "Edit Event" : "New Event"}</h2>
            <button onClick={cancelForm} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(16,16,16,0.4)", fontSize: "1.25rem", lineHeight: 1 }}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-event-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">Title</label>
                <input className="admin-form-input" required placeholder="Event title" value={formData.title} onChange={e => set("title", e.target.value)} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">URL Slug</label>
                <input className="admin-form-input" placeholder="auto-generated from title" value={formData.slug} onChange={e => set("slug", e.target.value)} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Start</label>
                <div className="admin-datetime-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <input className="admin-form-input admin-datetime" required type="datetime-local" value={formData.start} onChange={e => set("start", e.target.value)} />
                </div>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">End</label>
                <div className="admin-datetime-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <input className="admin-form-input admin-datetime" required type="datetime-local" value={formData.end} onChange={e => set("end", e.target.value)} />
                </div>
              </div>
              <div className="admin-form-field admin-form-span2">
                <label className="admin-form-label">Location</label>
                <div className="admin-datetime-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <input className="admin-form-input admin-datetime" placeholder="Venue or address" value={formData.location} onChange={e => set("location", e.target.value)} />
                </div>
              </div>
              <div className="admin-form-field admin-form-span2">
                <label className="admin-form-label">Description</label>
                <textarea className="admin-form-input" rows={3} placeholder="Event description" value={formData.description} onChange={e => set("description", e.target.value)} style={{ resize: "vertical" }} />
              </div>
              <div className="admin-form-field admin-form-span2">
                <label className="admin-form-label">Image URL</label>
                <input className="admin-form-input" placeholder="https://..." value={formData.imageUrl} onChange={e => set("imageUrl", e.target.value)} />
                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "rgba(16,16,16,0.5)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} style={{ width: 14, height: 14 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload image
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("action", "upload-event-image");
                      const res = await fetch("/api/admin/events", { method: "POST", body: fd });
                      const d = await res.json();
                      if (d.ok && d.url) set("imageUrl", d.url);
                    }} />
                  </label>
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" style={{ display: "block", marginTop: "0.5rem", height: 80, borderRadius: 8, objectFit: "cover" }} />
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button className="btn-primary" type="submit" style={{ fontSize: "0.875rem" }}>
                {editingId ? "Update Event" : "Create Event"}
              </button>
              <button type="button" className="btn-ghost" onClick={cancelForm} style={{ fontSize: "0.875rem" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Events list */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(29,35,59,0.07)", overflow: "hidden" }}>
        {events.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "rgba(16,16,16,0.4)", fontSize: "0.875rem" }}>No events yet. Create your first one above.</p>
        ) : (
          <div>
            {events.map((event, i) => {
              const d = new Date(event.start);
              const day = d.toLocaleDateString("en-AU", { day: "numeric", timeZone: "Australia/Sydney" });
              const mon = d.toLocaleDateString("en-AU", { month: "short", timeZone: "Australia/Sydney" });
              return (
                <div key={event.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < events.length - 1 ? "1px solid rgba(29,35,59,0.05)" : "none" }}>
                  <div style={{ width: 48, height: 52, borderRadius: 10, background: "rgba(196,90,59,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--berry)", lineHeight: 1 }}>{day}</span>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "var(--berry)", opacity: 0.75 }}>{mon}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)", marginBottom: "0.2rem" }}>{event.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(16,16,16,0.45)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span>{fmtTime(event.start)} – {fmtTime(event.end)}</span>
                      {event.location && <span>· {event.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button className="admin-icon-btn edit" title="Edit" onClick={() => startEdit(event)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="admin-icon-btn danger" title="Delete" onClick={() => deleteEvent(event.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .admin-event-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .admin-form-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .admin-form-span2 { grid-column: span 2; }
        .admin-form-label { font-size: 0.8rem; font-weight: 600; color: rgba(16,16,16,0.6); }
        .admin-form-input { padding: 0.6rem 0.85rem; border: 1.5px solid rgba(29,35,59,0.12); border-radius: 10px; font-family: var(--font-body); font-size: 0.9rem; background: #fafafa; width: 100%; box-sizing: border-box; outline: none; transition: border-color 0.15s; color: var(--ink); }
        .admin-form-input:focus { border-color: var(--berry); background: white; }
        .admin-datetime-wrap { position: relative; display: flex; align-items: center; }
        .admin-datetime-wrap svg { position: absolute; left: 0.75rem; width: 15px; height: 15px; color: rgba(16,16,16,0.35); pointer-events: none; }
        .admin-datetime { padding-left: 2.25rem !important; }
        .admin-form-input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        @media (max-width: 600px) { .admin-event-form-grid { grid-template-columns: 1fr; } .admin-form-span2 { grid-column: span 1; } }
      `}</style>
    </div>
  );
}
