# Tasks: Yesterday Review

## Group 1: DB マイグレーション

- [ ] 1.1: `supabase/migrations/` — `habit_completions.note` TEXT カラム追加 + `daily_reflections` テーブル作成 + RLS ポリシー設定のマイグレーションファイル作成
- [ ] 1.2: `supabase db push` でマイグレーション適用

## Group 2: 型定義

- [ ] 2.1: `src/types/habit.ts` — `DailyReflection` インターフェース追加
- [ ] 2.2: `src/types/habit.ts` — `HabitCompletion` 型に `note?: string | null` フィールド追加

## Group 3: ロジック関数

- [ ] 3.1: `src/lib/habits.ts` — `getEffectiveStatus()` 関数追加（5日超過 none → failed 変換）
- [ ] 3.2: `src/lib/habits.ts` — `getYesterdayUnreviewedHabits()` 関数追加（非アーカイブ習慣の昨日分 none を返す）

## Group 4: Supabase CRUD 関数

- [ ] 4.1: `src/lib/supabase/habits.ts` — `updateCompletionNote()` 追加（habit_completions.note の upsert）
- [ ] 4.2: `src/lib/supabase/habits.ts` — `upsertDailyReflection()` 追加（daily_reflections への insert/update）
- [ ] 4.3: `src/lib/supabase/habits.ts` — `getDailyReflection()` 追加（daily_reflections の単一取得）

## Group 5: useHabits hook 拡張

- [ ] 5.1: `src/hooks/useHabits.ts` — `updateNote()` メソッド追加（updateCompletionNote を呼び出し + ローカル state 更新）

## Group 6: アイコン登録

- [ ] 6.1: `src/components/ui/icon-registry.ts` — `CalendarCheck` を lucide-react から登録

## Group 7: YesterdayReviewBanner コンポーネント

- [ ] 7.1: `src/components/habits/yesterday-review-banner.tsx` — Amber バナーコンポーネント新規作成（getYesterdayUnreviewedHabits で件数表示、タップで onOpen 呼び出し）

## Group 8: YesterdayReviewSheet コンポーネント

- [ ] 8.1: `src/components/habits/yesterday-review-sheet.tsx` — Sheet の骨格（ヘッダー + 習慣リスト + ムード + コメント + Done ボタン）作成
- [ ] 8.2: `src/components/habits/yesterday-review-sheet.tsx` — 習慣リスト: status 4サイクルトグル + スタイル実装
- [ ] 8.3: `src/components/habits/yesterday-review-sheet.tsx` — メモ入力欄: blur-to-save 実装（onNoteChange 呼び出し）
- [ ] 8.4: `src/components/habits/yesterday-review-sheet.tsx` — ムードスタンプ (1〜5) のローカル state + UI 実装
- [ ] 8.5: `src/components/habits/yesterday-review-sheet.tsx` — Done ボタン: onReflectionSave await + ローディング + シートクローズ実装

## Group 9: ページ統合

- [ ] 9.1: `src/app/(app)/page.tsx` — `yesterday` 日付の計算と `getYesterdayUnreviewedHabits` の呼び出し追加
- [ ] 9.2: `src/app/(app)/page.tsx` — `YesterdayReviewBanner` を DailyImpactSummary 下に配置
- [ ] 9.3: `src/app/(app)/page.tsx` — `YesterdayReviewSheet` を配置（open state, onStatusChange, onNoteChange, onReflectionSave, initialReflection を接続）

## Group 10: i18n

- [ ] 10.1: `src/messages/ja.json` — `yesterdayReview` キーグループ追加
- [ ] 10.2: `src/messages/en.json` — `yesterdayReview` キーグループ追加

## Group 11: 検証

- [ ] 11.1: `npx tsc --noEmit` — 型エラーなし（既存エラーのみ、新規なし）
- [ ] 11.2: `npx vitest run` — テスト PASS（新規エラーなし）
- [ ] 11.3: `npx next build` — ビルドエラーなし
