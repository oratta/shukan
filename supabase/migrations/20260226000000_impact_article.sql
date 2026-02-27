-- Add impact_article_id column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS impact_article_id TEXT;
