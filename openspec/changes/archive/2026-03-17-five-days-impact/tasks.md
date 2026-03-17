# Tasks: 5 Days Life Impact

## Group 1: ロジック + UI

- [x] 1.1: `src/components/habits/daily-impact-summary.tsx` — recentDays から5日間の累積インパクトを計算するロジック追加
- [x] 1.2: `src/components/habits/daily-impact-summary.tsx` — Today セクションの下に区切り線 + 5 Days セクションの UI 追加
- [x] 1.3: `src/messages/ja.json` — `impact.fiveDaysImpact` キー追加
- [x] 1.4: `src/messages/en.json` — `impact.fiveDaysImpact` キー追加

## Group 2: 検証

- [x] 2.1: `npx tsc --noEmit` — 型エラーなし（既存エラーのみ、新規なし）
- [x] 2.2: `npx vitest run` — テスト 120/121 PASS（1件は既存の記事数不一致）
- [x] 2.3: `npx next build` — ビルドエラーなし
