# Habit Tracker

Minimal habit tracking app: create habits, store in Supabase, and mark them complete for today. No auth (single-user).

## Requirements

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Environment variables

Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get both from Supabase: **Project Settings → API** (Project URL and anon/public key).

## Supabase table setup

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste and run the contents of `supabase/schema.sql`.

That creates:

- **`categories`** – `id`, `name` (unique), `created_at`. User-defined categories for grouping habits.
- **`habits`** – `id`, `name`, `category` (text, matches a category name), `frequency_per_week`, `selected_days` (text[]), `recurrence` (jsonb), `xp_reward` (default 20), `created_at`
- **`habit_completions`** – `id`, `habit_id` (FK to habits), `completion_date`, with a unique constraint on `(habit_id, completion_date)` so you can’t log the same habit twice on the same day.

RLS is enabled with permissive policies so the app can read/write without auth.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000); the app redirects to `/dashboard`.

## Deploy on Vercel

1. Push the repo to GitHub (or connect your repo in Vercel).
2. In Vercel, create a new project from that repo.
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

## What’s in this step

- **Dashboard** (`/dashboard`): list habits, add habit form, “Complete today” per habit.
- **Habit creation**: name, category (user-defined; add categories first, then pick one per habit), repeat/recurrence, “Complete today” per habit.
- **Completion**: one completion per habit per day; duplicate prevented in app and by DB unique constraint.

No XP or AI rival in this step.
