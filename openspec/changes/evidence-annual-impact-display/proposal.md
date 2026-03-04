## Why

Evidence Manager SheetでManage Evidenceバーが表示されないバグがあり、ユーザーがevidenceの管理にアクセスできない。また、evidenceのlife impactが日次表示（/日）のため数値が小さく直感的にわかりにくい。年間表示にすることでインパクトの大きさが伝わりやすくなり、weight調整時にリアルタイムで年間impactが変動する体験を提供したい。

## What Changes

- **Manage Evidenceバー表示バグの修正**: Evidence Manager Sheetを開くためのUIバーが表示されない問題を修正
- **年間impact表示への統一**: 全箇所でevidenceのlife impactを年間数字（×365）で表示するよう変更
  - ImpactBadge: `/日` → `/年`
  - EvidencePicker: 日次impact → 年間impact
  - EvidenceArticleSheet: daily metrics → annual metrics
  - Discover page ArticleCard: 日次 → 年間
- **Evidence Manager内でのimpact表示**: 各evidenceにlife impact（年間）を表示し、weight slider調整時にリアルタイムで数値が更新される

## Capabilities

### New Capabilities
- `annual-impact-display`: evidenceのlife impactを年間数字で表示するための計算ロジックとUI表示の統一

### Modified Capabilities

## Impact

- `src/lib/impact.ts` - 年間impact計算関数の追加
- `src/components/habits/impact-badge.tsx` - 日次→年間表示の変更
- `src/components/habits/evidence-manager-sheet.tsx` - バー表示修正 + 各evidence impact表示追加
- `src/components/habits/evidence-picker.tsx` - 年間impact表示
- `src/components/habits/evidence-article-sheet.tsx` - 年間impact表示
- `src/app/(app)/discover/page.tsx` - ArticleCardの年間impact表示
