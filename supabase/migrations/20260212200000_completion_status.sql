-- Add status column to habit_completions
ALTER TABLE public.habit_completions
  ADD COLUMN status text NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed'));
