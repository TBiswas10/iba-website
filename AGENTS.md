<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# IBA Website

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript (alias: `tsc --noEmit`)
- `npm run test` - Jest tests

## Prerequisites

**Always run after modifying Prisma schema:**
```
npx prisma generate
```
(Also runs automatically via `postinstall` after `npm install`)

## Architecture

- **DB**: PostgreSQL via Supabase + Prisma ORM
- **Auth**: Firebase + NextAuth (Google OAuth)
- **Payments**: Stripe
- **i18n**: next-intl (EN/BN)

**Key paths:**
- `prisma/schema.prisma` - Database models
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/role.ts` - Admin role checks (`requireAdmin`)
- `src/app/api/*` - API routes (auth-protected where needed)

## Quirks

- Event slugs are `@unique` in Prisma - handle duplicate slug errors
- Admin routes check `user.role === "ADMIN"` via `requireAdmin`
- Prisma dates return as JS Date objects (not ISO strings)
- Use `.toISOString()` when passing dates to form inputs or calendar APIs