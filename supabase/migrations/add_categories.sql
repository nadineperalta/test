-- Add categories table for user-defined categories (run if you already have the main schema)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "Allow all on categories"
  on public.categories for all
  using (true)
  with check (true);
