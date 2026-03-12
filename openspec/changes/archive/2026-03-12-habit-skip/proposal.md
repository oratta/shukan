## Why

習慣トラッカーにおいて、休暇中・体調不良・出張など「やれない日」が存在する。現状はその日の習慣をただ失敗扱いにするしかなく、ストリークが途切れてモチベーションが下がる問題がある。「スキップ」機能を追加することで、意図的に休んだ日を記録し、ストリークを保護しつつ達成率・インパクト計算の歪みも防ぐ。

## What Changes

1. **スキップ機能（今日のみ）**: 習慣カード展開時にSkipボタンを追加。スキップは当日限り有効で翌日自動リセット。
2. **スキップ済みセクション**: スキップした習慣はリスト下部の専用セクションに移動しグレー表示。
3. **ストリーク計算の変更**: スキップ日を「透明な日」として扱い、連続を途切れさせないが日数にもカウントしない。
4. **達成率・プログレスバー・インパクト計算の除外**: スキップ日・スキップ習慣を各計算の分母から除外。

## Capabilities

### New Capabilities
- `habit-skip`: 今日の習慣をスキップする機能（専用ボタン・状態管理・UI）

### Modified Capabilities
- `habit-list`: アクティブ/スキップ済みの2セクション分割表示
- `streak-calculation`: スキップ日を透明な日として透過処理
- `completion-rate`: スキップ日を分母から除外
- `progress-bar`: スキップ習慣を分母から除外
- `impact-calculation`: スキップ習慣を計算から除外

## Impact

### 影響を受けるコード
- `src/types/habit.ts` - 'skipped' ステータス追加、`skippedToday` フィールド追加
- `src/lib/habits.ts` - ストリーク・達成率計算の変更、`isSkippedToday` 関数追加
- `src/lib/supabase/habits.ts` - Supabase層のskippedステータス型対応
- `src/hooks/useHabits.ts` - `setDayStatus` でskippedを受け付けるように変更
- `src/components/habits/habit-card.tsx` - Skip/Unskipボタン追加、スキップ時グレー表示
- `src/components/habits/habit-list.tsx` - 2セクション分割、フェードアニメーション
- `src/app/(app)/page.tsx` - `handleSkipToday` ハンドラ追加、プログレスバー計算変更
- `src/components/habits/daily-impact-summary.tsx` - スキップ習慣を計算から除外
- `src/app/globals.css` - `fadeSlideIn` アニメーション追加
- `src/messages/ja.json` / `src/messages/en.json` - skip/unskip/skippedSection 翻訳キー追加

### 影響を受けるシステム
- Supabase DB: `habit_completions.status` に `'skipped'` 値を追加（CHECK制約は既に除去済みのためマイグレーション不要）

### 後方互換性
- 既存の completion ステータス（'completed', 'failed', 'rocket_used'）は影響なし
- `nextStatus` サイクルにスキップは含めない（スキップは専用ボタンでのみ操作）
