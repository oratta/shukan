## Context

LP image-to-code workflow longrun (`_longruns/2026-05-24_lp-image-code-workflow/plan.md`) の最初の change。
後続の change-B (Hero pilot) 〜 change-H (統合) が全て本 foundation に依存する。

決定済みの前提:
- D-S-1: 既存 `src/middleware.ts` は host 判定実装済み → 改修不要
- D-S-2: 既存 `src/__tests__/marketing-page.test.tsx` は change-H で全面置換 → 本 change では触らない
- ベースライン: 197 vitest tests 全 PASS

## Goals / Non-Goals

**Goals:**
- DESIGN.md を権威ソースとして立ち上げ、後続 change が「色 / typography / rhythm / motion / hard rules」を参照する単一窓口にする
- Codex CLI の reference image ロール分け運用ルールを README で固定 (16 枚 role-label 仕組み)
- Smitch ブランド値を埋めた Codex プロンプトテンプレを配置し、後続 change の image generation を高速化
- Supabase `waitlist` テーブルを先行作成 (change-G の Server Action 実装ブロッカーを解消)
- CLAUDE.md にコンセプトコア + hard rules を書き、AI builder agent (Claude Code) の振る舞いを構造的に制約

**Non-Goals:**
- middleware ロジック変更 (D-S-1 で確定)
- 既存 `src/app/marketing/` への変更 (change-H で全面置換)
- brand-references の実画像配置 (Build フェーズで都度配置)
- Cloudflare DNS / Vercel domain / Vercel env vars の操作 (外部副作用、ユーザー手動)
- Codex CLI 本体の install (`scripts/codex-image-gen.sh` はラッパのみ、実行は別途)
- shadcn primitives の追加 install (既存 14 個で間に合う想定)

## Decisions

### D-A-1: DESIGN.md は globals.css の OKLCh をそのまま転記する (HEX 併記)

- **背景**: globals.css は OKLCh で書かれている (Tailwind v4 + new-york style)。一方、Codex CLI への "Project Style Block" には HEX で渡すのがリサーチ §2.2 で標準
- **選択肢**:
  - A. OKLCh のみ転記 → 短所: Codex プロンプトで HEX 変換が毎回必要
  - B. HEX のみ転記 → 短所: globals.css と乖離しやすい
  - C. OKLCh + HEX 併記 → 長所: 両側面ハッピー、check スクリプトは OKLCh 単位で diff 可能
- **決定**: C を採用。DESIGN.md には OKLCh (権威) と HEX (概算) を両方書く。check-design-md-sync.sh は OKLCh の token 名と値が globals.css と一致するか確認
- **可逆性**: HIGH (後から変更容易)

### D-A-2: check-design-md-sync.sh は静的解析のみ (実行時 DOM 比較なし)

- **背景**: DESIGN.md ↔ globals.css の同期は OKLCh の token 名で grep 比較すれば十分
- **選択肢**:
  - A. bash + grep + diff → シンプル、依存追加なし
  - B. Node 製スクリプトで CSS parser 使用 → 厳密だが overkill
- **決定**: A。`:root { ... }` ブロック内の `--token: oklch(...)` を grep で抽出し、DESIGN.md にも同じトークン名と値が登場するか確認。差分があれば exit 1
- **可逆性**: HIGH

### D-A-3: scripts/codex-image-gen.sh は Codex CLI 未 install でも help / 引数 validation までは動く

- **背景**: 本 change は CI / 他環境でテストするため、Codex CLI なしでも `--help` と引数 parsing は走る必要がある
- **決定**: スクリプトは `command -v codex` チェックを実行前に行い、未 install なら "Codex CLI not found, skipping actual generation" を stderr に出して exit 0 (help mode) / exit 2 (generation mode) で分岐。テストは help と引数欠落 error の 2 パスのみ
- **可逆性**: HIGH

### D-A-4: waitlist migration は plan.md SQL Draft 完全準拠 + nullable / source カラムも追加

- **背景**: plan.md データモデルに `source text` がある (流入チャネル trace 用)
- **決定**: plan.md SQL Draft を 1:1 で実装。`source` 任意カラムも含める。SELECT/UPDATE/DELETE policy は service_role のみで OK (RLS の default が「policy なし = アクセス不可」のため明示 policy 不要)
- **可逆性**: MEDIUM (DROP TABLE で戻せるが Supabase 上のデータは消える)

### D-A-5: CLAUDE.md は新規作成 (リポジトリ root に既存なし)

- **背景**: ルートに CLAUDE.md は存在しない。本 change で新規作成する
- **選択肢**:
  - A. CLAUDE.md 新規 + LP 特化セクション
  - B. CLAUDE.md 新規 + Smitch プロジェクト全体ルール + LP セクション混在
- **決定**: B。今後の change でも追記しやすいよう、Smitch プロジェクト全体の hard rules も含める。LP セクションを明確に区切る
- **可逆性**: HIGH

### D-A-6: vitest テストは静的ファイル検証主体

- **背景**: DESIGN.md 構造 / migration SQL / shell script は静的ファイル検証で十分
- **決定**: `fs.readFileSync` で読み込み、正規表現 / `includes` で必須要素を assert。shell script の戻り値は Node `child_process.spawnSync` で実行 (exit code を取得)。spawnSync は配列引数 + shell:false で injection を避ける
- **可逆性**: HIGH

### D-A-7: ルート DESIGN.md の扱い

- **背景**: リポジトリ root に既に DESIGN.md (Smitch アプリ用 design system) が存在する
- **選択肢**:
  - A. root の DESIGN.md を `docs/design/DESIGN.md` に移動
  - B. root はアプリ用、`docs/design/DESIGN.md` は LP 用として共存
- **決定**: B。役割分離。`docs/design/DESIGN.md` は LP image-to-code 専用 (Codex Style Block + hard rules 主体)、root の DESIGN.md は既存アプリ design system のまま残す
- **可逆性**: HIGH

## Risks / Trade-offs

- **[Risk] DESIGN.md の OKLCh と globals.css の差分が PR レビューで見落とされる** → Mitigation: `scripts/check-design-md-sync.sh` を README に記載し、change-H で CI hook 化を検討 (本 change では手動実行 only)
- **[Risk] Codex CLI ラッパが実環境で動かない** → Mitigation: 本 change のスコープは「ラッパが存在し、help / 引数 validation が走る」までで、実 generation の検証は change-B で別途
- **[Risk] waitlist migration を本番適用するタイミング** → Mitigation: 本 change ではファイル作成のみ。`supabase db push` は change-G の作業ゲートで実行 (デプロイ側責務)
- **[Risk] CLAUDE.md にあれもこれも書いて長文化** → Mitigation: 「concept core」「LP hard rules」の 2 セクションに絞る。詳細は DESIGN.md / plan.md を参照させる

## Migration Plan

1. DESIGN.md / scripts / brand-references README / prompt template / CLAUDE.md 追記 を実装 (TDD で test → impl)
2. waitlist migration ファイルを作成 (テストでファイル存在 + 必須要素含有を検証)
3. vitest 新規テストを 1 つずつ追加し RED → GREEN を確認
4. `npm run test:run` で 197 + 新規 tests 全 PASS を確認
5. `npm run lint` / `npm run build` で regression なし確認
6. コミット (粒度: docs / scripts / migration / claude-md の 3-4 個)
7. ユーザー手動タスク 3 件 (Cloudflare / Vercel domain / env vars) を完了報告に明記

## Open Questions

- (なし - 全項目 plan.md と decisions.md でカバー済み)
