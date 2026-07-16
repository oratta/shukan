# Tasks: redesign-quit-habit-input

## 1. DB・型・データ層

- [x] 1.1 マイグレーション作成: `habit_completions.resist_rate int CHECK (0-100)` nullable を追加し、`supabase db push`（dev）を実行する
- [x] 1.2 `src/types/habit.ts`: `HabitCompletion.resistRate?: number` を追加。`UrgeLog` / `CopingStep` 型と `HabitWithStats.todayUrgeCount` を削除
- [x] 1.3 `src/lib/supabase/habits.ts`: `resist_rate ↔ resistRate` マッピングを追加。urge_logs / coping_steps への読み書き関数を削除
- [x] 1.4 `src/hooks/useHabits.ts`: `setDayStatus` に `opts?: { resistRate?: number }` を追加（テスト先行）。`startUrgeFlow` / `completeUrgeStep` / `markQuitDailyDone` を削除

## 2. 判定ロジック（テスト先行）

- [x] 2.1 `src/lib/habits.ts` のテストを先に書く: quit の `completedToday` が completion レコードのみで判定される／urge_logs ゼロでも達成にできる／`getEffectiveStatus` は現行維持
- [x] 2.2 `isQuitHabitCompletedToday` を削除し、quit の達成判定を positive と同一化する（Green）
- [x] 2.3 `nextStatus` のテストを先に書く: none→completed / completed・rocket_used→none / failed・skipped→none（3値サイクル不在）
- [x] 2.4 `nextStatus` を二値トグルに変更する（Green）

## 3. 長押しとアクションシート

- [x] 3.1 `useLongPress` フックを新規作成（pointer events + 500ms、長押し後の click 抑止、contextmenu 抑止）。ユニットテストを先に書く
- [x] 3.2 `HabitActionSheet` コンポーネントを新規作成（Sheet side="bottom"、失敗した / スキップ・解除 / メモ、quit 失敗時は我慢率4択チップに切替、「失敗した」で即 failed 記録）
- [x] 3.3 `dashboard-client.tsx` に HabitActionSheet を1個マウントし、`{habitId, date}` state で開閉を配線。VsTemptationModal のマウントと props を撤去
- [x] 3.4 `habit-card.tsx`: StatusIndicator と週ドットに useLongPress を適用（週ドットは 24px タッチターゲット確保）。長押し中のドラッグ不発火を確認

## 4. StatusIndicator と表示

- [x] 4.1 quit の StatusIndicator を positive と同一の達成トグルボタンに置換（リング・todayUrgeCount・dailyTarget 参照を削除）
- [x] 4.2 resist_rate 反転塗りコンポーネントを作成（赤面積 = 100 − resist_rate、緑不使用）: 週ドット用（size-3）と StatusIndicator 用（size-8、%テキスト付き）
- [x] 4.3 `DayStatusDot` と StatusIndicator の failed 表示に反転塗りを配線（resist_rate null は全面赤）

## 5. 撤去・クリーンアップ

- [x] 5.1 `vs-temptation-modal.tsx` / `urge-flow.tsx` / `quit-today-sheet.tsx` を削除し、全参照を撤去
- [x] 5.2 `habit-form.tsx`: dailyTarget 入力・coping steps 入力・必須バリデーションを削除（quit がコーピングなしで保存できることをテスト）
- [x] 5.3 i18n: messages/ja.json・en.json にアクションシート・チップ文言を追加、urge 系文言（iGaveIn / iResisted 等）を削除。「ストリーク」不使用を確認
- [x] 5.4 `todayUrgeCount` / `urgeLogs` / `copingSteps` / `dailyTarget` の残存参照を grep で全洗いしてゼロにする（DB カラム・テーブルは残置）

## 6. 検証

- [x] 6.1 `npm run test:run`・`npm run lint`・`npx tsc --noEmit`・`npm run build` を実行し、exit code を記録する
- [ ] 6.2 ブラウザ検証: タップ二値トグル（positive / quit / weekly / 過去日ドット）、長押しシート（失敗→チップ→保存、チップ無視で failed 維持、スキップ、メモ）、失敗日の反転塗り表示、既存 quit 習慣（urge_logs 残存）の表示が壊れないこと、ドラッグ&ドロップが引き続き動くこと
- [ ] 6.3 受け入れ条件（issue #104）の9項目を全チェックする
