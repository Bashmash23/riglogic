@AGENTS.md

# RigLogic

**One-line:** Web-based gear list tool for UAE film/video productions with Smart-Match compatibility and PDF/share/email export.

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, dark mode default
- Clerk for auth (login required — user's explicit choice, overrides PRD)
- Prisma + Postgres on Railway
- Vercel deploy (free `riglogic.vercel.app` for day one)
- `@react-pdf/renderer` for PDF (M3), `nanoid` for share-link short IDs

## Ground rules
- Dark mode default. Desktop-optimized, mobile-usable.
- Placeholder data lives in `src/data/*.json` until the real UAE gear spreadsheet arrives.
- Every milestone ends with a working deploy + smoke test. No broken overnights.
- Priority if time runs short: **Export > Smart-Match > Kit builder > Dates > Cost estimates**.
- Brand accent: `#E87722` (muted cinema-orange), used sparingly.

## Conventions
- Server components by default; `"use client"` only where needed (form state, interactivity).
- All DB access through `src/lib/db.ts` singleton.
- Public routes listed in `proxy.ts` matcher. Share-link viewer (`/s/*`) must stay public.
- Disclaimer `"Indicative rates only. Confirm pricing with rental house."` appears near every cost total.

## What is NOT in scope
No rental inventory scraping, no in-app booking/payments, no crew marketplace (stub only), no multi-language, no team accounts, no native mobile (Expo was declined in favor of web).
