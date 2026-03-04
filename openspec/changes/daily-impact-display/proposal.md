# Daily Impact Display

## Problem
ホーム画面のライフインパクト表示が年間表示で、「今日」に集中するUXと合っていない。また年間ビューの金額が四捨五入（¥54万）で具体性に欠ける。

## Solution
1. 完了インジケーター下に「今日のライフインパクト」セクションを追加（達成済み/全体のデイリーインパクト比較）
2. HabitCard/HabitDetailModalのImpactBadgeをデイリー表示に変更
3. 年間ビュー（EvidenceArticleSheet）の金額を具体的数字で表示

## Scope
- 新規: DailyImpactSummary コンポーネント
- 変更: ImpactBadge (useMan prop追加, デフォルトモード)
- 変更: HabitCard, HabitDetailModal (mode="daily")
- 変更: EvidenceArticleSheet (formatCurrency useMan=false)
- 変更: i18n (ja.json, en.json)
- 変更: page.tsx (DailyImpactSummary組み込み)
