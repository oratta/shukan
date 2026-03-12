# Tasks: 頻度サポート（Daily / Weekly 対応）

## Phase 1: DB + 型 + CRUD

- [x] 1.1: `supabase/migrations/YYYYMMDD000000_frequency_support.sql` を作成
  - frequency CHECK 制約更新（everyday/weekday/custom/weekly）
  - `UPDATE habits SET frequency = 'everyday' WHERE frequency = 'daily'`
  - `weekly_target integer DEFAULT 1` カラム追加
- [x] 1.2: `supabase db push` でマイグレーション適用
- [x] 1.3: `src/types/habit.ts` — frequency 型を `'everyday' | 'weekday' | 'custom' | 'weekly'` に変更
- [x] 1.4: `src/types/habit.ts` — `weeklyTarget?: number` フィールド追加
- [x] 1.5: `src/lib/supabase/habits.ts` — `weekly_target` ↔ `weeklyTarget` の snake_case/camelCase マッピング追加
- [x] 1.6: `src/lib/supabase/habits.ts` — INSERT/UPDATE/SELECT で `weekly_target` を含める

## Phase 2: 自動スキップ + ストリーク + completionRate

- [x] 2.1: `src/lib/habits.ts` — `shouldShowToday` を `!habit.archived` のみに簡素化
- [x] 2.2: `src/lib/habits.ts` — `isTargetDay(habit: Habit, date: Date): boolean` ヘルパー追加
  - everyday: 常に true
  - weekday: getDay() 1〜5 のみ true
  - custom: customDays.includes(getDay()) のみ true
  - weekly: 常に true
- [x] 2.3: `src/lib/habits.ts` / `src/hooks/useHabits.ts` — `getHabitsWithStats` 内の `skippedToday` 判定に自動スキップロジックを統合
  - 判定優先順位: 手動スキップ > 手動操作 > 自動スキップ > 通常未実施
- [x] 2.4: `src/lib/habits.ts` — `calculateStreak` を Weekly に対応
  - frequency が 'everyday' / 'weekday' / 'custom': 従来の日単位ロジックを維持
  - frequency が 'weekly': 連続達成週数ロジックに切り替え（月曜始まり、weeklyTarget 閾値）
- [x] 2.5: `src/lib/habits.ts` — `getCompletionRate` を Weekly に対応
  - frequency が 'everyday' / 'weekday' / 'custom': 従来の completedDays / (30 - skippedDays)
  - frequency が 'weekly': 過去12週の達成週数 / 12

## Phase 3: HabitForm UI

**実装エージェントは `frontend-design` スキルを使用すること。**

- [x] 3.1: `src/components/habits/habit-form.tsx` — Daily / Weekly カテゴリタブ表示（非表示解除）
- [x] 3.2: `src/components/habits/habit-form.tsx` — Daily サブタイプ選択（everyday / weekday / custom のラジオ/チップ）
- [x] 3.3: `src/components/habits/habit-form.tsx` — Custom 選択時の7曜日チップ表示（複数選択・最低1日バリデーション）
- [x] 3.4: `src/components/habits/habit-form.tsx` — Weekly 選択時の回数セレクター（1〜7、デフォルト1）
- [x] 3.5: `src/messages/ja.json` — i18n キー追加（frequencyDaily / frequencyWeekly / everyday / weekday / frequencyCustom / selectDays / timesPerWeek / weeklyProgress）
- [x] 3.6: `src/messages/en.json` — i18n キー追加（同上）

## Phase 4: ホーム画面表示

**実装エージェントは `frontend-design` スキルを使用すること。**

- [ ] 4.1: `src/components/habits/habit-card.tsx` — Weekly 習慣の今週進捗（今週 N/M 回）を習慣名下に表示
- [ ] 4.2: `src/components/habits/habit-card.tsx` — Weekly 習慣の StatusIndicator: 未達成=未完了円、達成=緑+Check
- [ ] 4.3: `src/components/habits/habit-card.tsx` — weekday/custom 習慣の頻度ラベルを習慣名下に表示
- [ ] 4.4: `src/components/habits/habit-card.tsx` — recentDays ドットの frequency 対応
  - weekday: 平日のみのドット
  - custom: 対象曜日のみのドット
  - weekly: 直近7日のドット（毎日）

## Phase 5: ビルド検証 + コミット

- [ ] 5.1: `npx tsc --noEmit` — TypeScript 型チェック、エラーなし
- [ ] 5.2: `npx vitest run` — テスト全件 PASS
- [ ] 5.3: `npx next build` — ビルドエラーなし
- [ ] 5.4: git commit（feat(frequency): add frequency support - everyday/weekday/custom/weekly）
