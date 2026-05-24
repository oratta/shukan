# CLAUDE.md — Smitch (shukan-app)

このリポジトリで Claude Code が作業する際の **プロジェクト常時参照ドキュメント**。
新しい session を開始したら本ファイルと `docs/design/DESIGN.md` を最初に読むこと。

---

## Project at a glance

- **Product**: Smitch (旧 Shukan) - "Switch your path."
- **Concept**: エビデンスベースのライフパスビルダー
- **Stack**: Next.js 16.1.6 / React 19.2.3 / TypeScript 5 / Tailwind CSS 4 / shadcn/ui / next-intl / next-themes / Supabase
- **Hosts**:
  - `s-mitch.com` (apex): 既存 Concept Prototype アプリ
  - `www.s-mitch.com`: 新 LP (image-to-code workflow で構築中)

---

## Smitch コンセプトコア

LP / アプリのコピーや設計判断は **以下のコンセプトコアに整合させる**。
コア定義: `_longruns/2026-05-24_lp-image-code-workflow/plan.md` ビジネスコンテキスト節 + `docs/context/product-concept.md`。

### 否定するのは「ライフハック」ではなく「経路」

- 既存習慣アプリ / 自己改善コンテンツの多くは、**SNS / ショート動画 / インフルエンサー** から流れてきたライフハックを鵜呑みにする "**受動的な経路**" を前提にしている
- Smitch は逆。「**なりたい自分**」を起点に、本人が **能動的に選び取る**「能動的な経路」へ転換する
- つまり Smitch の本質は「**情報経路の転換 (受動 → 能動)**」

### 手段と目的の逆転

- 既存習慣アプリは「**習慣を身につけることが目的**」(手段の目的化)
- Smitch は「**人生を素晴らしくするのが目的**、習慣はその手段」と置き直す
- 結果として「ストリーク 0 で虚無感」のループから解放される

### 訴求トーン

- 静かな知性 / 寄り添うが押し付けない / "研究によると" レベルのわかりやすさ
- 鈴木祐 / 池谷裕二 / 中野信子 系の言い回しを許容、論文 PDF の直接引用は NG
- 「すごい！」「最高！」のような感情煽りはトーンに反する
- ゲーミフィケーション / ストリーク強調 / 罪悪感ドリブンは NG

---

## LP image-to-code workflow

`_longruns/2026-05-24_lp-image-code-workflow/` で進行中の longrun。
詳細: `plan.md` / `docs/design/DESIGN.md` / `docs/design/prompts/section-prompt-template.md` / `docs/research/lp-image-to-code-workflow-2026.md`。

### ワークフローサマリ

1. **Codex CLI (gpt-image-2)** で reference 16 枚 + Smitch Style Block を渡して section 画像を生成
2. ユーザーが variants から 1 つ curate → `public/landing/<section>.png`
3. **Claude Code (frontend-design plugin + shadcn skill)** で section ごとに React component を実装
4. `src/app/marketing/page.tsx` で統合 (change-H のみが触る)

### Codex 呼び出しラッパ

```bash
bash scripts/codex-image-gen.sh --prompt-file <filled-prompt> --refs docs/design/brand-references --n 4 --size 2048x1152
```

### DESIGN.md 同期チェック

```bash
bash scripts/check-design-md-sync.sh
```

---

## Hard Rules (LP image-to-code)

リサーチドキュメント §3.3 ベース + Smitch 確定値。**enforceable** rule (aspirational ではない)。
本ルールは Codex 画像プロンプトと Claude Code の実装プロンプトに **毎回 append される前提**。

### Stack rules

- Next.js 16 **App Router only**。`pages/` directory は使わない
- **Tailwind v4** (`@plugin` directive、`@import` は plugin 用には使わない)
- **shadcn/ui primitives 必須**: Button / Card / Dialog / Form / Input / Label / Checkbox / Select / Textarea
- shadcn 同等品があれば独自実装禁止 (hand-rolled button は NG)
- 全色は **CSS variables** (`var(--primary)` 等) 経由。JSX 内 hard-coded HEX は NG
- 全画像は **next/image** 必須 (alt text 必須)

### Typography

- 禁止フォント: **Inter** / Roboto / Arial / system fonts / Space Grotesk / Comic Sans / Bebas Neue
- LP body は **Public Sans** (or 既存継続なら Geist Sans)、display は **Lora**
- セクション内 hierarchy level は最大 3

### Spacing

- **8px rhythm** 厳守 (Tailwind `2` = 8px = 1 unit)
- Section vertical padding: desktop `>= 96px` / mobile `>= 64px`

### Color

- accent 色は 1 つだけ (Deep Indigo `--primary` = `#2B4162`)
- impact 軸 (health / cost / income) のみ別配色を許可
- 背景は単色 OR 微細 grain。**Smooth gradient on solid background は NG**

### Motion budget

- LP 全体で **2 つの animation のみ**: page load staggered reveal + primary CTA hover
- **No scroll-jacking. No parallax.** Lovable-style "everything vibrates" は NG
- **prefers-reduced-motion** に従って全 motion を停止 (WCAG 2.3.3)

### A11y

- **WCAG AA contrast** (本文 4.5:1 / large text 3:1) 最低保証
- 全 interactive element は **keyboard navigable**
- focus ring は `var(--ring)` で常時可視

### Banned visuals (画像生成 + 実装 共通)

- **Purple gradients** on white background ("AI slop" 代表)
- **Inter / Roboto** など禁止フォントが画像内に可視
- **Glass orb** / 3D blob / liquid metal
- Generic **stock-photo people** smiling at camera
- Hands holding phones with "social media flex" body language
- **Streak counters** / gamification badges
- Two primary buttons side-by-side
- Plant anthropomorphism ("習慣を育てる" 系メタファー)

---

## Workflow rules (autonomous runs)

- 本リポジトリは worktree (`.superset/worktrees/...`) で並列 longrun を回すパターン
- `_longruns/<date>_<slug>/plan.md` / `decisions.md` / `verification-guide.md` が longrun の主要参照
- TDD 厳守: failing test → minimal implementation → all tests pass → mark `[x]`
- `AskUserQuestion` ツール禁止 (自律実行が前提)
- 設計判断は `_longruns/.../decisions.md` に D-X-N 形式で記録

### コミット粒度

- 細かい単位 (1 機能 / 1 修正 / 1 ステップ) でコミット
- メッセージ末尾に `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- main / master への直接 push は **明示承認なしには NG**

---

## 重要ファイルマップ

| カテゴリ | パス |
|---|---|
| 既存アプリ design system | `DESIGN.md` (root) |
| LP design system | `docs/design/DESIGN.md` |
| LP Codex prompt テンプレ | `docs/design/prompts/section-prompt-template.md` |
| LP brand references | `docs/design/brand-references/` |
| LP リサーチ | `docs/research/lp-image-to-code-workflow-2026.md` |
| Tailwind tokens (権威) | `src/app/globals.css` |
| middleware (host 判定) | `src/middleware.ts` |
| 既存 marketing LP | `src/app/marketing/` (change-H で全面置換予定) |
| shadcn primitives | `src/components/ui/` |
| Supabase migrations | `supabase/migrations/` |
| 進行中 longrun | `_longruns/2026-05-24_lp-image-code-workflow/` |

---

## テスト / lint / ビルド

```bash
npm run test:run     # vitest (全 PASS が前提)
npm run lint         # eslint
npm run build        # next build (型チェック含む)
npx playwright test  # E2E (e2e-verify.spec.ts)
```

regression を起こさないこと。既存 197 vitest tests を壊した場合は必ず原因を特定して直す (skip 禁止)。
