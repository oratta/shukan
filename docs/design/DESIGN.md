# Smitch LP — DESIGN.md

権威ソース (single source of truth) for Smitch LP (`www.s-mitch.com`) の design system。
Codex CLI による image generation と、Claude Code (frontend-design plugin) によるコード化の両方が本ファイルを参照する。

**スナップショット元**: `src/app/globals.css` の `:root { ... }` (Tailwind v4 / shadcn new-york style)。
**同期検証**: `bash scripts/check-design-md-sync.sh` を手動実行。差分があれば本ファイルを更新する (globals.css が権威)。

> 既存 `DESIGN.md` (リポジトリ root) は Smitch アプリ内 design system 用。本ファイルは LP image-to-code 専用。役割を分離している。

---

## Color Palette

### Brand essence

Smitch のパレットは「**Deep Indigo + Slate** をベースに、impact 軸 (health / cost / income) のみ別配色」という構造。
紫グラデーション ("AI slop" の典型) を排し、editorial で knowledge-worker のトーンを保つ。

### :root tokens (light mode, OKLCh が権威 / HEX は Codex Style Block 用概算)

| Token | OKLCh | HEX (概算) | 役割 |
|---|---|---|---|
| `--background` | `oklch(0.98 0.002 250)` | `#F8F9FA` | ページ背景 (ほぼ白に微かな寒色) |
| `--foreground` | `oklch(0.35 0.05 250)` | `#2B4162` | 本文 (Deep Indigo) |
| `--primary` | `oklch(0.35 0.05 250)` | `#2B4162` | CTA / ブランドアクセント (Deep Indigo) |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | CTA 上のテキスト |
| `--secondary` | `oklch(0.96 0.01 250)` | `#F0F2F5` | 補助面 |
| `--secondary-foreground` | `oklch(0.35 0.05 250)` | `#2B4162` | 補助面のテキスト |
| `--muted` | `oklch(0.96 0.01 250)` | `#F0F2F5` | 控えめな面 |
| `--muted-foreground` | `oklch(0.55 0.015 260)` | `#6B7280` | キャプション / 二次情報 |
| `--accent` | `oklch(0.96 0.01 250)` | `#F0F2F5` | hover / focus 背景 |
| `--accent-foreground` | `oklch(0.35 0.05 250)` | `#2B4162` | accent 上のテキスト |
| `--destructive` | `oklch(0.65 0.12 30)` | `#D08068` | エラー / 失敗 (warm coral) |
| `--border` | `oklch(0.86 0.01 250)` | `#C9D1D9` | 区切り線 |
| `--input` | `oklch(0.86 0.01 250)` | `#C9D1D9` | 入力枠 |
| `--ring` | `oklch(0.65 0.15 250)` | `#4A8FE7` | focus ring (lighter blue) |
| `--success` | `oklch(0.55 0.15 155)` | `#3D8A5A` | 成功 / ポジティブ |
| `--warning` | `oklch(0.7 0.12 85)` | `#D4A843` | 注意 |

### Impact axis tokens (バリュー軸の可視化、change-F で使用)

| Token | OKLCh | HEX (概算) | 軸 |
|---|---|---|---|
| `--impact-health` | `oklch(0.55 0.15 155)` | `#3D8A5A` | 健康 (forest green) |
| `--impact-cost` | `oklch(0.65 0.12 85)` | `#B8860B` | コスト削減 (warm gold) |
| `--impact-income` | `oklch(0.55 0.12 250)` | `#4A6FB7` | 収入 (muted blue) |
| `--impact-bg` | `oklch(0.97 0.01 85)` | `#FFF8F0` | impact セクション背景 (cream) |

### Chart tokens

| Token | OKLCh |
|---|---|
| `--chart-1` | `oklch(0.65 0.15 250)` (blue) |
| `--chart-2` | `oklch(0.55 0.12 155)` (green) |
| `--chart-3` | `oklch(0.75 0.12 85)` (amber) |
| `--chart-4` | `oklch(0.65 0.12 30)` (coral) |
| `--chart-5` | `oklch(0.7 0.015 260)` (neutral) |

