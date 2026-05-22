# LP 画像生成 → コード化ワークフロー リサーチ (2026年5月)

> Smitch（エビデンスベースのライフパスビルダー / "Switch your path."）の LP 制作にあたって、
> AI 画像生成 → コード化フローで「ブランドコンセプト重視 × 1人開発 × Next.js 16 / Tailwind 4 / Shadcn UI」
> の制約下で最高品質を出すための調査レポート。
>
> 調査日: 2026-05-22
> 対象: Codex CLI + Claude Code を主軸にした indie dev 向けスタック

---

## エグゼクティブサマリー（先に結論）

| 観点 | 推奨 |
| --- | --- |
| **総合推奨ワークフロー** | **「Codex CLI (gpt-image-2) で hero / セクション画像生成 → Claude Code (frontend-design plugin + DESIGN.md + shadcn skill) でコード化」のハイブリッド** |
| **理由** | (1) Smitch の「科学 × 魂」二面性は v0 / Lovable / Bolt の "AI ぽい polish" では出しにくい (2) Codex CLI の gpt-image-2 は **16 枚までの reference image を style anchor として扱える**ため、ブランドコントロールが効く (3) Claude Code 側の `frontend-design` plugin (Anthropic 公式, 45 万 install) が "AI slop" を構造的に回避する (4) ユーザーは既に Codex + Claude Code に習熟済み、外部ツール追加コスト不要 |
| **段階的アプローチ** | ① Codex CLI でブランド参照 16 枚 → ムード絵 1 枚 (1024×1024) → ② セクション別 hero (2K〜4K) → ③ Claude Code で `frontend-design` + screenshot を読み込ませてセクション単位で実装 → ④ レイアウト・モーション・コピーを iteration |
| **次点** | Google Stitch + Claude Code MCP (DESIGN.md ワークフロー) — もし Codex の image quota がボトルネックなら有力 |
| **避けるべき** | v0 / Lovable / Bolt 単体で完結させる ("Inter + 紫グラデ + 角丸カード" の AI slop が出やすく、Smitch の "静かに寄り添う" トーンと噛み合わない) |

---

## 1. AI 画像生成 → LP コード化 ワークフロー比較 (2026年)

### (A) Codex CLI image generation → Claude Code でコード化 ★ Smitch 推奨

**現状 (2026 年 5 月時点)**

- 2026-04-21 に OpenAI が `gpt-image-2` をリリース、Codex CLI のデフォルトに昇格
- 1K / 2K / 4K native rendering、**最大 16 枚の reference image を style anchor として扱える**
- ChatGPT Plus ($20/月) でも Codex 内蔵画像生成が使える（API キー不要、quota 内）
- 画像生成は通常の Codex turn の **3〜5 倍速で quota を消費**するので量産には注意
- 生成物は `~/.codex/generated_images/` に着地 → プロジェクトの `public/` へ移動

**強み**

- ブランド reference を **1 つのフォルダにまとめて投げ込むだけで style anchor になる**（旧 Midjourney + Notion mood board の手間が消える）
- O-series reasoning loop の中で動くため、「ヒーローに hero と整合する pricing 画像も生成」のような **構造的一貫性**が出やすい
- Claude Code とのバトンパスがファイルベースで完結（外部 SaaS 不要）
- Alt text 自動生成（next/image にそのまま貼れる）

**弱み**

- 透明背景＋寸法厳密制約は弱い（マスキング 2 段階が必要）
- 高解像度の繰り返し編集はクレジット浪費しやすい
- 厳密なロゴ再現は不可（モデルは concept は理解するが vector は崩す）→ ロゴは合成

**コスト感**: ChatGPT Plus $20/月 で 1 LP 分は楽勝。Pro $100 の 10x 枠 (2026/5/31 まで promo) なら量産も可。

**Smitch 適合度**: ★★★★★

→ "静かに寄り添う" "エビデンス × 魂" のように **言語化しにくいトーン**を 16 枚 reference で渡せるのが効く。

---

### (B) v0 (Vercel) でデザイン → コード一気通貫

**強み**

- Next.js + Tailwind + shadcn/ui + Radix を前提に最適化（Smitch のスタックと一致）
- コンポーネント単位のコード品質は 3 ツール中トップ（"that's almost shippable as-is"）
- Claude Code に貼り付けて refactor も容易

