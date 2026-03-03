-- Create habit_evidences junction table (many-to-many: habits <-> evidence articles)
CREATE TABLE IF NOT EXISTS habit_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 100 CHECK (weight BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, article_id)
);

-- RLS: users can only access evidences for their own habits
ALTER TABLE habit_evidences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit evidences"
  ON habit_evidences FOR SELECT
  USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own habit evidences"
  ON habit_evidences FOR INSERT
  WITH CHECK (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own habit evidences"
  ON habit_evidences FOR UPDATE
  USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own habit evidences"
  ON habit_evidences FOR DELETE
  USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

-- Migrate existing impact_article_id data to habit_evidences
INSERT INTO habit_evidences (habit_id, article_id, weight)
SELECT id, impact_article_id, 100
FROM habits
WHERE impact_article_id IS NOT NULL
ON CONFLICT DO NOTHING;