### Dark mode

dark mode は `:root.dark` で別定義 (globals.css L104-145 参照)。LP は light mode を default とするが、`next-themes` に従って dark にも対応する。

---

## Typography

### 方針

Smitch の "editorial / quiet / evidence-leaning" トーンを出すため、**editorial serif + humanist sans** の 2 fonts 構成を採用する。
具体的フォント名は Build フェーズで最終確定するが、候補は以下:

### Display / Editorial (Hero headline、evidence quote)

候補:
1. **Lora** (Google Fonts, free, editorial serif、Smitch の "research summary" トーンに親和)
2. **Source Serif 4** (Adobe → Google, free, narrative-friendly)
3. **Newsreader** (Google Fonts, free, "long-form reading" 想定で設計)

→ 第一候補 **Lora** (license: SIL OFL)

### Body / UI (sans, humanist)

候補:
1. **Public Sans** (US Web Design System 由来、humanist で実直)
2. **IBM Plex Sans** (engineering ベンダー製でクセが少なく editorial と合う)
3. **Geist Sans** (既存アプリで使用中、継続採用も検討)

→ 第一候補 **Public Sans** (本文用)、アプリ内継続性を優先するなら **Geist Sans** に振る

### 禁止フォント (画像生成 + 実装 共通)

- Inter (デフォルト収束 / "AI slop" 代表)
- Roboto / Arial / system fonts
- Space Grotesk (Inter の "次のデフォルト" として収束しがち)
- Comic Sans / Papyrus (言うまでもなく)
- Monoton / Bebas Neue (派手すぎる display フォント)

### Scale (LP 用、8px rhythm 準拠)

| Level | Mobile | Desktop | Weight | 用途 |
|---|---|---|---|---|
| Display | 32px | 48px | 600 | Hero headline |
| H1 | 28px | 40px | 600 | セクション見出し |
| H2 | 22px | 28px | 600 | サブセクション |
| H3 | 18px | 20px | 600 | カード見出し |
| Body | 16px | 17px | 400 | 本文 |
| Caption | 14px | 14px | 500 | キャプション / フォームラベル |
| Micro | 12px | 12px | 500 | フッター / 法的注記 |

---

## Spacing & Rhythm

### 8px base rhythm (Tailwind v4 default)

全ての spacing / sizing を **8px の倍数** に揃える (Tailwind `4` = 16px = 2 unit、`2` = 8px = 1 unit)。

| Tailwind | px | 用途 |
|---|---|---|
| `1` | 4 | 半 unit (アイコンと文字の隙間など特例のみ) |
| `2` | 8 | 1 unit (最小 gap) |
| `4` | 16 | 2 unit (本文の段落間) |
| `6` | 24 | 3 unit (カード内 padding) |
| `8` | 32 | 4 unit (セクション内 block 間隔) |
| `12` | 48 | 6 unit (mobile セクション間 padding) |
| `16` | 64 | 8 unit (mobile セクション垂直 padding) |
| `24` | 96 | 12 unit (desktop セクション垂直 padding) |
| `32` | 128 | 16 unit (Hero 上下余白) |

### Container / breakpoints

- **Container max-width**: `max-w-6xl` (1152px) — LP は読み物寄り
- **Section padding**: mobile `py-16 px-4`、desktop `py-24 px-8`
- **Breakpoints** (Tailwind default): sm 640 / md 768 / lg 1024 / xl 1280

---

## Motion Budget

LP 全体で **2 つの animation moment のみ** に絞る (リサーチ §3.3 hard rule)。

1. **Page load**: `staggered reveal` (Hero copy 3 行を 100ms 遅延ずつ fade-in、合計 300ms 以内)
2. **Primary CTA hover**: 1.02x scale + 150ms ease-out

### 禁止

- Scroll-jacking (snap scroll 含む)
- Parallax 全般
- "everything vibrates" Lovable-style micro-interactions
- スクロール連動の opacity / transform (intersection-observer 系も Hero 以外は禁止)

### prefers-reduced-motion

OS 設定で reduced-motion が有効な場合、上記 2 つの motion も無効化し、static で表示する (WCAG 2.3.3)。

