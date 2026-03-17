## Why

ホーム画面の「Today's Life Impact」は今日の完了状況のみ反映する。ユーザーが過去のドットをタップして完了状態を変更しても数字が変わらず、操作に対するフィードバックがない。過去5日間の累積インパクトを表示することで、過去の記録修正にも即座に数値が反応し、継続のモチベーションを強化する。

## What Changes

- DailyImpactSummary コンポーネントの下部に「5 Days Impact」セクションを追加
- 過去5日間で completed な日のインパクトを習慣ごとに集計し、合計を表示
- 既存の Today's Impact（Perfect 判定含む）はそのまま維持
- recentDays の status データを活用し、追加の DB クエリは不要

## Capabilities

### New Capabilities
- `five-days-impact`: ホーム画面に過去5日間の累積ライフインパクトを表示する機能

### Modified Capabilities

(なし — 既存の daily-impact-display の要件は変更しない)

## Impact

- `src/components/habits/daily-impact-summary.tsx` — 5 Days セクション追加
- `src/messages/ja.json` / `src/messages/en.json` — i18n キー追加
- 既存の `HabitWithStats.recentDays` と `calculateDailyImpact` を再利用
