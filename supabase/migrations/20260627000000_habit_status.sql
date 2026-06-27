-- ============================================
-- Migration: habits.status / habits.established_since
-- ============================================
-- オンボーディング v2「一生インパクト診断」で、習慣を
--   'active'      … これから積み上げる習慣（既定）
--   'established' … 既に身についた（習慣化済み）習慣
-- に区別する。established の習慣には「いつから身についているか」を
-- established_since（概算で日付化）として保持する。
--
-- 後方互換: status は NOT NULL DEFAULT 'active' で追加するため、
-- 既存行はすべて自動的に 'active' になり壊れない（AC#5）。
-- established_since は nullable（active 習慣では NULL）（AC#6）。
-- 既存の RLS（user_id 単位の select/insert/update/delete）はそのまま適用される。

alter table public.habits
  add column if not exists status text not null default 'active'
    check (status in ('active', 'established'));

alter table public.habits
  add column if not exists established_since date;