---

## Hard Rules

LP image-to-code workflow の "enforceable" rule (リサーチ §3.3 ベース + Smitch 値)。
Claude Code は本セクションを Codex プロンプトや実装プロンプトに毎回 append する。

### Stack

- Next.js 16 App Router only (`pages/` directory 禁止)
- Tailwind v4 (`@plugin` directive for plugins; old `@import` syntax は使わない)
- shadcn/ui primitives 必須: Button / Card / Dialog / Form / Input / Label / Checkbox / Select / Textarea
- shadcn 同等品があれば独自実装禁止 (hand-rolled button 禁止)
- 全色は CSS variables (`var(--primary)` 等) 経由。JSX 内 hard-coded HEX 禁止
- 全画像は `next/image` (alt text 必須)

### Typography

- 上記 "禁止フォント" を使わない
- Body は **Public Sans** (or 継続なら Geist Sans)、Display は **Lora**
- セクション内の hierarchy level は **最大 3** まで

### Spacing

- 8px rhythm 厳守 (上記 Spacing & Rhythm 参照)
- Section vertical padding: desktop `>= 96px` / mobile `>= 64px`

### Color

- accent 色は 1 つだけ (Deep Indigo `--primary`)
- impact 軸 (health / cost / income) のみ別配色を許可
- 背景は単色 OR 微細 grain。**Smooth gradient on solid background 禁止**

### Motion budget (再掲)

- Page load reveal + Primary CTA hover の 2 つのみ
- prefers-reduced-motion で全 motion 停止

### A11y

- WCAG AA contrast 最低保証 (本文 4.5:1, large text 3:1)
- 全 interactive element が keyboard navigable
- focus ring は `--ring` (`#4A8FE7`) で常時可視

### Banned visuals (画像生成 + 実装 共通)

- Purple gradients on white background (AI slop の代表)
- Glass orb / 3D blob / liquid metal
- Generic stock-photo people (smiling at camera)
- Streak counters / gamification badges
- Two primary buttons side-by-side
- 植物擬人化メタファー (「習慣を育てる」系)

---

## AI Generation Style Block

Codex CLI に渡す全プロンプトの末尾に append する固定ブロック。
本ブロックは `docs/design/prompts/section-prompt-template.md` の "§6 Project Style Block" の権威ソース。

```
[Project Style Block: Smitch]
- Brand essence: science × soul, evidence-based life path builder. "Switch your path."
- Tone: quiet, intentional, no-glare; introspective rather than performative
- Audience: 30s-40s knowledge workers who reject pseudoscience and SNS-flex culture; readers of pop-science books (鈴木祐 / 池谷裕二 / 中野信子 系)
- Color palette: primary #2B4162 (Deep Indigo), secondary #4A8FE7 (Blue), background #F8F9FA, foreground #2B4162, impact-health #3D8A5A, impact-cost #B8860B, impact-income #4A6FB7
- Typography mood: editorial serif for evidence claims (Lora), clean humanist sans for UI (Public Sans). Never Inter / Roboto / Space Grotesk / Arial / system fonts.
- Lighting: soft, diffused, slightly desaturated; never high-contrast tech-bro
- Composition: editorial asymmetry, off-center subject, generous negative space on the left for headline overlay
- Forbidden: purple gradients, neon / cyberpunk, glass orbs, stock-photo smiling people, streak counters, gamification badges, perfect symmetry, eye-contact-with-camera
```

---

## 参考

- `src/app/globals.css` — token 定義の権威ソース (本ファイルはそこからのスナップショット)
- `src/components/ui/` — 既存 shadcn primitives (本 LP で再利用)
- `src/components/ui/smitch-logo.tsx` — Smitch ロゴコンポーネント (画像生成では参照のみ、合成はコード側で)
- `docs/research/lp-image-to-code-workflow-2026.md` — 本 design の出典 (§2.2 Style Block / §3.3 Hard Rules / §5.1 prompt template)
- `_longruns/2026-05-24_lp-image-code-workflow/plan.md` — visual トーン / NG ビジュアル 12 項目の確定版
