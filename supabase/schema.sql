-- Habit Tracker: tables for habits and completions (no auth)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  frequency_per_week integer not null,
  selected_days text[] null,
  xp_reward integer not null default 20,
  created_at timestamptz not null default now()
);

-- Completions table
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  completion_date date not null,
  unique(habit_id, completion_date)
);

-- Optional: allow anonymous read/write for single-user app (no RLS or use permissive policies)
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

create policy "Allow all on habits"
  on public.habits for all
  using (true)
  with check (true);

create policy "Allow all on habit_completions"
  on public.habit_completions for all
  using (true)
  with check (true);
