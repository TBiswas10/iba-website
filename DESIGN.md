# Illawarra Bengali Association Design System

Status: Active
Last updated: 2026-04-20
Owner: Product + Design

## 1) Brand Intent

This product should feel cultural, warm, and alive — not like a generic nonprofit.

Primary emotional goals:
- Cultural celebration first, organization second
- Belonging through shared heritage
- Trust through authenticity

## 2) Visual Direction

Core direction: Cultural magazine — Kinfolk meets a cultural publication.

Design principles:
- Warm, editorial typography hierarchy
- Intentional decoration (not minimal, not overwhelming)
- Creative layouts that break from box grids
- Celebration colors as punctuation, not floods

## 3) Foundations

### 3.1 Color Tokens

```css
--paper: #FAF6F0      /* warm off-white, aged paper feel */
--ink: #1A1A1A        /* soft black, not harsh */
--clay: #C45A3B       /* terracotta — the risk accent */
--jute: #D4B896       /* natural warmth */
--deep: #1E3A44       /* authority teal */
--surface: #FFFFFF
```

Usage rules:
- Primary backgrounds use --paper
- Primary text uses --ink
- Accent actions (primary CTAs) use --clay
- Authority sections (stats, footer) use --deep
- Supporting warmth uses --jute

### 3.2 Typography

- Display/Hero font: **Fraunces** (Google Fonts, serif, editorial character)
- Body font: **DM Sans** (Google Fonts, clean modern sans)
- Bengali script: **Noto Sans Bengali** (existing, works well)

Type hierarchy:
- H1: Fraunces, high contrast, max 2 lines on desktop
- H2-H3: Fraunces, balanced hierarchy
- Body: DM Sans, comfortable line length (max 65ch)
- Bengali: Noto Sans Bengali, consistent with English

### 3.3 Spacing and Radius

Spacing rhythm:
- Tight: 0.5rem to 0.75rem
- Standard: 1rem to 1.5rem
- Section: 3rem to 6rem
- Relaxed: 1.5 base unit

Radius language:
- Buttons/CTA: fully rounded (100px)
- Cards: 16px to 20px
- Hero containers: 24px to 28px

## 4) Layout System

### 4.1 Global Shell

Rules:
- Header: sticky, translucent with backdrop blur
- Main: centered container, max-width 1400px
- Footer: informational, authority styling

### 4.2 Landing Structure

Required order:
1. Split hero (story + cultural visual)
2. Stats strip (authority proof)
3. Mission (editorial layout, not boxes)
4. Events grid (creative, not 3-column default)
5. Volunteer CTA (warm close)

### 4.3 Events and RSVP

Rules:
- Events page shows RSVP as natural next action
- RSVP page handles process details
- Keep homepage celebration-focused

## 5) Components

### 5.1 Buttons

- .btn-primary: clay background, white text, rounded
- .btn-ghost: text only, dark ink
- .btn-accent: deep background, white text

### 5.2 Cards

- .event-card: paper background, subtle hover lift
- .info-card: minimal, text-focused
- .stat-card: authority styling

### 5.3 Navigation

- .nav-link: ink color, hover to clay
- .nav-cta: clay background, white text, rounded

## 6) Motion Guidelines

Motion reinforces hierarchy, not decorates.

Allowed:
- Subtle hover lifts (transform, 200ms)
- Section entrance (fade-up, staggered)
- Button press feedback

Avoid:
- Continuous looping
- Large parallax
- Multiple competing animations above fold

## 7) Content Rules

Homepage:
- Lead with cultural celebration, not organization details
- Clear CTAs but not aggressive
- Trust through warmth, not jargon

Events page:
- Celebration tone
- Show RSVP path prominently

## 8) Accessibility Baseline

- Text contrast: minimum 4.5:1 on all surfaces
- Focus states: visible
- Touch targets: minimum 44px
- Color not sole meaning carrier

## 9) Implementation Guardrails

When updating UI:
- Preserve CSS token usage
- Keep editorial layout approach
- Maintain celebration tone
- Support bilingual (EN + BN)

## 10) Design Decisions Log

### Decision: Terracotta accent over blue/gold
- Old sites use blues (trust) and golds (celebration)
- Terracotta (#C45A3B) feels warmer, more culturally rooted
- Risk: less "professional" appearance
- Mitigation: use sparingly as accent, not dominant

### Decision: Fraunces for display
- Most community sites use sans-serifs
- Serif brings editorial credibility
- Risk: Bengali script mismatch
- Mitigation: keep Bengali in Noto Sans Bengali separately

### Decision: Creative-editorial layout
- Breaks from 3-column card grids
- Asymmetric hero, floating badges
- Risk: shows if content is thin
- Mitigation: community has rich event content to support