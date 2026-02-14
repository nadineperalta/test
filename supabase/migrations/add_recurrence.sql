-- Add recurrence config (JSONB). Keeps frequency_per_week and selected_days for backward compatibility.
alter table public.habits
  add column if not exists recurrence jsonb null;
