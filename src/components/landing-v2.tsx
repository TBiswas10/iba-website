"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCopy } from "@/components/language-provider";
import "@/app/landing-v2.css";

type HighlightEvent = {
  id: number;
  title: string;
  start: string;
  location: string | null;
} | null;

type LandingV2Props = {
  nextEvent: HighlightEvent;
};

export function LandingV2({ nextEvent }: LandingV2Props) {
  const copy = useCopy();

  return (
    <div className="v2-root">
      {/* Hero */}
      <section className="v2-section v2-hero">
        <motion.div 
          className="v2-hero-content"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow">{copy.home.hero.eyebrow}</p>
          <h1>{copy.home.hero.title}</h1>
          <p className="v2-hero-subtitle">{copy.home.hero.subtitle}</p>
          <div className="v2-btn-row">
            <Link className="v2-btn-primary" href="/events">
              {copy.home.hero.primaryCta}
            </Link>
            <Link className="v2-btn-ghost" href="/about">
              {copy.home.hero.secondaryCta}
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="v2-hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span>Community Image</span>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="v2-section v2-stats-strip">
        {copy.home.stats.map((stat, i) => (
          <motion.div 
            key={i} 
            className="v2-stat-card"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Mission */}
      <section className="v2-section">
        <div className="v2-card v2-grid-2">
          <div>
            <p className="eyebrow">{copy.home.mission.eyebrow}</p>
            <h2>{copy.home.mission.title}</h2>
            <p style={{ color: "rgba(16,16,16,0.7)", lineHeight: "1.7" }}>{copy.home.mission.body}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {copy.home.howWeDoIt.features.map((feature, i) => (
              <div key={i} className="v2-feature-item">
                <div className="v2-feature-icon">âœ“</div>
                <div className="v2-feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="v2-section">
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <p className="eyebrow">{copy.home.audience.eyebrow}</p>
          <h2>{copy.home.audience.title}</h2>
        </div>
        <div className="v2-audience-grid">
          {copy.home.audience.items.map((item, i) => (
            <div key={i} className="v2-audience-card">
              <h4>{item.title}</h4>
              <p style={{ fontSize: "0.9rem", color: "rgba(16,16,16,0.6)", margin: "0.5rem 0 0" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlight Event */}
      <section className="v2-section">
        <div className="v2-highlight">
          <p className="eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>{copy.home.events.highlight.label}</p>
          <h2>{nextEvent?.title || copy.home.events.highlight.title}</h2>
          <p>
            {nextEvent ? 
              new Date(nextEvent.start).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }) + 
              (nextEvent.location ? ` @ ${nextEvent.location}` : "")
              : copy.home.events.highlight.body
            }
          </p>
          <Link href={nextEvent ? `/events/rsvp?eventId=${nextEvent.id}` : "/events/rsvp"} className="v2-btn-primary" style={{ background: "white", color: "var(--berry)" }}>
            {copy.home.events.highlight.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