**弱み**

- フルスタックでは無い（DB / Auth は別途）
- "Wow factor" / 大胆な aesthetic は Lovable に劣る
- 初手で **shadcn 標準ルックに収束**しがち → Smitch の独自トーンが消える

**Smitch 適合度**: ★★★☆☆

→ コード品質は高いが、Smitch のような **ブランドコンセプトで差別化したい LP**には地味すぎる結果になりやすい。コンポーネント単位の利用には◎。

---

### (C) Lovable / Bolt.new でフルスタック生成

**Lovable の強み**: 初回で "wow" を出す、Framer Motion / 凝った palette / micro-interaction まで盛り込む。consumer-facing LP に強い。

**Lovable の弱み**: "everything vibrates and moves" 状態になりがち。Smitch の **「見せびらかさない」「静かに寄り添う」**トーンとは正反対。

**Bolt の強み**: 60 秒で叩き台、Multi-Agent Workflow で full-stack が安定。

**Bolt の弱み**: "developer prototype" っぽい出力。polish が要る。

**両方の弱み**: 2026 年でも生成コードに **40-45% の脆弱性発生率**。本番投入前に security review 必須。

**Smitch 適合度**: ★★☆☆☆（Lovable）/ ★★☆☆☆（Bolt）

→ Lovable は派手すぎ、Bolt は地味すぎ。Smitch の **抑制されたトーン × エビデンスの硬さ**には噛み合わない。

---

### (D) Google Stitch → Claude Code (DESIGN.md ワークフロー)

**現状**

- 2026-05 の I/O update で **Stitch Agent** が canvas にリアルタイムで UI を流し込む方式に進化
- DESIGN.md (Apache 2.0, 2026-04 OSS 化) を export → Claude Code に MCP で渡す
- Free で 350 generations/月 (Gmail だけで OK)

**強み**

- **DESIGN.md が persistent context** として機能 → ページ 10 枚目もページ 1 枚目と同じ design system を維持
- "design は static deliverable じゃなく continuous flow" → Stitch でデザイン更新 → Claude Code が即追従
- MCP 経由でコピペ不要

**弱み**

- 出力は generic に寄りがち（独立レビューで指摘されている）
- color contrast / accessibility は手動レビュー必須
- Stitch の "vibe design" に乗ると **Gemini 2.5 Pro 風の感覚的選択**に押し戻されることがある

**Smitch 適合度**: ★★★★☆

→ **次点で強い**。Codex の image quota が足りなくなったら乗り換え候補。DESIGN.md という format 自体は Smitch でも採用価値が高い（Claude Code が読む persistent context として）。

---

### (E) Midjourney / Figma AI → Claude Code

**強み**: Midjourney V7 は依然として **アートディレクション特化**で最高峰。Figma AI は構造化が得意。

**弱み**:
- Midjourney は Discord / Web UI 経由 → indie dev の terminal flow に乗らない
- Figma AI は Figma sub に縛られ、indie には overkill

**Smitch 適合度**: ★★☆☆☆

→ Midjourney でムードボード生成 → Codex CLI で再構成、というハイブリッドはアリだが、運用負荷が増える。

---

### (F) 2026 年に台頭した他フロー

- **Anima Playground**: design + preview + code + DB を一画面に統合。indie には強い候補だが Smitch の "1人開発 × 既存スタック" には組み込みづらい
- **Relume**: sitemap / wireframe を秒速生成 → Figma export。LP の構造設計フェーズに有用
- **Aidesigner + Claude Code**: MCP 経由で「画像生成 → Claude Code に URL を渡す」を回す indie 御用達フロー（"each tool does the job it's actually best at" の典型）

---

### 結論: Smitch にとっての品質ベスト

**「Codex CLI (gpt-image-2) で reference-driven 画像生成 → Claude Code + frontend-design plugin + DESIGN.md + shadcn skill でコード化」**

理由:

1. **ブランドコンセプト保護**: 16 枚 reference image で "科学 × 魂" の二面性を style anchor として固定できるのは現状 Codex だけ
2. **AI slop 回避**: Anthropic 公式の `frontend-design` plugin (45 万 install) が "Inter / 紫グラデ / 角丸カード" の AI slop を構造的に禁止する
3. **既存ワークフロー親和性**: ユーザーは Codex + Claude Code に習熟済み、追加学習コスト最小
4. **コード品質**: shadcn skill + components.json で Smitch の Next.js 16 / Tailwind 4 / shadcn 構成に即適合
5. **段階的 iteration**: 1 枚絵 → セクション → コード という非破壊的なフローで品質を磨ける

