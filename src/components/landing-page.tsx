"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView, Variants, useMotionValue, useTransform } from "framer-motion";

import { useCopy } from "@/components/language-provider";

type HighlightEvent = {
  id: number;
  title: string;
  start: string;
  location: string | null;
} | null;

function AnimatedStat({ value, label, trigger, index }: { value: string; label: string; trigger: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const numericValue = parseInt(value.replace(/\D/g, ""));
  const hasNumericValue = !isNaN(numericValue);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!hasNumericValue || !trigger) return;

    const finalValue = numericValue;
    const duration = 300;
    const steps = 20;
    const stepDuration = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current >= finalValue) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(String(current) + (value.includes("+") ? "+" : ""));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [hasNumericValue, trigger, numericValue, value, index]);

  return (
    <motion.article
      ref={ref}
      className="trust-stat"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={trigger ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <motion.h3
        animate={trigger && hasNumericValue ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
      >
        {displayValue}
      </motion.h3>
      <p>{label}</p>
    </motion.article>
  );
}

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const eventsCalloutVariant: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const volunteerVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function LandingPage() {
  const copy = useCopy();
  const [nextEvent, setNextEvent] = useState<HighlightEvent>(null);

  useEffect(() => {
    fetch("/api/events/next")
      .then((res) => res.json())
      .then((data) => setNextEvent(data.data))
      .catch(() => setNextEvent(null));
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div className="panel-stack landing-shell">
      <motion.section
        className="hero split-hero"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.div className="hero-copy" variants={fadeUpVariant}>
          <p className="eyebrow">{copy.home.hero.eyebrow}</p>
          <motion.h1 variants={fadeUpVariant}>{copy.home.hero.title}</motion.h1>
          <motion.p className="hero-subtitle" variants={fadeUpVariant}>
            {copy.home.hero.subtitle}
          </motion.p>
          <motion.div className="button-row" variants={fadeUpVariant}>
            <Link className="btn-primary" href="/events">
              {copy.home.hero.primaryCta}
            </Link>
            <Link className="btn-ghost" href="/about">
              {copy.home.hero.secondaryCta}
            </Link>
          </motion.div>
          <motion.div className="pill-row" variants={fadeUpVariant} aria-label="Community groups">
            <span>Hindu families</span>
            <span>Students</span>
            <span>Bengali + Indian families</span>
            <span>Members + volunteers</span>
          </motion.div>
        </motion.div>

        <motion.aside className="hero-aside glass-panel" variants={fadeUpVariant}>
          <div className="hero-card hero-photo-grid" aria-label="Event photo placeholders">
            {copy.home.events.photoPlaceholder.map((label, index) => (
              <motion.div
                key={label}
                className={`photo-tile photo-tile-${index + 1}`}
                variants={fadeUpVariant}
              >
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
          <div className="hero-card featured-card">
            <p className="eyebrow">{copy.home.events.highlight.label}</p>
            <h2>{nextEvent?.title || copy.home.events.highlight.title}</h2>
            <p>
              {nextEvent ? 
                new Date(nextEvent.start).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) +
                (nextEvent.location ? ` · ${nextEvent.location}` : "")
              : copy.home.events.highlight.body}
            </p>
            <Link className="btn-primary" href={nextEvent ? `/events/rsvp?eventId=${nextEvent.id}` : "/events/rsvp"}>
              {copy.home.events.highlight.cta}
            </Link>
          </div>
        </motion.aside>
      </motion.section>

      <motion.section
        ref={statsRef}
        className="trust-strip"
        initial="hidden"
        animate={isStatsInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        {copy.home.stats.map((stat, index) => (
          <AnimatedStat 
            key={stat.label} 
            value={stat.value} 
            label={stat.label}
            trigger={isStatsInView}
            index={index}
          />
        ))}
      </motion.section>

      <motion.section
        className="glass-panel content-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
      >
        <div className="section-head">
          <p className="eyebrow">{copy.home.mission.eyebrow}</p>
          <h2>{copy.home.mission.title}</h2>
          <p>{copy.home.mission.body}</p>
        </div>
        <motion.div
          className="info-card large-card"
          variants={staggerContainer}
        >
          <h3>{copy.home.howWeDoIt.title}</h3>
          <p>{copy.home.howWeDoIt.body}</p>
          <div className="feature-list">
            {copy.home.howWeDoIt.features.map((feature) => (
              <motion.article key={feature.title} variants={cardVariant}>
                <h4>{feature.title}</h4>
                <p>{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="glass-panel content-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
      >
        <div className="section-head">
          <p className="eyebrow">{copy.home.audience.eyebrow}</p>
          <h2>{copy.home.audience.title}</h2>
        </div>
        <motion.div
          className="feature-grid"
          variants={staggerContainer}
        >
          {copy.home.audience.items.map((item) => (
            <motion.article key={item.title} className="feature-card audience-card" variants={cardVariant}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="glass-panel content-grid events-callout"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={eventsCalloutVariant}
      >
        <div className="section-head">
          <p className="eyebrow">{copy.home.events.eyebrow}</p>
          <h2>{copy.home.events.title}</h2>
          <p>{copy.home.events.body}</p>
        </div>
        <div className="info-card event-highlight-card">
          <p className="eyebrow">{copy.home.events.highlight.label}</p>
          <h3>{nextEvent?.title || copy.home.events.highlight.title}</h3>
          <p>
            {nextEvent ?
              new Date(nextEvent.start).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) +
              (nextEvent.location ? ` · ${nextEvent.location}` : "")
            : copy.home.events.highlight.body}
          </p>
          <Link className="btn-ghost" href={nextEvent ? `/events/rsvp?eventId=${nextEvent.id}` : "/events/rsvp"} >
            {copy.home.events.highlight.cta}
          </Link>
        </div>
      </motion.section>

      <motion.section
        className="volunteer-banner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={volunteerVariant}
      >
        <div>
          <p className="eyebrow">Volunteers</p>
          <h2>{copy.home.volunteer.title}</h2>
          <p>{copy.home.volunteer.body}</p>
        </div>
        <div className="button-row">
          <Link className="btn-primary" href="/contact">
            {copy.home.volunteer.cta}
          </Link>
          <Link className="btn-ghost" href={nextEvent ? `/events/rsvp?eventId=${nextEvent.id}` : "/events/rsvp"}>
            {nextEvent ? `RSVP for ${nextEvent.title}` : copy.home.events.highlight.cta}
          </Link>
        </div>
      </motion.section>
    </div>
  );
}