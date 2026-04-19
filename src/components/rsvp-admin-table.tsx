"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

type RsvpRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  kidsCount?: number | null;
  kidsAges?: string | null;
  confirmationEmailSentAt?: string | null;
  confirmationEmailError?: string | null;
  createdAt: string;
  event: {
    id: number;
    title: string;
    start: string;
  };
};

function csvEscape(value: string | number | null | undefined) {
  const next = value ?? "";
  return `"${String(next).replaceAll('"', '""')}"`;
}

export function RsvpAdminTable() {
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const loadRows = async () => {
    setError(null);
    const response = await fetch("/api/rsvps", { cache: "no-store" });
    const json = await response.json();

    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Failed to load RSVPs");
      return;
    }

    setRows(json.data as RsvpRow[]);
  };

  useEffect(() => {
    startTransition(() => {
      loadRows();
    });
  }, []);

  const eventOptions = useMemo(() => {
    const seen = new Map<number, string>();
    rows.forEach((row) => {
      if (!seen.has(row.event.id)) {
        seen.set(row.event.id, row.event.title);
      }
    });
    return Array.from(seen.entries());
  }, [rows]);

  const filteredRows = useMemo(() => {
    const lower = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !lower ||
        [row.name, row.email, row.phone, row.event.title]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(lower));

      const matchesEvent = eventFilter === "all" || String(row.event.id) === eventFilter;

      return matchesQuery && matchesEvent;
    });
  }, [eventFilter, query, rows]);

  const exportCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Event",
      "Adults",
      "Kids count",
      "Kids ages",
      "Email status",
      "Submitted at",
    ];

    const csv = [
      headers.map(csvEscape).join(","),
      ...filteredRows.map((row) =>
        [
          row.name,
          row.email,
          row.phone,
          row.event.title,
          row.attendees,
          row.kidsCount ?? "",
          row.kidsAges ?? "",
          row.confirmationEmailError ? "failed" : row.confirmationEmailSentAt ? "sent" : "pending",
          new Date(row.createdAt).toLocaleString(),
        ]
          .map(csvEscape)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "iba-rsvps.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id: number) => {
    const confirmed = window.confirm("Delete this RSVP? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/rsvps/${id}`, { method: "DELETE" });
    const json = await response.json();

    if (!response.ok || !json.ok) {
      setError(json?.error?.message || "Could not delete RSVP");
      return;
    }

    await loadRows();
  };

  return (
    <section className="glass-panel">
      <div className="section-head section-head-row">
        <div>
          <p className="eyebrow">RSVP management</p>
          <h2>Submissions</h2>
          <p>Search, filter, export, and remove RSVPs without touching raw database rows.</p>
        </div>
        <div className="button-row">
          <button className="btn-ghost" type="button" onClick={loadRows} disabled={isPending}>
            Refresh
          </button>
          <button className="btn-primary" type="button" onClick={exportCsv} disabled={filteredRows.length === 0}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, notes..." />
        </label>
        <label>
          Event
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
            <option value="all">All events</option>
            {eventOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Event</th>
              <th>Contact</th>
              <th>Guests</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.name}</strong>
                  <p>{new Date(row.createdAt).toLocaleString()}</p>
                </td>
                <td>
                  <strong>{row.event.title}</strong>
                  <p>{new Date(row.event.start).toLocaleDateString(undefined)}</p>
                </td>
                <td>
                  <p>{row.email}</p>
                  <p>{row.phone}</p>
                </td>
                <td>
                  <p>{row.attendees} adult{row.attendees !== 1 ? "s" : ""}{row.kidsCount && row.kidsCount > 0 ? ` + ${row.kidsCount} kid${row.kidsCount !== 1 ? "s" : ""}` : ""}</p>
                </td>
                <td>
                  {row.confirmationEmailError ? (
                    <p className="error-text">Failed: {row.confirmationEmailError}</p>
                  ) : row.confirmationEmailSentAt ? (
                    <p>Sent {new Date(row.confirmationEmailSentAt).toLocaleString()}</p>
                  ) : (
                    <p>Pending</p>
                  )}
                </td>
                <td>
                  <button className="btn-danger" type="button" onClick={() => remove(row.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8}>No RSVP records yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}