---

## 2. Codex 画像生成プロンプト設計ベストプラクティス (2026)

### 2.1 基本構造（GPT Image 2 公式 + コミュニティのベスト）

OpenAI Cookbook と複数のコミュニティガイドで **収束しているテンプレート**:

```
Scene → Subject → Important details → Use case → Constraints
```

- **最初の ~50 単語が disproportionate weight**: 核となる subject / composition / style を front-load
- 詳細を後ろに置くと dilute される

### 2.2 ブランドコンセプトを画像に転写する方法

**Project Style Block（全プロンプト末尾に追記する固定ブロック）**

```
[Project Style Block: Smitch]
- Brand essence: science × soul, evidence-based life path builder
- Tone: quiet, intentional, no-glare; introspective rather than performative
- Audience: self-improvers who reject "5am wake-up" pseudoscience
- Color palette: [primary HEX], [secondary HEX], [accent HEX]
- Typography mood: editorial serif for evidence claims, clean sans for UI
- Forbidden: purple gradients, neon, "tech startup" cliché, social-media flex aesthetics
- Lighting: soft, diffused, slightly desaturated; never high-contrast tech-bro
```

これを **全画像プロンプト末尾に必ず append**。

### 2.3 Reference image の役割を明示する（最重要）

❌ **NG**: 16 枚アップロードして "make it like this"

✅ **OK**: 各画像に **role label**:

```
- Image 1: brand color reference (use these exact hues)
- Image 2-4: lighting & mood reference (soft, introspective)
- Image 5-7: composition reference (negative space for copy on left)
- Image 8-12: typography & layout reference
- Image 13-16: anti-reference (avoid this generic-tech aesthetic)
```

**Preserve / Change を明示的に分離**:

```
Preserve from references: lighting mood, palette saturation, negative space ratio
Change: subject is now [Smitch app UI floating in...], composition shifted to [right-weighted]
```

### 2.4 段階的アプローチ: ワイヤー → ムード → ハイファイ

Smitch では **3 段階を強く推奨**:

| Phase | 出力 | プロンプト方針 |
| --- | --- | --- |
| **Phase 1: Mood board** | 1024×1024 mood absract × 3-5 枚 | "Capture the emotional essence of Smitch — quiet evidence-based self-improvement. No UI, no text, just light, color, texture." |
| **Phase 2: Section hero** | 2048×1152 (16:9) × 各セクション | Hero / Why Smitch / How it works / Evidence / CTA を **同じ style anchor 16 枚で連続生成** |
| **Phase 3: Detail / asset** | 各種 1024×1024 | アイコン、small illustration、background texture |

**1 枚絵で LP 全体を一度に出さない**。

理由: 解像度・composition・text-safe zone が破綻しがち、修正コストが scenario あたり 5-10x。

### 2.5 ネガティブプロンプト / 避けるべき指示

**Smitch のブランドに対する明示禁止リスト**（プロンプトに毎回入れる）:

```
DO NOT include:
- purple gradients on white background
- "tech bro" neon / cyberpunk aesthetic
- Inter, Roboto, generic system fonts
- 3-column feature grid with rounded cards
- Hands holding phones / generic stock-photo people
- Flexing / showing-off body language
- Streak counters, gamification badges
- "AI-generated" giveaways: smooth glass orbs, generic gradients, perfect symmetry
- Watermarks, borders, studio logos
```

### 2.6 「AI ぽさが出る」失敗パターンと回避テクニック

| 失敗パターン | 原因 | 回避策 |
| --- | --- | --- |
| 全部 Inter で揃う | デフォルト収束 | フォントを明示 + "Space Grotesk も避ける"（次のデフォルト先回り禁止） |
| 紫グラデ on 白 | 統計的中央値 | "no purple, no white-bg gradient, use [hex] solid + grain texture" |
| Glass orb / 球体 | gpt-image-2 の好物 | "no glass spheres, no 3D blobs, prefer flat editorial" |
| 全部 symmetric | 安全策収束 | "asymmetric composition, off-center subject, magazine-editorial layout" |
| Stock-people 笑顔 | training data 偏り | "no people, OR if people, candid documentary-style, no eye contact with camera" |

