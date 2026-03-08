# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` — Start Next.js dev server on port 3000
- `npm run build` — Production build
- `npm run lint` — ESLint with Next.js rules
- No test framework is configured

## Architecture

This is a **Next.js 14 App Router** habit tracking app backed by **Supabase** (PostgreSQL). Single-user, no authentication — Supabase RLS policies are permissive.

### Stack

- Next.js 14 / React 18 / TypeScript (strict mode)
- Supabase for database (client created via `src/lib/supabase.ts`)
- Tailwind CSS for styling
- Path alias: `@/*` maps to `src/*`

### Key Patterns

- **Server components** fetch data (e.g., `src/app/dashboard/page.tsx` is `force-dynamic`)
- **Server actions** in `src/app/dashboard/actions.ts` handle mutations (createHabit, createCategory, completeHabitToday), then call `revalidatePath("/dashboard")`
- **Client components** (`"use client"`) handle forms and interactivity
- No state management library — data flows via props from server components

### Database Schema (3 tables)

- **categories** — user-defined categories (`name` is unique)
- **habits** — name, category (text), recurrence (jsonb), xp_reward, frequency_per_week, selected_days
- **habit_completions** — tracks daily completions with unique constraint on `(habit_id, completion_date)`

Schema defined in `supabase/schema.sql`, migrations in `supabase/migrations/`.

### Recurrence System

`src/types/recurrence.ts` defines a discriminated union type `Recurrence` with variants: daily, weekdays, weekends, weekly, biweekly, monthly, yearly. Days use JS convention (Sunday=0, Saturday=6). Key helpers: `formatRecurrence()` and `isDueOn()`.

### Route Structure

- `/` — redirects to `/dashboard`
- `/dashboard` — main page: habit list, add habit form, category management

### Environment Variables

Configured in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
