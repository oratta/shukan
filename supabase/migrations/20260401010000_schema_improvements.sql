-- daily_reflections.date を TEXT → DATE に変更
ALTER TABLE daily_reflections ALTER COLUMN date TYPE date USING date::date;

-- (user_id, date) に明示的インデックス追加
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, date);
