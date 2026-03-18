-- Add note column to habit_completions
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS note TEXT;

-- Create daily_reflections table
CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  mood INT CHECK (mood >= 1 AND mood <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS policies for daily_reflections
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily reflections"
  ON daily_reflections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own daily reflections"
  ON daily_reflections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily reflections"
  ON daily_reflections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily reflections"
  ON daily_reflections FOR DELETE
  USING (user_id = auth.uid());
