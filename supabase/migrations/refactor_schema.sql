-- Refactor schema: add new columns to categories, habits, habit_completions
-- All existing columns are preserved (gamification layer coming later)

-- ─── Categories ─────────────────────────────────────────────────
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;

-- Insert default "General" system category (idempotent)
INSERT INTO public.categories (name, is_system)
VALUES ('General', true)
ON CONFLICT (name) DO UPDATE SET is_system = true;

-- ─── Habits ─────────────────────────────────────────────────────
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS time_of_day TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Backfill category_id from existing category text column
UPDATE public.habits h
SET category_id = c.id
FROM public.categories c
WHERE h.category = c.name
  AND h.category_id IS NULL;

-- Orphaned habits (category text doesn't match any category) → General
UPDATE public.habits
SET category_id = (SELECT id FROM public.categories WHERE name = 'General' LIMIT 1)
WHERE category_id IS NULL;

-- Now make category_id NOT NULL
ALTER TABLE public.habits
  ALTER COLUMN category_id SET NOT NULL;

-- ─── Habit Completions ──────────────────────────────────────────
ALTER TABLE public.habit_completions
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Backfill completed_at from completion_date (set to noon on that date)
UPDATE public.habit_completions
SET completed_at = (completion_date::timestamp + interval '12 hours')
WHERE completed_at IS NULL;

-- Trigger: auto-set completion_date from completed_at on insert/update
CREATE OR REPLACE FUNCTION set_completion_date_from_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL THEN
    NEW.completion_date := NEW.completed_at::date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_completion_date ON public.habit_completions;
CREATE TRIGGER trg_set_completion_date
  BEFORE INSERT OR UPDATE ON public.habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION set_completion_date_from_completed_at();