### 2.7 制約は description ではなく **machine-readable constraint** で書く

❌ "Clean layout"
✅ "Max 3 visual hierarchy levels per section; primary action occupies ≥40% of visual weight; negative space ratio ≥35%"

---

## 3. 画像 → コード変換時の品質ベストプラクティス

### 3.1 画像をどう渡すか

**推奨**: **セクション分割で渡す**

- 1 枚絵全体を渡すと Claude Code は overall composition に注目するが、各セクションの細部が薄まる
- セクション単位（hero / features / evidence / pricing / footer）に切って **1 セクション = 1 プロンプト**で実装

### 3.2 一緒に渡すべき context

```
1. [screenshot of section]
2. DESIGN.md（color tokens / typography / spacing / motion budget）
3. components.json（shadcn 設定）
4. 参照すべき既存ファイル（"follow the same composition style as src/components/X.tsx"）
5. 明示的な hard rules（"use shadcn Button, no hand-rolled buttons"）
6. Tailwind v4 の syntax 注意（@plugin、container queries は core）
```

### 3.3 Tailwind 4 + shadcn + Next.js 16 で守るべきルール

**CLAUDE.md / DESIGN.md に書く prescriptive rules（"aspirational" でなく "enforceable"）**:

```markdown
# Hard Rules (Smitch LP)

## Stack
- Next.js 16 App Router only. No `pages/` directory.
- Tailwind 4 (`@plugin` directive for plugins; no `@import` for plugins)
- shadcn/ui primitives are mandatory: Button, Card, Dialog, Form
- No hand-rolled component if shadcn equivalent exists
- All colors via CSS variables in globals.css. Never hard-coded hex in JSX.
- next/image for all visuals (with alt text from Codex prompt response)

## Typography
- NEVER Inter, Roboto, Arial, Space Grotesk, or system fonts
- Body: [chosen sans]
- Display: [chosen serif/display]
- Max 3 hierarchy levels per section

## Spacing
- 8px rhythm. Tailwind `4` = 16px = base unit
- Section vertical padding ≥ 96px desktop, ≥ 64px mobile

## Color
- One primary accent only. No rainbow.
- Restrained: black, white, one accent + one supporting neutral
- Background never solid — always grain texture or subtle gradient mesh

## Motion budget
- Two animation moments only: page load (staggered reveal) + primary CTA hover
- No scroll-jacking. No parallax. No "everything vibrates" Lovable-style.

## Banned
- Purple gradients
- Glass-orb 3D blobs
- Generic stock-photo people
- Streak counters / gamification visuals
- Two primary buttons side-by-side
```

### 3.4 レスポンシブ / アクセシビリティ / モーションの指示

```
- Responsive: mobile-first, breakpoints at sm/md/lg/xl (tailwind default)
- Container query first when sidebar exists; viewport query for top-level layout
- A11y: WCAG AA contrast min; all interactive elements keyboard-navigable
- Motion: respect prefers-reduced-motion; fallback to no animation
- Image: next/image with priority on hero, lazy on others; provide width/height
```

### 3.5 段階的に磨くアプローチ

**1 回で完成させようとしない**。Phased prompts:

1. **Phase A (plan)**: 画像を見せて "Don't write code yet. Give me a build plan: component breakdown, shadcn primitives to use, motion list, accessibility considerations."
2. **Phase B (skeleton)**: "Build the structural skeleton with placeholder text. No styling beyond base layout."
3. **Phase C (styling)**: "Now apply the visual styling matching the screenshot. Use only DESIGN.md tokens."
4. **Phase D (motion)**: "Add the motion budget items only. No scroll effects."
5. **Phase E (audit)**: "Review this component against frontend-design skill and DESIGN.md. List what's still generic."

各 phase で commit する → revert しやすい。

### 3.6 既存ファイルを style anchor として参照

最強テクニック:

> "Build the attached screenshot as a component, following the same composition style as `src/components/Header.tsx`. Match its spacing rhythm and prop naming."

→ Claude Code は実ファイルを読みに行き、パターンを reproduce する。description より遥かに reliable。

