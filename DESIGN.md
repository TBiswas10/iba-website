# Illawarra Bengali Association Design System

Status: Active
Last updated: 2026-04-14
Owner: Product + Design
Last modified: 2026-04-14 — Added hero proof line, mobile refinements, nav hover polish

## 1) Brand Intent

This product should feel credible, warm, and community-led.

Primary emotional goals:
- Trust first
- Belonging second
- Celebration as accent, not noise

Audience intent:
- A first-time visitor should understand who this site serves in under 10 seconds
- A returning visitor should quickly move to Events and RSVP
- Volunteers should see clear ways to help without hunting

## 2) Visual Direction

Core direction: Trust-first editorial with selective festival accents.

Design principles:
- Prefer clarity over novelty
- Use celebration colors as highlights, not full-page floods
- Keep one primary action per section
- Keep motion subtle and purposeful

## 3) Foundations

### 3.1 Color Tokens

Defined in [src/app/globals.css](src/app/globals.css):
- --paper: #f8f3e8
- --ink: #101010
- --sunset: #ff6a3d
- --teal: #0d7f78
- --gold: #f9a826
- --deep: #152833

Usage rules:
- Primary text on light surfaces uses --ink
- Primary action uses sunset to gold gradient
- Brand authority and navigation active states use deep to teal gradient
- Background remains paper-led with low-contrast atmospheric gradients

### 3.2 Typography

Defined in [src/app/layout.tsx](src/app/layout.tsx):
- Heading font: Outfit (--font-heading)
- Body font: IBM Plex Sans (--font-body)
- Bengali script: Noto Sans Bengali (--font-bn)

Type hierarchy:
- H1: high contrast, short line length, maximum 2 lines on desktop when possible
- Section titles: compact and scannable
- Supporting copy: readable line length, calm rhythm, no dense paragraphs

### 3.3 Spacing and Radius

General spacing rhythm:
- Tight: 0.35rem to 0.75rem
- Standard: 1rem to 1.25rem
- Section: 2rem+

Radius language:
- Interactive pills and nav: fully rounded
- Cards: 16px to 22px
- Hero container: 28px

## 4) Layout System

### 4.1 Global Shell

Implemented in [src/components/site-header.tsx](src/components/site-header.tsx), [src/app/layout.tsx](src/app/layout.tsx), and [src/app/globals.css](src/app/globals.css).

Rules:
- Header is sticky and translucent
- Main content uses one centered container
- Footer remains lightweight and informational

### 4.2 Landing Structure

Implemented in [src/components/landing-page.tsx](src/components/landing-page.tsx).

Required order:
1. Split hero (story + event proof)
2. Trust strip with quantitative proof
3. Mission and operations
4. Audience blocks
5. Events callout
6. Volunteer call to action

### 4.3 Events and RSVP Relationship

Implemented in [src/app/events/page.tsx](src/app/events/page.tsx) and [src/app/events/rsvp/page.tsx](src/app/events/rsvp/page.tsx).

Rules:
- Homepage links to RSVP but does not explain process details
- Events page frames RSVP as the next action
- RSVP page handles process-level detail and field requirements

## 5) Components and States

### 5.1 Buttons

Classes in [src/app/globals.css](src/app/globals.css):
- .btn-primary: main conversion action
- .btn-ghost: secondary, low-pressure action
- .btn-accent: branded supporting action
- .btn-danger: destructive admin action

Rules:
- Use one primary CTA per section
- Avoid three equal-weight CTAs in the same visual group

### 5.2 Cards and Panels

Classes:
- .glass-panel
- .info-card
- .feature-card
- .hero-card

Rules:
- Keep contrast clear between informational cards and utility/admin surfaces
- Use blur effects sparingly to avoid muddy text contrast

### 5.3 Navigation

Classes:
- .nav-link
- .nav-link.active
- .nav-cta

Rules:
- Keep nav labels short
- Reserve nav-cta for RSVP only

## 6) Motion Guidelines

Motion should reinforce hierarchy, not decorate.

Allowed:
- Small hover lift on buttons
- Gentle section reveal rhythm
- Subtle transitions under 200ms for controls

Avoid:
- Continuous looping animations
- Large parallax effects
- Multiple competing animated elements above the fold

## 7) Content Rules

Homepage content:
- Explain identity, proof, and next step
- No operational RSVP copy (field logic, confirmation mechanics)
- Keep language trust-led and community-specific

Events page content:
- Keep invitation tone
- Show immediate RSVP path

RSVP page content:
- Keep process guidance here only
- Keep form labels clear and practical

## 8) Accessibility Baseline

Minimum requirements:
- Maintain clear text/background contrast on all gradient surfaces
- Preserve visible focus states for keyboard users
- Do not communicate critical meaning by color only
- Keep touch target size comfortable on mobile

## 9) Implementation Guardrails

When updating UI:
- Preserve token usage in [src/app/globals.css](src/app/globals.css)
- Keep layout composition in [src/components/landing-page.tsx](src/components/landing-page.tsx) trust-first
- Keep RSVP process detail out of homepage sections
- Keep bilingual support intact through existing locale and copy flow

## 10) Immediate Optimization Backlog

Priority 1:
- Reduce hero CTA set to two actions maximum
- Add one concise proof line directly under hero title
- Tighten mobile text density in hero and events intro

Priority 2:
- Increase visual separation between story blocks and admin/utility tables
- Add consistent section reveal rhythm across landing modules

Priority 3:
- Replace photo placeholders with real event imagery and captions

## 11) Success Metrics

Design outcomes are successful when:
- Visitors identify purpose and audience in under 10 seconds
- Events page receives clear click-through from homepage primary CTA
- RSVP starts increase without adding process clutter to homepage
- Mobile users complete the above-the-fold decision without excessive scroll
