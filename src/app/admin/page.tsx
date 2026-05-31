"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/supabase-auth-context";
import { AccessDenied } from "@/components/access-denied";

type Stats = { events: number; memberships: number; gallery: number; rsvps: number };
type RecentMember = { id: number; name: string; email: string; createdAt: string; memberships: { status: string }[] };
type UpcomingEvent = { id: number; title: string; start: string; location: string };

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<RecentMember[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetch("/api/stats").then(r => r.json()).then(d => { if (d.ok) setStats(d.data); });
    fetch("/api/admin/memberships").then(r => r.json()).then(d => {
      if (d.ok) setMembers((d.data || []).slice(0, 5));
    });
    fetch("/api/admin/events").then(r => r.json()).then(d => {
      if (d.ok) {
        const now = Date.now();
        setEvents((d.data || []).filter((e: UpcomingEvent) => new Date(e.start).getTime() > now).slice(0, 4));
      }
    });
  }, [user]);

  if (authLoading) return (
    <div>
      <div className="admin-page-header">
        <div className="skeleton skeleton-heading" style={{ width: 200 }} />
        <div className="skeleton skeleton-line" style={{ width: 140, marginTop: 6 }} />
      </div>
      <div className="admin-stat-strip">
        {[1,2,3,4].map(i => <div key={i} style={{ height: 100, borderRadius: 16, background: "white" }} />)}
      </div>
    </div>
  );

  if (!user || user.role !== "ADMIN") return <AccessDenied />;

  const statCards = [
    {
      label: "Active Members",
      value: stats?.memberships ?? "—",
      colorClass: "clay",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      href: "/admin/memberships",
    },
    {
      label: "Events",
      value: stats?.events ?? "—",
      colorClass: "teal",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
      href: "/admin/events",
    },
    {
      label: "RSVPs",
      value: stats?.rsvps ?? "—",
      colorClass: "green",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
      href: "/admin/rsvps",
    },
    {
      label: "Gallery Items",
      value: stats?.gallery ?? "—",
      colorClass: "gold",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
      href: "/admin/gallery",
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back, {user.name?.split(" ")[0] || "Admin"}</p>
      </div>

      {/* Stat strip */}
      <div className="admin-stat-strip">
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className="admin-stat-card" style={{ textDecoration: "none" }}>
            <div className="admin-stat-card-top">
              <div className={`admin-stat-icon ${s.colorClass}`}>{s.icon}</div>
            </div>
            <div className="admin-stat-number">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Panels row */}
      <div className="admin-panels-row">
        {/* Recent members */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Recent Members</h2>
            <Link href="/admin/memberships" className="admin-panel-link">View all →</Link>
          </div>
          {members.length === 0 ? (
            <p style={{ padding: "1.25rem", fontSize: "0.875rem", color: "rgba(16,16,16,0.4)" }}>No members yet.</p>
          ) : (
            <div className="admin-mini-table">
              {members.map(m => {
                const status = m.memberships?.[0]?.status || "PENDING";
                return (
                  <div key={m.id} className="admin-mini-row">
                    <div>
                      <div className="admin-mini-name">{m.name}</div>
                      <div className="admin-mini-email">{m.email}</div>
                    </div>
                    <span className={`admin-mini-badge ${status === "ACTIVE" ? "active" : "pending"}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming events */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">Upcoming Events</h2>
            <Link href="/admin/events" className="admin-panel-link">Manage →</Link>
          </div>
          {events.length === 0 ? (
            <p style={{ padding: "1.25rem", fontSize: "0.875rem", color: "rgba(16,16,16,0.4)" }}>No upcoming events.</p>
          ) : (
            <div>
              {events.map(e => {
                const d = new Date(e.start);
                const day = d.toLocaleDateString("en-AU", { day: "numeric", timeZone: "Australia/Sydney" });
                const mon = d.toLocaleDateString("en-AU", { month: "short", timeZone: "Australia/Sydney" });
                return (
                  <div key={e.id} className="admin-mini-event">
                    <div className="admin-mini-datebox">
                      <span className="admin-mini-datebox-day">{day}</span>
                      <span className="admin-mini-datebox-mon">{mon}</span>
                    </div>
                    <div>
                      <div className="admin-mini-event-title">{e.title}</div>
                      {e.location && <div className="admin-mini-event-loc">{e.location}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(29,35,59,0.07)", padding: "1rem 1.25rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(16,16,16,0.4)", marginBottom: "0.75rem" }}>Quick Actions</p>
        <div className="admin-quick-actions">
          <Link href="/admin/events" className="admin-quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Event
          </Link>
          <Link href="/admin/email" className="admin-quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
            Email Members
          </Link>
          <Link href="/admin/resources" className="admin-quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Resource
          </Link>
          <Link href="/admin/memberships" className="admin-quick-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Review Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
