<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

# Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# IBA Website

## Commands (exact order)

```
npm run typecheck   # tsc --noEmit (always run before build)
npm run lint        # next lint
npm run test        # jest --runInBand
npm run build       # production build
npm run dev         # dev server
```

**After modifying Prisma schema:** `npx prisma generate` (also runs via `postinstall`)

**Prisma client is generated at `src/generated/prisma/`** — gitignored, regenerated on `npm install`.

## Required env vars (build-time crash if missing)

`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — validated at import in `src/lib/env.ts`. Optional: Stripe keys, SMTP creds, `NEXT_PUBLIC_BASE_URL`.

## Architecture

- **DB**: PostgreSQL (Supabase) + Prisma ORM. Prisma singleton at `src/lib/prisma.ts` (cached on `globalThis` in dev).
- **Auth**: Supabase Auth (email/password). Three Supabase clients:
  - `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
  - `src/lib/supabase/server.ts` — server client (`createServerClient`, uses `next/headers` cookies; `setAll` wrapped in try/catch — middleware handles actual cookie writes)
  - `src/lib/supabase/admin.ts` — service role client (`getSupabaseAdmin()`, lazy singleton). Used only in `/api/signup`.
- **Middleware** (`src/middleware.ts`): Refreshes Supabase auth token on every request. Must call `await supabase.auth.getUser()` to trigger refresh.
- **Session**: `useAuth()` hook from `src/components/supabase-auth-context.tsx` provides `{ user, loading, signInWithEmail, logout }`. Admin routes check `user.role === "ADMIN"` and render `<AccessDenied />` for non-admin users.
- **Payments**: Stripe (checkout-based donations)
- **i18n**: next-intl (EN/BN), configured via `src/i18n/request.ts`
- **Styling**: Tailwind CSS v4 + CSS modules (`src/app/globals.css`)

## Key paths

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models (enums: `UserRole`, `MembershipStatus`) |
| `src/app/api/*` | API routes (auth-protected where needed) |
| `src/app/admin/*` | Admin pages (all client-side, use `useAuth()`) |
| `src/components/supabase-auth-context.tsx` | Auth provider + `useAuth()` hook |
| `src/lib/role.ts` | `requireAdmin()` — returns `fail("Auth required", 401)` or `null` |
| `src/lib/auth.ts` | `getCurrentUser()` — reads Supabase session + Prisma user |
| `src/lib/email.ts` | Nodemailer transport (Gmail SMTP) + RSVP confirmation + bulk email |
| `src/lib/dates.ts` | `parseSydneyDatetime()` — parses local datetime strings in Sydney timezone |
| `src/lib/env.ts` | Zod-validated env vars (crash on missing required) |
| `src/lib/api.ts` | `ok()` / `fail()` response helpers |
| `src/lib/validators.ts` | Zod schemas for all API inputs |
| `next.config.mjs` | next-intl plugin + image remote patterns (`https://**`) |
| `.env` | DB creds, SMTP, Stripe, Supabase keys (gitignored) |

## Quirks & gotchas

- **Event slugs** are `@unique` in Prisma — handle duplicate slug errors gracefully
- **Prisma dates** return JS Date objects (not ISO strings). Use `.toISOString()` for form inputs or calendar APIs
- **Middlewareruns on every request** via broad matcher — uses `@supabase/ssr` `createServerClient`. `getUser()` always called to refresh session
- **Admin pages block non-admin users** with `<AccessDenied />` (not redirect). All 5 admin pages check `!user || user.role !== "ADMIN"`
- **API routes use POST for data reads** (mixed convention — some GET, some POST). Check the route before assuming
- **Contact form SMTP** uses `process.env.SMTP_PASSWORD` (not `SMTP_PASS`)
- **Signup flow**: `/api/signup` creates Supabase Auth user via Admin API (`email_confirm: true`), creates `PENDING` membership. Client calls `signInWithEmail` after signup
- **Env validation**: Required vars (`DATABASE_URL`, Supabase keys) crash at module import time. Optional vars silently `undefined`
- **No membership payment** — membership panel shows registration form, not Stripe checkout
- **`/dashboard` does not exist** — redirects to `/membership`
- **Test command**: `npm run test` (jest with `--runInBand`). Uses `next/jest` with `jest-environment-jsdom`
- **Commit signature enforcement** is enabled in CI via `pre-commit` — commits that fail signature check may be rejected
