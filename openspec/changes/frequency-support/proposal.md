# Proposal: 頻度サポート（Daily / Weekly 対応）

## Why

現在 Shukan のすべての習慣は `frequency: 'daily'` 固定で動作している。これは「毎日やる習慣」には問題ないが、「平日だけランニング」「週3回筋トレ」のように現実的な習慣パターンに対応できない。

結果として以下の問題が生じる:
- 土日に「今日は対象外」の習慣がホーム画面に全表示され、混乱を招く
- Weekly（週N回）の習慣を管理したいユーザーが追加できない
- 習慣形成の科学では週1〜3回の頻度が推奨される習慣種別がある（筋トレ、瞑想など）

また、既存の型定義（`frequency: 'daily' | 'weekly' | 'custom'`）と DB スキーマは存在するが、`shouldShowToday` での `weekly` は月曜固定の不完全実装であり、実質 `daily` のみ機能している。

## What Changes

1. **新しいカテゴリ構造の導入**: `daily` を廃止し、`everyday` / `weekday` / `custom` / `weekly` の4種別に再編
2. **既存データマイグレーション**: `frequency = 'daily'` を `'everyday'` に一括変換
3. **DB スキーマ更新**: `frequency` CHECK 制約の更新と `weekly_target` カラム追加
4. **自動スキップ機構**: Daily/weekday・custom の非対象日は既存のスキップ機構を再利用して自動スキップ表示
5. **shouldShowToday の簡素化**: 非アーカイブ習慣は常に `true`（表示制御はスキップ機構に委譲）
6. **ストリーク計算の拡張**: Weekly 習慣は連続達成週数で計算
7. **completionRate の拡張**: Weekly 習慣は過去12週の達成週数で計算
8. **HabitForm UI**: Daily/Weekly カテゴリタブ、サブタイプ選択、曜日チップ、回数セレクター
9. **HabitCard の表示拡張**: Weekly 進捗表示（今週 N/M 回）、Daily 非everyday の頻度情報表示

## Capabilities

### frequency-support
- `everyday` / `weekday` / `custom` / `weekly` の4種別型定義と DB スキーマ
- `isTargetDay(habit, date)` ヘルパー関数
- 自動スキップ: 非対象日の習慣に `skippedToday: true` を自動付与（DB 書き込みなし）
- ユーザーが unskip した場合は自動スキップを上書き
- Weekly ストリーク: 連続達成週数（月曜始まり、週の目標達成判定）
- Weekly completionRate: 過去12週の達成週数比率
- HabitForm: Daily/Weekly カテゴリセレクター、Custom 曜日チップ、Weekly 回数セレクター
- HabitCard: Weekly 進捗（今週 N/M 回）、Daily 非everyday 頻度ラベル表示

## Impact

- `src/types/habit.ts` — frequency 型変更（everyday/weekday/custom/weekly）、weeklyTarget フィールド追加
- `src/lib/habits.ts` — shouldShowToday 簡素化、isTargetDay 追加、calculateStreak 拡張、getCompletionRate 拡張、getHabitsWithStats の自動スキップ統合
- `src/lib/supabase/habits.ts` — weekly_target カラムのマッピング追加
- `src/hooks/useHabits.ts` — 必要に応じて自動スキップロジックの統合
- `src/components/habits/habit-form.tsx` — 頻度セレクター UI 実装（非表示を解除して再実装）
- `src/components/habits/habit-card.tsx` — Weekly 進捗・Daily 頻度ラベル表示
- `src/messages/ja.json`, `src/messages/en.json` — 頻度関連 i18n キー追加
- `supabase/migrations/` — frequency CHECK 更新 + weekly_target カラム + daily→everyday マイグレーション
