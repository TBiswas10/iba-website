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

import { useFirebaseAuth } from "@/components/firebase-auth-context";

type User = {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string | null;
} | null;

export function SiteHeader() {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user: firebaseUser } = useFirebaseAuth();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (firebaseUser) {
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: firebaseUser.role,
      });
    } else {
      setUser(null);
    }
  }, [firebaseUser]);

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
      <div className="shell-row">
        <div className="brand-section">
          <Link href="/" className="brand-mark">
            <Image
              src="/logo.png"
              alt={tCommon("brand")}
              width={36}
              height={36}
              className="brand-logo"
            />
            <span className="brand-name">Illawarra Bengali Association</span>
            <span className="brand-name-mobile">IBA</span>
          </Link>
        </div>

        <nav className={`nav-container ${isOpen ? "open" : ""}`} aria-label="Primary">
          <div className="nav-grid">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "nav-link active" : "nav-link"}
              >
                {tNav(item.key)}
              </Link>
            ))}
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="nav-link">
                Admin
              </Link>
            )}
            <Link href="/events/rsvp" className={`nav-link nav-cta ${pathname.startsWith("/events/rsvp") ? "active" : ""}`}>
              {tCommon("rsvp")}
            </Link>
          </div>
        </nav>

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
    </header>
  );
}
