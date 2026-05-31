"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/supabase-auth-context";

const TABS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/memberships",
    label: "Members",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/admin/rsvps",
    label: "RSVPs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/membership");
  }

  return (
    <nav className="admin-bottom-nav">
      {TABS.map(({ href, label, icon }) => {
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`admin-bottom-tab${isActive ? " active" : ""}`}>
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
      <button className="admin-bottom-tab" onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Log out</span>
      </button>
    </nav>
  );
}