---

## 4. Claude Code + Codex CLI に閉じる場合の最適化

### 4.1 Codex CLI 画像生成の現状（2026 年 5 月）

| 項目 | 現状 |
| --- | --- |
| モデル | gpt-image-2 (2026-04-21, デフォルト) |
| 解像度 | 1K / 2K / 4K native |
| Reference image | 最大 16 枚、role-labeled |
| 出力先 | `~/.codex/generated_images/` |
| Quota | ChatGPT Plus: Codex quota 内、ただし通常 turn の **3-5x 速度で消費** |
| Pro $100 promo | 2026-05-31 まで 10x usage、25x 5-hour limit |
| Plan vs API | Default は ChatGPT 認証（追加料金なし）。API キーモードなら token billing |
| 制約 | 透明背景は弱い / ロゴ厳密再現は不可 / 高解像度反復はクレジット浪費 |

### 4.2 同じ画像から複数バリエーション生成 → 選定 → コード化

**推奨ループ**:

```bash
# Step 1: 4 variants 生成 (1 dimension のみ変える)
codex image --model gpt-image-2-2026-04-21 \
  --refs ./brand/*.png \
  --size 2048x1152 \
  --n 4 \
  --prompt "Hero variants: vary only background texture (grain / mesh-gradient / solid+vignette / paper-fiber). Keep subject identical."

# Step 2: 人間が 1 つ選ぶ → public/hero.png に配置

# Step 3: Claude Code に渡す
# In Claude Code chat:
# "Read public/hero.png + DESIGN.md.
#  Build src/components/landing/Hero.tsx using shadcn primitives,
#  following plan in Phase A. Match screenshot structure, not pixels."
```

**重要原則**: variant は **1 次元のみ変える**（palette / typography / composition のいずれか 1 つ）。複数同時変更は比較不能。

### 4.3 Claude Code に画像を読み込ませるテクニック

- **画像は絶対パスで渡す**: `Read /abs/path/to/hero.png` のほうが Claude Code は確実に読む
- **画像 + DESIGN.md + 参照ファイル + hard rules の 4 点セット**を毎回渡す
- **screenshot + screenshot 比較**: 既存 LP の参考 screenshot も同時に渡すと「これは避けて、こっちに寄せて」が効く
- **frontend-design skill を明示呼び出し**: "Using the frontend-design skill and our DESIGN.md, build..." → スキルが auto-activate されない場合の保険

### 4.4 弱点と回避策

| 弱点 | 回避策 |
| --- | --- |
| Codex の高解像度反復が quota を食う | Phase 1 (mood) は 1K で発散、Phase 2 (hero) のみ 2K-4K に絞る |
| Claude Code は long context で context-rot しがち | セクション単位で session 分割、commit 単位で context リセット |
| Reference image 16 枚を毎回投げると Codex turn 重い | 一度確定した style anchor は `~/.smitch/brand-refs/` にまとめ、必要時のみ投げ直す |
| ロゴ厳密再現不可 | ロゴは Figma / Affinity で別途、コードで合成 (next/image + svg) |
| 透明背景弱い | Phase 3 でマスキング 2 段階（generate → remove.bg or rembg） |
| frontend-design skill が auto-activate しない場合 | プロンプトに `Using the frontend-design skill,` を明示 |

---

## 5. Smitch LP 用 Codex 画像生成プロンプトテンプレート

Claude Code が `docs/context/product-concept.md` / `docs/design/DESIGN.md` を読んで以下のテンプレートを埋める想定。

### 5.1 テンプレート構造

