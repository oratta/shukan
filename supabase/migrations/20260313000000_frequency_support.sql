-- Drop existing frequency CHECK constraint
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_check;

-- Migrate existing 'daily' to 'everyday' before adding new constraint
UPDATE habits SET frequency = 'everyday' WHERE frequency = 'daily';

-- Update frequency CHECK constraint with new values
ALTER TABLE habits ADD CONSTRAINT habits_frequency_check
  CHECK (frequency IN ('everyday', 'weekday', 'custom', 'weekly'));

-- Add weekly_target column
ALTER TABLE habits ADD COLUMN IF NOT EXISTS weekly_target integer DEFAULT 1;
