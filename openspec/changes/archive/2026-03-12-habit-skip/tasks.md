# Implementation Tasks

## Group 1: Data Layer
- [x] 1.1: `src/types/habit.ts` - HabitCompletion.status と DayStatus.status に 'skipped' 追加
- [x] 1.2: `src/types/habit.ts` - HabitWithStats に `skippedToday: boolean` フィールド追加
- [x] 1.3: `src/lib/supabase/habits.ts` - upsertCompletion / insertCompletion / toCompletion のステータス型に 'skipped' 追加
- [x] 1.4: `src/hooks/useHabits.ts` - setDayStatus の status 型に 'skipped' 追加

## Group 2: Utility Functions
- [x] 2.1: `src/lib/habits.ts` - `isSkippedToday` 関数追加
- [x] 2.2: `src/lib/habits.ts` - `calculateStreak` でスキップ日を透明な日として処理
- [x] 2.3: `src/lib/habits.ts` - `getCompletionRate` でスキップ日を分母から除外
- [x] 2.4: `src/lib/habits.ts` - `getHabitsWithStats` で `skippedToday` を計算・返却

## Group 3: UI Components
- [x] 3.1: `src/components/habits/habit-card.tsx` - `onSkipToday` prop 追加
- [x] 3.2: `src/components/habits/habit-card.tsx` - Detail + Skip/Unskip ボタン行実装
- [x] 3.3: `src/components/habits/habit-card.tsx` - スキップ時の習慣名グレー表示
- [x] 3.4: `src/components/habits/habit-card.tsx` - DayStatusDot の 'skipped' スタイル（灰色）
- [x] 3.5: `src/components/habits/habit-list.tsx` - `onSkipToday` prop 追加
- [x] 3.6: `src/components/habits/habit-list.tsx` - アクティブ / スキップ済みの2セクション分割
- [x] 3.7: `src/components/habits/habit-list.tsx` - セクション間の仕切りとラベル表示

## Group 4: Page and Impact
- [x] 4.1: `src/app/(app)/page.tsx` - `handleSkipToday` ハンドラ追加
- [x] 4.2: `src/app/(app)/page.tsx` - プログレスバーの分母からスキップ習慣を除外
- [x] 4.3: `src/components/habits/daily-impact-summary.tsx` - スキップ習慣を計算から除外

## Group 5: Styling and i18n
- [x] 5.1: `src/app/globals.css` - `@keyframes fadeSlideIn` 追加
- [x] 5.2: `src/messages/ja.json` - habits.skip / habits.unskip / habits.skippedSection 追加
- [x] 5.3: `src/messages/en.json` - habits.skip / habits.unskip / habits.skippedSection 追加