```markdown
# Smitch LP Image Generation Prompt — {{section_name}}

## 0. Meta
- Section: {{section_name}}  e.g. hero / why-smitch / how-it-works / evidence / cta
- Output spec: {{aspect_ratio}} {{resolution}}  e.g. 16:9 2048x1152
- Format: {{format}}  e.g. PNG, sRGB, no alpha
- File destination: public/landing/{{section_slug}}.png

## 1. Scene
{{scene_one_liner}}
  e.g. "A quiet morning workspace, half-finished journal, soft light from window left"

## 2. Subject
{{subject_focus}}
  e.g. "Smitch app UI floating subtly off-center right, showing a single habit card with evidence citation"

## 3. Important Details
- Composition: {{composition}}  e.g. "right-weighted, negative space on left for headline"
- Lighting: {{lighting}}  e.g. "soft diffused window light, slight golden hour warmth, never harsh"
- Mood: {{target_emotion}}  e.g. "quiet determination, introspective, not performative"
- Texture: {{texture}}  e.g. "subtle paper grain, no glossy surfaces"
- Camera/medium: {{medium}}  e.g. "editorial documentary photo, 50mm equivalent, slight film grain"

## 4. Use Case
Hero image for Smitch landing page section "{{section_name}}".
Will be paired with headline copy: "{{headline_draft}}"
Text-safe zone: {{text_safe_zone}}  e.g. "left 40% must remain low-contrast for headline overlay"

## 5. Reference Images (16 max, role-labeled)
- Image 1-3 (palette anchor): {{palette_refs}}
- Image 4-6 (lighting/mood anchor): {{mood_refs}}
- Image 7-9 (composition anchor): {{composition_refs}}
- Image 10-12 (typography/layout anchor, for matching UI): {{ui_refs}}
- Image 13-16 (anti-reference, AVOID this aesthetic): {{anti_refs}}

Preserve from references: {{preserve_list}}
  e.g. "lighting mood, palette saturation, negative space ratio, typography weight"
Change from references: {{change_list}}
  e.g. "subject is now Smitch UI card; composition shifted right-weighted"

## 6. Project Style Block (固定、全プロンプト共通)
- Brand essence: {{brand_essence}}
  e.g. "science × soul — evidence-based life path builder. 'Switch your path.'"
- Tone: {{brand_tone}}
  e.g. "quiet, intentional, no-glare; introspective rather than performative"
- Audience: {{audience}}
  e.g. "self-improvers who reject pseudoscience and SNS-flex culture"
- Color palette: {{color_palette}}
  e.g. "primary #XXXXXX, secondary #XXXXXX, accent #XXXXXX, neutral #XXXXXX"
- Typography mood: {{typography_mood}}
  e.g. "editorial serif for evidence claims, clean humanist sans for UI"

## 7. Hard Constraints (NEVER include)
- NO purple gradients on white background
- NO "tech bro" neon / cyberpunk
- NO Inter / Roboto / Space Grotesk / Arial / system fonts visible
- NO 3-column rounded-card feature grid composition
- NO glass orbs / 3D blobs / smooth gradients with no texture
- NO generic stock-photo people / hands holding phones
- NO flexing / showing-off body language
- NO streak counters / gamification badges
- NO watermarks, borders, studio logos
- NO perfect symmetry (prefer editorial asymmetry)
- NO eye-contact-with-camera if any people appear

## 8. Output Quality
- Quality: high (text-bearing) / medium (illustration) / low (mood draft)
- Variations: {{n_variants}}  e.g. 4
- Vary ONE dimension only: {{vary_dimension}}
  e.g. "background texture (grain / mesh / solid+vignette / paper-fiber)"

## 9. Post-generation
- Save to: ~/.codex/generated_images/{{timestamp}}/
- Human curation: pick 1 variant, copy to public/landing/{{section_slug}}.png
- Next step: hand off to Claude Code with screenshot + DESIGN.md + section plan
```

### 5.2 埋めるべき変数チェックリスト

```
{{section_name}}        必須
{{aspect_ratio}}        必須 (16:9 / 4:5 / 1:1)
{{resolution}}          必須 (1024x1024 / 2048x1152 / 4096x2304)
{{format}}              必須 (PNG / WebP)
{{scene_one_liner}}     必須
{{subject_focus}}       必須
{{composition}}         必須
{{lighting}}            必須
{{mood}}                必須
{{texture}}             推奨
{{medium}}              推奨
{{headline_draft}}      必須（text-safe zone と整合させる）
{{text_safe_zone}}      必須
{{palette_refs}}        必須（最低 3 枚）
{{mood_refs}}           必須（最低 3 枚）
{{composition_refs}}    推奨
{{ui_refs}}             任意
{{anti_refs}}           推奨（"これは避ける" の明示は強力）
{{preserve_list}}       必須
{{change_list}}         必須
{{brand_essence}}       固定（product-concept.md から）
{{brand_tone}}          固定（product-concept.md から）
{{audience}}            固定
{{color_palette}}       固定（DESIGN.md から HEX）
{{typography_mood}}     固定
{{n_variants}}          必須（推奨 4）
{{vary_dimension}}      必須（1 次元のみ）
```

