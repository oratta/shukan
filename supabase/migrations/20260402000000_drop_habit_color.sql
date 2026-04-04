-- Drop the color column from habits table
-- Color was previously used for per-habit theming but is no longer needed.
-- UI now uses a fixed brand palette for charts and bg-muted for icon backgrounds.

alter table habits drop column if exists color;
