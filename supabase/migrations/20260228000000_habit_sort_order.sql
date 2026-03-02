-- Add sort_order column to habits table
ALTER TABLE habits ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Set initial sort_order based on created_at order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS rn
  FROM habits
)
UPDATE habits SET sort_order = ordered.rn FROM ordered WHERE habits.id = ordered.id;