### 5.3 「絶対に含めてはいけない」最終チェックリスト

プロンプト生成後、送信前に以下を確認:

- [ ] "Inter", "Roboto", "Space Grotesk", "system font" が **入っていない**
- [ ] "purple gradient", "neon", "cyberpunk" が **入っていない**
- [ ] "minimalist", "clean", "modern" のような **空虚な形容詞**で済ませていない（具体的な constraint に変換できているか）
- [ ] 参照画像に role label がついている
- [ ] preserve / change が明示分離されている
- [ ] Project Style Block が末尾に append されている
- [ ] vary する dimension が 1 つだけに絞られている
- [ ] text-safe zone が指定されている（headline overlay 想定）
- [ ] aspect ratio / resolution が用途に合っている

---

## 6. 実装フロー（Smitch LP の場合の具体的手順）

### Step 1: 準備
1. `docs/design/DESIGN.md` を新規作成（color palette / typography / spacing / motion budget / hard rules）
2. `docs/design/brand-references/` に 16 枚の reference image を集める（palette / mood / composition / anti-ref に分類）
3. Claude Code に `frontend-design` plugin を install: `/plugin install frontend-design@anthropic`
4. shadcn skill + MCP を install: `claude mcp add shadcn -- npx shadcn@latest mcp`
5. CLAUDE.md に prescriptive hard rules を追記（§3.3 のテンプレ）

### Step 2: セクション設計
1. LP の section list を確定: `hero / why-smitch / how-it-works / evidence / cta / footer`
2. 各セクションの headline draft を書く（画像と矛盾しないように）
3. 各セクションの text-safe zone を決める

### Step 3: 画像生成
1. Phase 1: mood board を 1024×1024 で 4-8 枚 (low quality) 発散
2. 人間が方向性を 1 つ決める
3. Phase 2: 各セクションの hero 画像を 2048×1152 (high quality) で 4 variants 生成（vary one dimension）
4. 人間が curate → `public/landing/{section}.png` に配置

### Step 4: コード化
1. Claude Code で section ごとに新 session を開く
2. 各 session で：DESIGN.md + screenshot + components.json + 参照ファイル + hard rules を渡す
3. Phased prompt: plan → skeleton → styling → motion → audit
4. 各 phase で commit

### Step 5: 統合 & 仕上げ
1. 全 section を `app/(marketing)/page.tsx` で組み立て
2. `frontend-design` audit pass: "Review against DESIGN.md. What's still generic?"
3. Lighthouse / a11y チェック
4. 微調整は手で

---

## 7. 出典

### Codex CLI / GPT Image 2

