"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";

import { useCopy } from "@/components/language-provider";

const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const StarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FamilyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const StudentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const HandIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const MusicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const GiftIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

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

function AnimatedStatWithIcon({ value, label, trigger, index, icon }: { value: string; label: string; trigger: boolean; index: number; icon: React.ReactNode }) {
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
      <motion.div className="stat-icon" animate={trigger && hasNumericValue ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}>
        {icon}
      </motion.div>
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
          <div className="hero-photo-grid" aria-label="Event photos">
            <div className="photo-tile photo-tile-v1">
              <span>Photo placeholder 1</span>
            </div>
            <div className="photo-tile photo-tile-h1">
              <span>Photo placeholder 2</span>
            </div>
            <div className="photo-tile photo-tile-v2">
              <span>Photo placeholder 3</span>
            </div>
            <div className="photo-tile photo-tile-h2">
              <span>Photo placeholder 4</span>
            </div>
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
        {[
          { icon: <StarIcon />, stat: copy.home.stats[0] },
          { icon: <PeopleIcon />, stat: copy.home.stats[1] },
          { icon: <CalendarIcon />, stat: copy.home.stats[2] },
          { icon: <FamilyIcon />, stat: copy.home.stats[3] },
          { icon: <HandIcon />, stat: copy.home.stats[4] },
        ].map(({ icon, stat }, index) => (
          <AnimatedStatWithIcon
            key={stat.label}
            value={stat.value}
            label={stat.label}
            trigger={isStatsInView}
            index={index}
            icon={icon}
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
            {[
              { icon: <GiftIcon />, feature: copy.home.howWeDoIt.features[0] },
              { icon: <HeartIcon />, feature: copy.home.howWeDoIt.features[1] },
              { icon: <CalendarIcon />, feature: copy.home.howWeDoIt.features[2] },
              { icon: <MusicIcon />, feature: copy.home.howWeDoIt.features[3] },
            ].map(({ icon, feature }) => (
              <motion.article key={feature.title} variants={cardVariant} className="feature-item">
                <div className="feature-icon">{icon}</div>
                <div>
                  <h4>{feature.title}</h4>
                  <p>{feature.body}</p>
                </div>
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
          {[
            { icon: <FamilyIcon />, item: copy.home.audience.items[0] },
            { icon: <StudentIcon />, item: copy.home.audience.items[1] },
            { icon: <GlobeIcon />, item: copy.home.audience.items[2] },
            { icon: <HandIcon />, item: copy.home.audience.items[3] },
          ].map(({ icon, item }) => (
            <motion.article key={item.title} className="feature-card audience-card" variants={cardVariant}>
              <div className="feature-icon">{icon}</div>
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
        </div>
      </motion.section>
    </div>
  );
}