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

## Build フェーズ — change-B 画像生成方針の転換

### D-S-3: LP 全体 1 枚絵生成は破綻 → セクション別 8 枚個別生成に切り替え

- **日時**: 2026-05-25T17:00:00+09:00
- **対象 change**: change-B〜G（画像生成プロセス全体）
- **決定**: 各セクションの画像を **1792x1024 (16:9) で個別生成** する方式に切り替える。LP 全体 1 枚絵での生成は廃止
- **エビデンス**:
  - 試行: Codex App で LP 全体 1 枚絵 mockup を生成 → 各セクションの iPhone モック内テキスト / フォーム項目 / Outcome Gallery 6 枚カード等が縮小されて潰れる
  - リサーチドキュメント `docs/research/lp-image-to-code-workflow-2026.md` §2.4: 「**1 枚絵で LP 全体を一度に出さない**。理由: 解像度・composition・text-safe zone が破綻しがち、修正コストが scenario あたり 5-10x」
  - リサーチ §3.1: 「1 枚絵全体を渡すと Claude Code は overall composition に注目するが、**各セクションの細部が薄まる**」
- **影響**: change-B〜G の plan を「セクションごとに 1 change」から実質「change-B 拡張で 8 セクション同時 = 1 change」に変更可能。openspec change を厳密に分けるか統合するかは次セッションでユーザーと確認

### D-S-4: Style anchor は LP 全体 mockup 1 枚のみ

- **日時**: 2026-05-25T17:30:00+09:00
- **対象 change**: change-B〜G
- **決定**: 各セクション生成プロンプトに添付する Style anchor 画像は、**ユーザーが Codex App で作った LP 全体 mockup 1 枚のみ**。既存生成済みの `public/landing/{hero, problem-solution, evidence}.png` は使わない
- **エビデンス**:
  - ユーザーフィードバック: 「メッセージ性のない本とコーヒーと眼鏡の画像」「無人静物の画像は LP コンセプトを訴えかけてこない」
  - LP mockup（人物中心、editorial documentary、Deep Indigo + Cream + Warm wood）がコンセプト的に正しい方向
- **影響**: `_longruns/2026-05-24_lp-image-code-workflow/codex-app-section-prompts.md` の共通ヘッダで「LP mockup のみを style anchor とする」と明示。既存 3 枚画像は試作素材として残すが、本番では使わない

### D-S-5: 既存試作実装は書き直し前提で保持

- **日時**: 2026-05-25T18:00:00+09:00
- **対象 change**: change-B〜G
- **決定**: 既存の `src/components/landing/*.tsx` 6 コンポーネント + `src/app/marketing-preview/page.tsx` + `public/landing/*.png` 5 枚は、8 セクション新画像が揃った後に**全面書き直し**する。ただし参照価値はあるので削除せず保持
- **エビデンス**:
  - 既存試作はユーザーの「とっとと進めて」を受けて Codex バックグラウンドで素材生成 + Claude が plan に沿って一気に実装したもの
  - LP 全体 1 枚絵生成方式（D-S-3 で却下）の前提で組まれている
  - 新画像（人物中心、リッチな editorial）に置き換える際にレイアウト・構造も書き直す必要あり
- **影響**: 次セッションで新画像が届いた際の作業は「既存を改修」ではなく「新規実装、既存は参照のみ」。waitlist フォーム部分は shadcn primitives で再現する流れは維持

## Codex CLI / Codex App についての技術メモ

### D-T-1: Codex CLI 0.133.0 には `image` サブコマンドが存在しない

- **日時**: 2026-05-25T16:00:00+09:00
- **決定**: `codex image` の代わりに `env -u OPENAI_API_KEY codex exec` で自然言語プロンプトを渡し、Codex Agent の内部 imagegen ツールに画像生成させる方式が利用可能。生成画像は `~/.codex/generated_images/<session>/ig_*.png` に保存される
- **エビデンス**:
  - `codex --help` 出力に `image` サブコマンドなし
  - vlog-album プラグイン（`~/.claude/plugins/marketplaces/marketing-harness/plugins/vlog-album/skills/vlog-album/SKILL.md`）が `env -u OPENAI_API_KEY codex exec` 方式の先行実装として動作
  - 私が試したところ Codex Agent が画像を生成 → 指定パスへコピーまで実行可能（hero-codex.png / problem-solution.png / evidence.png / lp-mockup-full.png が成功例）
- **影響**: 緊急時の Codex CLI 経由生成は可能だが、品質的に **Codex App（デスクトップ GPT）に投げる方が安定**。ユーザーが Codex App で対応する場合は CLI 経由ルートは不要
