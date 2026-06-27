# Smitch LP — Section Prompt Template (Codex CLI / gpt-image-2)

> リサーチドキュメント (`docs/research/lp-image-to-code-workflow-2026.md` §5.1) を Smitch 値で埋めた状態。
> 各セクション (`hero` / `problem-solution` / `why-smitch` / `how-it-works` / `evidence` / `cta`) ごとに本テンプレを複製し、`{{...}}` 変数を埋めて Codex に渡す。

---

# Smitch LP Image Generation Prompt — {{section_name}}

## 0. Meta

- Section: `{{section_name}}` (例: `hero` / `problem-solution` / `why-smitch` / `how-it-works` / `evidence` / `cta`)
- Output spec: `{{aspect_ratio}}` `{{resolution}}` (例: `16:9` `2048x1152`)
- Format: `{{format}}` (例: `PNG`, sRGB, no alpha)
- File destination: `public/landing/{{section_slug}}.png`

## 1. Scene

`{{scene_one_liner}}`
例: "A quiet morning workspace by a window, a half-finished paper journal and a ceramic mug, soft diffused light from window left, late winter Tokyo."

## 2. Subject

`{{subject_focus}}`
例 (hero): "Smitch app UI floating subtly off-center right, showing a single habit card with an inline evidence citation. Subject occupies ~30% of the frame, leaves negative space on the left for the headline overlay."

## 3. Important Details

- Composition: `{{composition}}` (例: "right-weighted, negative space on left ~40% for headline")
- Lighting: `{{lighting}}` (例: "soft diffused window light from upper-left, slight golden warmth, never harsh / no rim light")
- Mood: `{{target_emotion}}` (例: "quiet determination, introspective, not performative")
- Texture: `{{texture}}` (例: "subtle paper grain, matte surfaces, no glossy reflections")
- Camera / medium: `{{medium}}` (例: "editorial documentary photo, 50mm equivalent, slight film grain, depth of field shallow but readable")

## 4. Use Case

Hero image for Smitch landing page section "`{{section_name}}`".
Will be paired with headline copy: `{{headline_draft}}`
Text-safe zone: `{{text_safe_zone}}` (例: "left 40% must remain low-contrast and free of high-detail elements for headline overlay")

## 5. Reference Images (16 max, role-labeled)

参照: `docs/design/brand-references/README.md`

- Image 1-3 (**palette anchor**, use these exact hues): `{{palette_refs}}`
- Image 4-6 (**lighting/mood anchor**): `{{mood_refs}}`
- Image 7-9 (**composition anchor**): `{{composition_refs}}`
- Image 10-12 (**typography/layout anchor**, for matching UI feel): `{{ui_refs}}`
- Image 13-16 (**anti-reference, AVOID this aesthetic**): `{{anti_refs}}`

**Preserve from references**: `{{preserve_list}}`
例: "lighting mood, palette saturation, negative space ratio, paper-grain texture"

**Change from references**: `{{change_list}}`
例: "subject is now Smitch UI card; composition shifted right-weighted"

## 6. Project Style Block (固定、全プロンプト共通)

> 本ブロックは `docs/design/DESIGN.md` の "AI Generation Style Block" セクションが権威ソース。同期を保つこと。

```
[Project Style Block: Smitch]
- Brand essence: science × soul, evidence-based life path builder. "Switch your path."
- Tone: quiet, intentional, no-glare; introspective rather than performative
- Audience: 30s-40s knowledge workers who reject pseudoscience and SNS-flex culture;
  readers of pop-science books (鈴木祐 / 池谷裕二 / 中野信子 系)
- Color palette:
    primary  #2B4162 (Deep Indigo)
    secondary #4A8FE7 (Blue)
    background #F8F9FA
    foreground #2B4162
    impact-health #3D8A5A
    impact-cost   #B8860B
    impact-income #4A6FB7
- Typography mood: editorial serif for evidence claims (Lora),
  clean humanist sans for UI (Public Sans).
  Never Inter / Roboto / Space Grotesk / Arial / system fonts.
- Lighting: soft, diffused, slightly desaturated; never high-contrast tech-bro
- Composition: editorial asymmetry, off-center subject, generous negative space
  on the left for headline overlay
```

## 7. Hard Constraints (NEVER include)

リサーチ §2.5 + plan.md "NG ビジュアル 12 項目" を完全列挙:

1. NO **purple** gradients on white background
2. NO "tech bro" **neon** / cyberpunk
3. NO **Inter** / Roboto / Space Grotesk / Arial / system fonts visible inside the image
4. NO **3-column** rounded-card feature grid composition
5. NO **glass** orbs / 3D blobs / smooth gradients without texture
6. NO generic **stock-photo** people / hands holding phones with smiling faces (a hand naturally holding a phone is OK)
7. NO **flexing** / showing-off body language
8. NO **streak** counters / gamification badges
9. NO **watermark**s, borders, studio logos
10. NO perfect **symmetry** (prefer editorial asymmetry)
11. NO **eye-contact**-with-camera if any people appear
12. NO plant anthropomorphism ("habits as a growing plant" metaphor — Smitch は別系統のメタファー)

## 8. Output Quality

- Quality: `{{quality}}` (例: high for text-bearing hero / medium for illustration / low for mood draft)
- Variations: `{{n_variants}}` (推奨 `4`)
- **Vary ONE dimension only**: `{{vary_dimension}}`
  例: "background texture (grain / mesh / solid+vignette / paper-fiber). All other dimensions identical."

複数次元を同時に変えると比較不能になる (リサーチ §4.2)。**1 次元のみ vary**。

## 9. Post-generation

- Save to: `~/.codex/generated_images/{{timestamp}}/`
- Human curation: pick 1 variant, copy to `public/landing/{{section_slug}}.png`
- Next step: hand off to Claude Code with `screenshot` + `docs/design/DESIGN.md` + section plan
- Codex CLI wrapper: `bash scripts/codex-image-gen.sh --refs docs/design/brand-references --prompt-file <this filled file> --n 4 --size 2048x1152`

---

## 変数チェックリスト (送信前確認)

- [ ] `{{section_name}}` 埋まっている
- [ ] `{{aspect_ratio}}` / `{{resolution}}` / `{{format}}` 埋まっている
- [ ] `{{scene_one_liner}}` / `{{subject_focus}}` 埋まっている
- [ ] `{{composition}}` / `{{lighting}}` / `{{target_emotion}}` / `{{texture}}` / `{{medium}}` 埋まっている
- [ ] `{{headline_draft}}` / `{{text_safe_zone}}` 埋まっている (text-safe zone を必ず指定)
- [ ] reference 5 ロール全て埋まっている (palette / mood / composition / ui / anti)
- [ ] `{{preserve_list}}` / `{{change_list}}` 明示分離
- [ ] Project Style Block (§6) を **末尾に必ず append** (省略すると "AI slop" に収束)
- [ ] Hard Constraints (§7) 12 項目全て残っている
- [ ] `{{n_variants}}` 指定 (推奨 4)
- [ ] `{{vary_dimension}}` を **1 つだけ** に絞った
- [ ] "minimalist" / "clean" / "modern" のような空虚形容詞を使っていない

## 出典

- リサーチ §5.1 — 本テンプレ構造の出典
- `docs/design/DESIGN.md` — Project Style Block / Hard Rules の権威ソース
- `docs/design/brand-references/README.md` — reference 16 枚の役割分担
- `_longruns/2026-05-24_lp-image-code-workflow/plan.md` — NG ビジュアル 12 項目の確定版
