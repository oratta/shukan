# Tasks: 計算ロジック表示 + フィードバック機能

## 1. 型定義・データモデル

- [x] 1.1 CalcStep 型を src/types/impact.ts に追加
- [x] 1.2 LifeImpactArticle に calculationLogic フィールドを追加
- [x] 1.3 article_feedbacks マイグレーション SQL 作成
- [x] 1.4 supabase db push でマイグレーション適用

## 2. Supabase データ層

- [x] 2.1 src/lib/supabase/feedbacks.ts 新規作成（submitBadMark, removeBadMark, submitComment, getUserFeedback）

## 3. UI実装

- [x] 3.1 計算ロジック展開セクション（evidence-article-sheet.tsx）
- [x] 3.2 フィードバックセクション（バッドマーク + コメント）
- [x] 3.3 i18n キー追加（ja.json, en.json）

## 4. 全30記事の計算ロジック作成 + 矛盾修正

- [x] 4.1 quit_smoking（既知バグ修正: dailyHealthMinutes 12→再計算）
- [x] 4.2 quit_porn
- [x] 4.3 quit_alcohol
- [x] 4.4 quit_sugar
- [x] 4.5 quit_junk_food
- [x] 4.6 quit_social_media
- [x] 4.7 no_youtube
- [x] 4.8 no_screens_before_bed
- [x] 4.9 no_impulse_buying
- [x] 4.10 daily_cardio
- [x] 4.11 daily_strength
- [x] 4.12 daily_walking
- [x] 4.13 daily_stretching
- [x] 4.14 daily_yoga
- [x] 4.15 cold_shower
- [x] 4.16 daily_meditation
- [x] 4.17 daily_journaling
- [x] 4.18 gratitude_practice
- [x] 4.19 sleep_7hours
- [x] 4.20 wake_early
- [x] 4.21 drink_water
- [x] 4.22 eat_vegetables
- [x] 4.23 intermittent_fasting
- [x] 4.24 home_cooking
- [x] 4.25 morning_planning
- [x] 4.26 daily_reading
- [x] 4.27 deep_work
- [x] 4.28 learn_language
- [x] 4.29 daily_saving
- [x] 4.30 time_in_nature

## 5. スキル更新

- [x] 5.1 life-impact-article スキル（`/Users/oratta/.claude/skills/life-impact-article/SKILL.md`）に calculationLogic 手順を追加
