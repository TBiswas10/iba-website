"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "/", key: "home" },
  { href: "/events", key: "events" },
  { href: "/gallery", key: "gallery" },
  { href: "/resources", key: "resources" },
  { href: "/membership", key: "membership" },
  { href: "/donations", key: "donations" },
  { href: "/contact", key: "contact" },
  { href: "/about", key: "about" },
] as const;

import { useAuth } from "@/components/supabase-auth-context";

export function SiteHeader() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-row">
        <div className="header-top">
          <Link href="/" className="header-logo">
            <img
              src="/Illawarra-Bengali-Association-Logo.svg"
              alt={tCommon("brand")}
              className="header-logo-img"
            />
            <div className="header-logo-text">
              <span className="header-logo-name desktop-only">Illawarra Bengali Association (IBA) Inc.</span>
              <span className="header-logo-name mobile-only">IBA Inc.</span>
              <span className="header-logo-tagline">Community - Culture - Connection</span>
            </div>
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className={`hamburger ${isOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <nav className={`nav-container ${isOpen ? "open" : ""}`} aria-label="Primary">
          <div className="nav-row">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link has-underline ${isActive ? "active" : ""}`}
              >
                {tNav(item.key)}
              </Link>
              );
            })}
            {user?.role === "ADMIN" && (
              <Link href="/admin" className={`nav-link has-underline ${pathname.startsWith("/admin") ? "active" : ""}`}>
                Admin
              </Link>
            )}
            <Link href="/events/rsvp" className="nav-link nav-cta">
              {tCommon("rsvp")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
