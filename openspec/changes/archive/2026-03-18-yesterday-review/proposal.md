## Why

ユーザーは当日にすべての習慣を記録できるとは限らない。就寝前や翌朝に「昨日の習慣」をまとめて振り返りたいニーズがあるが、現状のホーム画面では昨日の記録状態が一覧で確認できず、個別ドットを探してタップする必要がある。昨日分をまとめてレビューできる専用 UI を提供することで、記録漏れを防ぎ、継続率を高める。

## What Changes

- ホーム画面の DailyImpactSummary 下部に Amber バナーを追加（昨日に未レビューの習慣がある場合のみ表示）
- バナータップで Sheet が開き、昨日の全習慣（非アーカイブ）を一覧表示
- 各習慣に status トグル（4サイクル: none → completed → skipped → failed → none）とメモ入力欄を配置
- Sheet 下部にムードスタンプ（1〜5段階）と日次コメント欄を配置
- 「Done」ボタンでムード＋コメントを保存してシートを閉じる
- DB 変更: `habit_completions` に `note` カラム追加、`daily_reflections` テーブル新設
- 集計ロジック: 5日以上経過した `none` は `failed` として扱う（`getEffectiveStatus()`）

## Capabilities

### New Capabilities

- `yesterday-review`: ホーム画面から昨日の習慣をまとめてレビューする機能
  - `YesterdayReviewBanner`: 未レビュー習慣がある場合に表示するバナーコンポーネント
  - `YesterdayReviewSheet`: 昨日の全習慣を一覧レビューするシートコンポーネント
  - `getEffectiveStatus()`: 5日超過 none を failed に変換する関数
  - `getYesterdayUnreviewedHabits()`: 昨日の未レビュー習慣を取得する関数
  - `daily_reflections` テーブル: ムード＋コメントを日次で保存

### Modified Capabilities

- `habit_completions` テーブル: `note` カラム追加（per-habit メモ）
- `useHabits` hook: `updateNote()` メソッド追加
- `src/lib/supabase/habits.ts`: `updateCompletionNote()`, `upsertDailyReflection()`, `getDailyReflection()` 追加
- `src/lib/habits.ts`: `getEffectiveStatus()`, `getYesterdayUnreviewedHabits()` 追加
- `src/components/ui/icon-registry.ts`: `CalendarCheck` アイコン登録

## Impact

- `supabase/migrations/` — habit_completions.note + daily_reflections テーブル migration
- `src/types/habit.ts` — DailyReflection 型, HabitCompletion.note フィールド追加
- `src/lib/habits.ts` — getEffectiveStatus(), getYesterdayUnreviewedHabits() 追加
- `src/lib/supabase/habits.ts` — updateCompletionNote(), upsertDailyReflection(), getDailyReflection() 追加
- `src/hooks/useHabits.ts` — updateNote() 追加
- `src/components/ui/icon-registry.ts` — CalendarCheck 登録
- `src/components/habits/yesterday-review-banner.tsx` — 新規作成
- `src/components/habits/yesterday-review-sheet.tsx` — 新規作成
- `src/app/(app)/page.tsx` — バナー＋シート組み込み
- `src/messages/ja.json` / `src/messages/en.json` — i18n キー追加