- [CLI – Codex | OpenAI Developers](https://developers.openai.com/codex/cli)
- [Image Generation in Codex CLI: gpt-image-2 (Daniel Vaughan, 2026-04)](https://codex.danielvaughan.com/2026/04/27/codex-cli-image-generation-gpt-image-2-visual-development-workflows/)
- [Working with Images in Codex CLI (Daniel Vaughan, 2026-03)](https://codex.danielvaughan.com/2026/03/28/codex-cli-image-workflows/)
- [GPT Image Generation Models Prompting Guide (OpenAI Cookbook)](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide)
- [GPT Image 2 Prompt Guide (PixVerse)](https://pixverse.ai/en/blog/gpt-image-2-review-and-prompt-guide)
- [GPT Image 2 Prompting Guide and Examples (fal.ai)](https://fal.ai/learn/tools/prompting-gpt-image-2)
- [GPT-Image-2 for Brand Style Guides (CapCut)](https://www.capcut.com/ideas/gpt-image-2/gpt-image-2-for-brand-style-guides)
- [GPT Image 2 Reference Image Prompts (ChatGPT Images)](https://chatgptimages.app/guides/gpt-image-2-reference-image-prompts)
- [Codex Pricing](https://developers.openai.com/codex/pricing)
- [Codex rate card | OpenAI Help Center](https://help.openai.com/en/articles/20001106-codex-rate-card)

### Claude Code / Frontend Design

- [Frontend Design – Claude Plugin (Anthropic)](https://claude.com/plugins/frontend-design)
- [Frontend Design SKILL.md (GitHub anthropics/claude-code)](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- [Skills - shadcn/ui](https://ui.shadcn.com/docs/skills)
- [shadcn/ui + Claude Code: 3 Settings That Fix AI-Generated UI Quality](https://dev.to/_46ea277e677b888e0cd13/shadcnui-claude-code-3-settings-that-fix-ai-generated-ui-quality-2dea)
- [Best Practices for CLAUDE.md (2026)](https://amitray.com/best-practices-for-claude-md/)
- [Claude Code Frontend Design Toolkit (Wilwaldon)](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)

### Google Stitch / DESIGN.md

- [How to Use Google Stitch's DESIGN.md File with Claude Code (MindStudio)](https://www.mindstudio.ai/blog/google-stitch-design-md-claude-code-consistent-ui)
- [The DESIGN.md Workflow (Design Systems Collective, 2026-04)](https://www.designsystemscollective.com/the-design-md-workflow-how-google-stitch-claude-code-quietly-changed-the-design-to-code-handoff-c4213f97ed8f)
- [Google Stitch MCP: From Design to Code (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/647/google-stitch-mcp-export-claude-code-design-to-code)
- [Google Stitch Launches Real-Time AI Agent (TechTimes, 2026-05-20)](https://www.techtimes.com/articles/316903/20260520/google-stitch-launches-real-time-ai-agent-multiplayer-editing-figma-charges-15-seat.htm)

### v0 / Lovable / Bolt 比較

- [Lovable vs Bolt vs v0: We Tested All 4 AI Builders (DesignRevision)](https://designrevision.com/blog/forge-vs-bolt-vs-lovable-vs-v0-comparison)
- [v0.dev vs Bolt.new vs Lovable: Complete Generative UI Comparison (NextFuture)](https://nextfuture.io.vn/blog/v0-dev-vs-bolt-new-vs-lovable-comparison-2026)
- [Vibe Design Tools 2026: Stitch vs v0 vs Lovable vs Bolt (NxCode)](https://www.nxcode.io/resources/news/vibe-design-tools-compared-stitch-v0-lovable-2026)
- [Best AI App Builder 2026 (Mocha)](https://getmocha.com/blog/best-ai-app-builder-2026)
- [Bolt vs Lovable vs v0: Best AI App Builder for Indie Hackers (Vibepreneur)](https://thevibepreneur.com/blog/bolt-vs-lovable-vs-v0-ai-app-builder)

### "AI Slop" 回避 / Aesthetic Direction

- [How to Actually Design with AI in 2026 (Gian Gallegos)](https://www.giangallegos.com/how-to-actually-design-with-ai-in-2026-without-making-generic-garbage/)
- [Why your vibe-coded designs look generic (Jola Gil, Design Bootcamp 2026-04)](https://medium.com/design-bootcamp/why-your-vibe-coded-designs-look-generic-the-fix-isnt-better-prompts-09e2fda26591)
- [The Prompts That Force AI to Give You Beautiful Frontend Design (John Evans Okyere, 2026-05)](https://medium.com/@okyerevansjohn/the-prompts-that-force-ai-to-give-you-beautiful-frontend-design-and-why-most-builders-skip-them-00f1348aeb63)
- [12 Product Design Trends for 2026 (UXPilot)](https://uxpilot.ai/blogs/product-design-trends)

### LP / Hero image prompt 設計

- [AI Image for Landing Page Hero Images (CapCut)](https://www.capcut.com/ideas/ai-image/ai-image-for-landing-page-hero-images)
- [How to write AI image prompts like a pro (Let's Enhance, 2026)](https://letsenhance.io/blog/article/ai-text-prompt-guide/)
- [AI Image Prompts for Eye-Catching Marketing Creatives (Typeface)](https://www.typeface.ai/blog/ai-image-prompts-for-marketing-campaigns)
- [18 Best Landing Page Examples of 2026 (LanderLab)](https://landerlab.io/blog/best-landing-page-examples)
- [AI Design: Designing with AI in 2026 (Anima Blog)](https://www.animaapp.com/blog/ai-design-en/ai-design/)
- [7 Best AI Landing Page Generators in 2026 (Manus)](https://manus.im/blog/best-landing-page-generator)
