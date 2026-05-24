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

## Build フェーズ — change-A (lp-foundation)

### D-A-1: DESIGN.md は globals.css の OKLCh + HEX 併記

- **日時**: 2026-05-24T14:25:00+09:00
- **対象 change**: change-A
- **決定**: `docs/design/DESIGN.md` の Color Palette は OKLCh (権威) と HEX (Codex Style Block 用概算) を併記する。check-design-md-sync.sh は OKLCh の数値を grep で diff 検出
- **エビデンス**: リサーチ §2.2 で Codex の Style Block は HEX 指定が標準。一方 globals.css は Tailwind v4 / shadcn new-york で OKLCh 採用。両ニーズを満たすため併記
- **影響**: 後続 change の Codex プロンプトは HEX をそのままコピー可。コード実装側は CSS variable 経由 (HEX hard-coded 禁止) を継続

### D-A-2: check-design-md-sync.sh は bash + grep + awk のみで実装

- **日時**: 2026-05-24T14:25:00+09:00
- **対象 change**: change-A
- **決定**: Node 製 CSS parser は使わず、`awk` で `:root { ... }` を抽出 → `sed` でトークン抽出 → `grep` で DESIGN.md 内検索
- **エビデンス**: トークンの存在 + 数値文字列の存在チェックで十分。依存追加なし
- **影響**: HIGH 可逆。CI hook 化は change-H で検討

### D-A-3: codex-image-gen.sh は Codex CLI 未 install でも引数 validation までは exit 0/1 で動く

- **日時**: 2026-05-24T14:30:00+09:00
- **対象 change**: change-A
- **決定**: `command -v codex` が無ければ exit 2 (validation 成功 / 実行不可)。`--help` exit 0、必須引数欠落 exit 1。テストは help + 引数欠落の 2 パスのみで Codex 本体は不要
- **影響**: CI でテスト可能。実 generation 検証は change-B で別途

### D-A-4: waitlist migration の SELECT/UPDATE/DELETE policy は明示せず service_role 限定

- **日時**: 2026-05-24T14:35:00+09:00
- **対象 change**: change-A
- **決定**: RLS enabled + INSERT policy のみ。SELECT/UPDATE/DELETE は policy 無し → anon/authenticated は denied、service_role のみ Supabase Studio 経由でアクセス可能
- **エビデンス**: plan.md データモデル節の Draft に準拠 + Supabase の default deny RLS 仕様
- **影響**: change-G の Server Action は anon key で INSERT のみ可能。データ閲覧は Studio から

### D-A-5: 既存 root の DESIGN.md は触らず、LP 用は `docs/design/DESIGN.md` に新規作成

- **日時**: 2026-05-24T14:25:00+09:00
- **対象 change**: change-A
- **決定**: 役割分離。root の DESIGN.md = 既存 Smitch アプリ design system。`docs/design/DESIGN.md` = LP image-to-code 専用 (Codex Style Block + LP hard rules 主体)
- **影響**: 既存 design system に regression なし。LP コピーや実装は LP DESIGN.md を権威ソースに

### D-A-6: CLAUDE.md は新規作成 (root に既存なし)

- **日時**: 2026-05-24T14:30:00+09:00
- **対象 change**: change-A
- **決定**: 「Smitch コンセプトコア」「LP image-to-code workflow ガイド」「Hard Rules」「Workflow rules」の 4 章構成。今後の change でも追記しやすい構造
- **影響**: Claude Code が session 開始時に最初に読むファイルとして機能
