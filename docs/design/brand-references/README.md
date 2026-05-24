# brand-references/

Smitch LP の Codex CLI image generation で参照する **brand reference image** をここに集める。
最大 **16 枚** (gpt-image-2 の上限) を 5 つの "role" に分類し、Codex プロンプトに role label 付きで渡す。

> 本ディレクトリは change-A 時点では README のみ。実画像は Build フェーズ (change-B 以降) で必要に応じて追加する。

## なぜ 16 枚に絞るのか

リサーチドキュメント (`docs/research/lp-image-to-code-workflow-2026.md` §2.3) によると、reference 画像は **role を明示しないと style anchor として機能しない**。
"16 枚全部投げて make it like this" は最悪パターンで、Codex が weighted average に収束して "AI slop" を生成する。

各 reference は以下の 5 つのうち 1 つの **role label** を付ける:

## Role taxonomy

| Role | 枚数目安 | 役割 | Codex プロンプトでの表記 |
|---|---|---|---|
| **palette** | 3 枚 | 色相 / 彩度 / 明度のアンカー | `Image 1-3 (palette anchor): use these exact hues` |
| **mood** | 3 枚 | 光 / トーン / 質感 | `Image 4-6 (lighting/mood anchor): soft, introspective` |
| **composition** | 3 枚 | レイアウト / 重心 / 空き地 | `Image 7-9 (composition anchor): negative space on left for copy` |
| **typography-layout** | 3 枚 | エディトリアルなレイアウト感 | `Image 10-12 (typography/layout anchor)` |
| **anti-reference** | 4 枚 | **避けるべき** 美学 | `Image 13-16 (anti-reference, AVOID this aesthetic)` |

合計 **16 枚** = gpt-image-2 の上限。

## 配置ルール

```
docs/design/brand-references/
├── README.md              ← 本ファイル
├── palette/
│   ├── 01-deep-indigo-window-light.jpg
│   ├── 02-cream-paper-morning.jpg
│   └── 03-slate-evening-desk.jpg
├── mood/
│   ├── 04-soft-overcast-introspect.jpg
│   ├── 05-warm-golden-quiet.jpg
│   └── 06-low-contrast-editorial.jpg
├── composition/
│   ├── 07-left-negative-space.jpg
│   ├── 08-off-center-subject.jpg
│   └── 09-asymmetric-spread.jpg
├── typography-layout/
│   ├── 10-monocle-magazine-spread.jpg
│   ├── 11-kinfolk-quiet-feature.jpg
│   └── 12-editorial-pullquote.jpg
└── anti-reference/
    ├── 13-AVOID-purple-gradient.jpg
    ├── 14-AVOID-glass-orb-3d.jpg
    ├── 15-AVOID-stock-photo-smiling-people.jpg
    └── 16-AVOID-streak-counter-gamification.jpg
```

- ファイル名は `NN-<role-keyword>.<jpg|png>` 形式 (NN は 01-16 の順序)
- anti-reference は **必ず `AVOID-` prefix** を付け、誤って Codex に "positive anchor" として渡されるのを防ぐ
- 各ファイルは可能なら 1024px 以上の長辺 (Codex が style 解析しやすい)

## ロゴの扱い

Smitch ロゴは Codex 画像内に **直接合成しない**:

- Codex は vector ロゴの厳密再現が苦手 (リサーチ §1-A 弱点 "厳密なロゴ再現は不可")
- LP 上のロゴは `src/components/ui/smitch-logo.tsx` (既存) を使って **コード側で合成**する
- 画像生成時は「ロゴが入る安全領域 (text-safe zone)」を空ける composition reference を用意する

ロゴ素材本体は `/smitch-logo.svg` (public 配下) に既存。`SmitchLogo` コンポーネントが `<img src="/smitch-logo.svg">` で参照している。

## アップデート手順

1. 新しい reference 候補が見つかったら `docs/design/brand-references/<role>/` に配置
2. `npm run test:run` で本 README の構造が壊れていないか確認 (`lp-foundation-brand-refs.test.ts`)
3. Codex プロンプト (`docs/design/prompts/section-prompt-template.md`) の `{{palette_refs}}` 等を更新
4. commit (粒度: `docs(brand-refs): add <role>/<file>`)

## 参照

- `docs/research/lp-image-to-code-workflow-2026.md` §2.3 — role labeling の出典
- `docs/design/prompts/section-prompt-template.md` — 本ディレクトリの reference を使うプロンプトテンプレ
- `docs/design/DESIGN.md` "AI Generation Style Block" — palette HEX のソース
