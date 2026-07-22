# Proposal: redesign-quit-habit-input

GitHub issue: [#104 やらない系習慣の入力UI再設計](https://github.com/genetta-inc/shukan/issues/104)（Refs #2）

## Why

やらない系習慣（quit）の入力UIは「誘惑が来た瞬間にアプリを開いてコーピングフローをこなす」ことを主経路にしているが、この前提は実使用に耐えない（誘惑の瞬間にアプリは開かれない）。さらに現行モデルには「誘惑が一度も来なかった完璧な日が達成にならない」（`isQuitHabitCompletedToday` が urge_logs ≥ dailyTarget を要求）という矛盾があり、6日放置の自動 failed と組み合わさると平和に過ごすほど失敗が積み上がる。また、やる系のタップは3値サイクル（未入力→達成→失敗→未入力）で、達成のつもりの二度押しが失敗を記録する誤操作リスクを抱えている。同じ位置のボタンが習慣タイプで別の意味（達成の記録 vs モーダル起動）を持つ一貫性の欠如も含め、入力体系全体を再設計する。

## What Changes

- **タップ＝達成の二値トグルに統一**: やる系・quit ともカード左のタップは 未入力⇔達成（quit は「守れた」）のみ。3値サイクルを廃止。過去日の週ドットも同じ挙動
- **長押し→アクションシート**: 「失敗した / スキップ / メモ」を両タイプ共通で提供。失敗の記録はここに隔離
- **quit の失敗時のみ我慢率（resist_rate）を4択チップで任意入力**: 完全にダメ 0% / 少しは耐えた 25% / 半分くらい 50% / ほとんど耐えた 75%。`habit_completions.resist_rate int`（0–100, nullable）に保存
- **失敗日のグラデーション表示**: カレンダー・週ドットで resist_rate 入りの失敗日を無抵抗の失敗日と視覚的に区別（緑は使わない）
- **BREAKING: dailyTarget 撃退ノルマの廃止**: quit の達成判定を urge_logs ベースから completion レコードベースに変更。habit-form の dailyTarget 入力・coping steps 必須入力を削除
- **BREAKING: VsTemptationModal を入力経路から撤去・削除**: urge_logs への新規書き込みを停止（テーブルは残置、drop は別 issue）
- **デッドコード削除**: `urge-flow.tsx` / `quit-today-sheet.tsx` / `markQuitDailyDone` / `startUrgeFlow` / `completeUrgeStep`

## Capabilities

### New Capabilities

- `habit-input-actions`: やる系・quit 共通の入力体系（タップ＝達成二値トグル、長押しアクションシート、quit 失敗時の resist_rate 入力、失敗日の我慢率グラデーション表示、quit 達成判定の completion レコード化）

### Modified Capabilities

- `quit-habit-failure-recording`: リングタップ→VSモーダル・「負けた」ボタンの要求を撤去し、失敗記録をアクションシート経由に置き換える（既存 Requirement の大部分を REMOVED）
- `habit-skip`: スキップの入口としてアクションシートを追加（既存の展開ボディ Skip ボタンは維持）

## Impact

- **UI**: `src/components/habits/habit-card.tsx`（StatusIndicator の quit 分岐・nextStatus サイクル・週ドット）、`habit-list.tsx`、`src/components/dashboard/dashboard-client.tsx`（VsTemptationModal のマウント撤去）、`src/components/habits/habit-form.tsx`（dailyTarget・coping steps 入力の削除）、新規アクションシートコンポーネント
- **削除**: `src/components/habits/vs-temptation-modal.tsx`、`urge-flow.tsx`、`quit-today-sheet.tsx`
- **ロジック**: `src/hooks/useHabits.ts`（urge 系関数の削除、resist_rate 対応）、`src/lib/habits.ts`（`isQuitHabitCompletedToday` の判定変更）
- **型**: `src/types/habit.ts`（`HabitCompletion.resistRate` 追加、UrgeLog/CopingStep 型の整理）
- **DB**: マイグレーション追加（`habit_completions.resist_rate int CHECK 0–100` nullable）。`habits.daily_target`・`urge_logs`・`coping_steps` は残置（新規書き込み停止）
- **i18n**: `messages/ja.json` / `en.json` にアクションシート・resist_rate チップの文言追加、urge 系文言の削除
- **既存データ**: 過去の urge_logs・coping_steps があっても表示が壊れないこと（読み捨て）
