# Illawarra Bengali Association Website Roadmap

Date: 2026-04-14
Canonical App: workspace root app
Architecture Choice: Option A (Next.js full-stack with App Router APIs)
News Scope: Deferred for now

## 1. Product Purpose

Build a reliable, modern community website for the Illawarra Bengali Association that helps people:
- Discover upcoming events and community activities
- Join and manage membership
- Make donations securely
- Access key resources and contact information
- Browse community media and social links

The website should be practical, easy to maintain, and investor/committee-grade in clarity, reliability, and governance.

## 2. Product Goals

- Establish a trusted digital home for members and visitors
- Increase event participation and membership conversion
- Enable secure and transparent online donations
- Reduce manual admin effort through dashboard workflows
- Support multilingual communication (English and Bengali)

## 3. Scope Decisions (Locked)

- Use root app only (single source of truth)
- Keep Next.js full-stack architecture (no separate Express service)
- Defer News/Announcements implementation to a later release window

## 4. Target Users

- Visitors: discover association mission, events, and contact channels
- Members: authenticate, manage profile, see membership status
- Admins/Committee: manage events, gallery, resources, members, and donation records

## 5. Information Architecture (Pages and Surfaces)

Public:
- Home
- About
- Events
- Gallery
- Membership
- Donations
- Resources
- Contact

Authenticated:
- Member Dashboard (profile, membership status, renewal state)

Admin:
- Admin Dashboard
- Event Management
- Membership Management
- Gallery Management
- Resource Management
- Donation Monitoring

Global:
- Header with language switcher and navigation
- Footer with social media links and legal/contact snippets

## 6. Technical Architecture

Frontend and Backend:
- Next.js (App Router) with TypeScript
- Tailwind CSS for styling
- Route Handlers under app/api for backend endpoints

Data:
- PostgreSQL via Supabase
- Prisma ORM for schema and data access

Auth and Roles:
- NextAuth.js
- Roles: visitor, member, admin

Payments:
- Stripe preferred (primary)
- Optional PayPal fallback in later phase if required

Localization:
- next-i18next
- Locales: en, bn

Storage:
- Cloudinary or S3-compatible object storage for gallery uploads

Observability and Ops:
- Vercel deployment
- Basic logging, error boundaries, and webhook observability

## 7. Core Feature Roadmap

## Phase 0: Stabilization and Foundation (Week 1)

Objectives:
- Make the current app production-safe before adding features

Deliverables:
- Resolve build blocker by adding runtime Prisma client dependency
- Create shared Prisma singleton utility to avoid connection churn in dev/hot reload
- Normalize API response and error format
- Confirm root app is canonical; mark nested app as archived/ignored in team docs
- Add environment variable validation strategy
- Set baseline CI checks (lint, typecheck, build)

Exit Criteria:
- npm run lint passes
- npm run build passes
- API routes function against Supabase Postgres

## Phase 1: Public MVP Experience (Weeks 2-4)

Objectives:
- Launch a polished public site with essential community workflows

Deliverables:
- Branded Home page and About section
- Events feature complete:
  - Calendar/list UI
  - Event detail view
  - Admin event create/edit/delete UI
  - API: GET, POST, PUT, DELETE
- Contact page and form submission endpoint
- Social links and clean footer/header navigation
- Resources hub (public listing)

Exit Criteria:
- Visitor can browse events/resources and submit contact form
- Admin can fully manage events
- Mobile and desktop layouts are usable and consistent

## Phase 2: Membership and Authentication (Weeks 5-6)

Objectives:
- Enable secure identity and member lifecycle basics

Deliverables:
- NextAuth integration (email and at least one social provider)
- User profile and membership status page
- Membership data model:
  - Tier
  - Start date
  - Expiry date
  - Status (active, expired, pending)
- Role-based route protection and API authorization
- Admin member overview and status update actions

Exit Criteria:
- Login/logout works reliably
- Member and admin access controls enforced
- Membership status visible and manageable

## Phase 3: Donations and Gallery (Weeks 7-9)

Objectives:
- Enable fundraising and visual community storytelling

Deliverables:
- Stripe checkout/payment intent flow
- Secure webhook endpoint and donation record persistence
- Donation confirmation UX and basic receipts/logging
- Gallery upload pipeline to cloud storage
- Gallery browsing UI with responsive layout
- Admin media management actions

Exit Criteria:
- End-to-end donation flow validated in test mode
- Uploaded media displays correctly and can be managed by admins

## Phase 4: Localization, Accessibility, and Quality (Weeks 10-11)

Objectives:
- Improve inclusivity, quality, and launch readiness

Deliverables:
- next-i18next setup with English and Bengali translation files
- Language switcher integrated across key routes
- Accessibility review and fixes (keyboard/focus/labels/contrast)
- Test suite setup:
  - Unit tests (core components and business logic)
  - API integration tests (events, membership, donations)
- Performance pass for key public pages

Exit Criteria:
- Language switching works across primary pages
- Accessibility and critical test coverage meet team threshold

## Phase 5: Post-Launch Expansion (Deferred Items)

Deferred now:
- News and Announcements module

Planned later scope:
- News model and API
- Admin news publishing workflow
- Public news listing and article pages
- Optional CMS integration decision (if committee needs editorial workflows)

## 8. Data Model Expansion Plan

Existing:
- User
- Event

Planned additions:
- Membership
- Donation
- GalleryItem
- Resource
- ContactSubmission
- AuditLog (optional but recommended for admin actions)

## 9. Security and Compliance Baseline

- Use server-side role checks for every write endpoint
- Validate request payloads with schema validation
- Store secrets in environment variables only
- Verify Stripe webhook signatures
- Apply CSRF/session best practices via NextAuth configuration
- Use least-privilege database and storage credentials

## 10. Definition of Done (Feature-Level)

A feature is done when:
- UX flow works on desktop and mobile
- API paths include error handling and validation
- Auth and authorization are enforced where needed
- Tests are added for critical paths
- Lint, typecheck, and build pass
- Basic documentation is updated

## 11. Success Metrics

Product metrics:
- Event page engagement and RSVP/contact conversion
- Membership signup and renewal rate
- Donation completion rate and failure rate
- Contact response turnaround

Engineering metrics:
- Build success rate
- Deployment frequency
- Mean time to fix production defects
- Lighthouse and accessibility trend

## 12. Delivery Governance

Cadence:
- Weekly milestone check-ins
- End-of-phase demo with acceptance checklist

Risk controls:
- Keep scope locked per phase
- Prioritize production stability over feature breadth
- Use staging validation before each release

## 13. Immediate Next Execution Plan (Actionable)

1. Complete Phase 0 stabilization tasks first
2. Finish Events feature end-to-end (UI + PUT/DELETE)
3. Build public pages (About, Contact, Resources, Membership CTA)
4. Implement authentication and membership workflow
5. Add donations and gallery pipeline
6. Add i18n, testing, accessibility, and deployment polish

---

This roadmap is the baseline execution document for the root app and will be updated at each phase gate.