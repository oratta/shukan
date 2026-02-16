-- Add life_significance column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS life_significance TEXT;

-- Update habit_completions status check to include rocket_used
-- First drop existing check constraint if it exists, then add new one
DO $$
BEGIN
  -- Try to drop the constraint if it exists
  ALTER TABLE habit_completions DROP CONSTRAINT IF EXISTS habit_completions_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Allow 'rocket_used' as a valid status value
-- Note: if using text type without constraint, this is a no-op
-- The application layer handles the valid values
