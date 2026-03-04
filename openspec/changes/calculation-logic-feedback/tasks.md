# Tasks: 計算ロジック表示 + フィードバック機能

## 1. 型定義・データモデル

- [ ] 1.1 CalcStep 型を src/types/impact.ts に追加
- [ ] 1.2 LifeImpactArticle に calculationLogic フィールドを追加
- [ ] 1.3 article_feedbacks マイグレーション SQL 作成
- [ ] 1.4 supabase db push でマイグレーション適用

## 2. Supabase データ層

- [ ] 2.1 src/lib/supabase/feedbacks.ts 新規作成（submitBadMark, removeBadMark, submitComment, getUserFeedback）

## 3. UI実装

- [ ] 3.1 計算ロジック展開セクション（evidence-article-sheet.tsx）
- [ ] 3.2 フィードバックセクション（バッドマーク + コメント）
- [ ] 3.3 i18n キー追加（ja.json, en.json）

## 4. 全30記事の計算ロジック作成 + 矛盾修正

- [ ] 4.1 quit_smoking（既知バグ修正: dailyHealthMinutes 12→再計算）
- [ ] 4.2 quit_porn
- [ ] 4.3 quit_alcohol
- [ ] 4.4 quit_sugar
- [ ] 4.5 quit_junk_food
- [ ] 4.6 quit_social_media
- [ ] 4.7 no_youtube
- [ ] 4.8 no_screens_before_bed
- [ ] 4.9 no_impulse_buying
- [ ] 4.10 daily_cardio
- [ ] 4.11 daily_strength
- [ ] 4.12 daily_walking
- [ ] 4.13 daily_stretching
- [ ] 4.14 daily_yoga
- [ ] 4.15 cold_shower
- [ ] 4.16 daily_meditation
- [ ] 4.17 daily_journaling
- [ ] 4.18 gratitude_practice
- [ ] 4.19 sleep_7hours
- [ ] 4.20 wake_early
- [ ] 4.21 drink_water
- [ ] 4.22 eat_vegetables
- [ ] 4.23 intermittent_fasting
- [ ] 4.24 home_cooking
- [ ] 4.25 morning_planning
- [ ] 4.26 daily_reading
- [ ] 4.27 deep_work
- [ ] 4.28 learn_language
- [ ] 4.29 daily_saving
- [ ] 4.30 time_in_nature

## 5. スキル更新

- [ ] 5.1 life-impact-article スキル（`/Users/oratta/.claude/skills/life-impact-article/SKILL.md`）に calculationLogic 手順を追加
