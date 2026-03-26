# Smitch Design System

## Brand Identity

**Name:** Smitch (スミッチ)
**Tagline:** "Switch your path."
**Tone:** 静かな知性。科学的だが冷たくない。寄り添うが押し付けない。

## Color Palette

### Primary Colors

| Role | Color | Hex | OKLCH | Usage |
|------|-------|-----|-------|-------|
| Primary | Deep Indigo | `#2B4162` | `oklch(0.35 0.05 250)` | ブランドカラー、CTA、ヘッダー |
| Primary Light | Blue | `#4A8FE7` | `oklch(0.65 0.15 250)` | アクセント、リンク、アクティブ状態 |
| Primary Dark | Navy | `#1B2838` | `oklch(0.22 0.04 250)` | ダークモードの強調 |

### Semantic Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Success | Forest Green | `#3D8A5A` | 完了、ポジティブ指標 |
| Warning | Amber | `#D4A843` | 注意、レビュー未完了 |
| Danger | Coral | `#D08068` | 失敗、ネガティブ指標 |
| Skipped | Slate Gray | `#9CA3AF` | スキップ、非アクティブ |

### Neutral Colors

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background | `#F8F9FA` | `#0F1923` |
| Surface (Card) | `#FFFFFF` | `#1B2838` |
| Border | `#C9D1D9` | `#2B4162` (40%) |
| Muted Text | `#6B7280` | `#9CA3AF` |
| Foreground | `#2B4162` | `#D0D7E0` |

### Impact Display Colors (既存から継続)

| Metric | Color | Hex |
|--------|-------|-----|
| Health | Warm Gold | `#B8860B` |
| Cost | Warm Gold | `#B8860B` |
| Income | Warm Gold | `#B8860B` |
| Impact BG | Cream | `#FFF8F0` |

## Typography

### Font Stack

- **UI:** Geist Sans (現在のまま継続)
- **Monospace:** Geist Mono (コード、数値表示)

### Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 24px (text-2xl) | Bold (700) | ページタイトル |
| H2 | 18px (text-lg) | Semibold (600) | セクションヘッダー |
| H3 | 14px (text-sm) | Semibold (600) | カードタイトル |
| Body | 14px (text-sm) | Regular (400) | 本文 |
| Caption | 12px (text-xs) | Medium (500) | ラベル、メタ情報 |
| Micro | 10px (text-[10px]) | Medium (500) | バッジ、サブラベル |

## Spacing & Layout

- **Max width:** 672px (max-w-2xl) — モバイルファースト
- **Page padding:** 16px (px-4)
- **Section gap:** 24px (space-y-6)
- **Card padding:** 16px (p-4)
- **Border radius:** 10px (rounded-lg) — カード、12px (rounded-xl) — ボタン

## Logo Concept

### M/W Flip

ロゴの核はSmitchの **m** と **w** の視覚的反転。

```
  S    m    i    t    c    h
  S    w    i    t    c    h

m を反転すると w になる = 道(michi)を切り替える(switch)
```

### Logo Mark

- m/w を抽象化した幾何学的マーク
- 線の太さ: 均一（ストロークベース）
- カラー: Deep Indigo (#2B4162)、単色でも成立すること

### Logo Text

- "smitch" in lowercase
- Geist Sans Bold or custom lettering
- m の文字だけ視覚的に w にも見えるデザイン処理

## Iconography

- **System:** Lucide React (既存継続)
- **Size:** 16-20px (UI), 24px (navigation)
- **Stroke:** 2px (default)
- **Color:** inherit (parent text color)

## Component Patterns

### Cards
```
bg-white dark:bg-[#1B2838]
border border-[#C9D1D9] dark:border-[#2B4162]/40
rounded-lg
p-4
```

### Buttons (Primary)
```
bg-[#2B4162] text-white
hover:bg-[#1B2838]
rounded-xl
py-3 px-6
text-sm font-semibold
```

### Buttons (Secondary)
```
bg-transparent
border border-[#C9D1D9] dark:border-[#2B4162]
text-[#2B4162] dark:text-[#D0D7E0]
rounded-xl
```

## Mood Icons (既存)

| Mood | Icon | Color |
|------|------|-------|
| 1 | Frown | `text-red-400` |
| 2 | Meh | `text-orange-400` |
| 3 | CircleMinus | `text-gray-400` |
| 4 | Smile | `text-lime-500` |
| 5 | Laugh | `text-green-500` |

## Status Indicators

| Status | Color | Icon |
|--------|-------|------|
| Completed | `#3D8A5A` | Check |
| Failed | `#D08068` | X |
| Skipped | `#9CA3AF` | Minus |
| None | `border-[#C9D1D9]` | Circle (outline) |

## Voice & Tone

### Do
- 科学的事実を簡潔に伝える
- ユーザーの選択を尊重する（「おすすめ」はするが強制しない）
- 静かな自信（データで語る）
- 変化を祝うが大げさにしない

### Don't
- 感情を煽る（「すごい！」「最高！」）
- 罪悪感を与える（「サボりましたね」）
- 専門用語で威圧する
- ゲーミフィケーション的な過度な演出
