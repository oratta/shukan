# Decisions Log

各 change の設計判断を集約。

## Setup フェーズ

### D-S-1: change-A の事前調査タスク結果 — middleware 改修不要

- **日時**: 2026-05-24T13:53:00+09:00
- **対象 change**: change-A
- **決定**: change-A スコープから「middleware host 判定実装」を除外する（plan.md の change-A の事前調査タスクが「既存 middleware に NEXT_PUBLIC_MARKETING_HOSTS parsing + 4 branch 実装が既にあるか」を確認するもので、結果は既存実装あり）
- **エビデンス**:
  - 実行コマンド: Explore Agent による `src/middleware.ts` 構造調査
  - 出力: 「既にマーケティング host 判定を実装。Branch 1: marketing host + / → /marketing にrewrite。Branch 2: dev mode で marketing=1 param で /marketing へ。Branch 3: 非 marketing host で /marketing → / にrewrite。Branch 4: default で Supabase auth check」
  - 補助: `npm run test:run` で `middleware.test.ts` 11 tests が PASS
- **影響**: change-A は「DESIGN.md + brand-references skeleton + Codex prompt template + CLAUDE.md hard rules + Cloudflare DNS + Vercel domain + env + waitlist migration」に集中可能。middleware ロジック変更による regression リスクなし

### D-S-2: change-H で marketing-page.test.tsx を書き換える方針

- **日時**: 2026-05-24T13:53:00+09:00
- **対象 change**: change-H
- **決定**: 既存 `src/__tests__/marketing-page.test.tsx` の 5 tests は change-H で破棄し、新 LP 用 tests に全面置換する
- **エビデンス**:
  - 実行コマンド: Explore Agent + `npm run test:run`
  - 出力: 既存 5 tests は旧プレースホルダ DOM（tagline / heroSubcopy / problemText / solutionText / footerCredit）を assert している
  - plan.md change-H に「既存 `src/app/marketing/copy.ts` 全面置換」「`src/app/marketing/page.tsx` 全面構築」と明記済み → テストも同期して置換すべき
- **影響**: change-H の tasks.md で「`marketing-page.test.tsx` の旧 5 tests を破棄 + 新 LP 6 セクション用 tests に書き換え」を明示。Spec Review で確認
- **反論記録（self-preference bias 緩和）**: なし。レビュアー指摘なく、設計上の必然
