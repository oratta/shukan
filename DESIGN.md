# Smitch Design System

> **v2（2026-07 確定）**。このドキュメントは全実装者（人間・LLM）の規範です。
> 色・寸法はすべて **globals.css のトークン**が正であり、本書の値はそのトークン定義の
> **参照値**です。両者は 1 対 1 で一致していなければなりません。ズレを見つけたら globals.css を
> 正として本書を直してください。

## Brand Identity

- **Name:** Smitch (スミッチ)
- **Tagline:** "Switch your path."
- **Tone:** 静かな知性。科学的だが冷たくない。寄り添うが押し付けない。データで語り、演出で盛らない。

---

## 0. 最重要ルール：色はトークンで書く

**コンポーネントに hex / rgba / `bg-[#...]` / `text-[#...]` を直書きしない。** 色は必ずトークン名
（`bg-primary` `text-muted-foreground` `bg-success` `ring-border` 等）か、CSS 変数（`var(--success)`）で
参照します。新しい色が欲しくなったら、それは「新しい意味」が生まれたということ。まずトークンを
globals.css に定義し、本書の対応表に追記してから使ってください。

hex を書いてよいのは **globals.css のトークン定義の中だけ**です（oklch が正・hex は参照コメント）。

数少ない意図的例外は「9. 意図的な例外」に列挙します。列挙にないハードコード色はバグとして扱います。

---

## 1. デザイン原則（v2 の憲法）

### ① 意味だけが色を持つ（WHOOP 律）
画面の大半は無彩色で構成し、色は「意味」にだけ載せます。

- **緑（`--success`）= 達成・積み上げ専用。** 達成数値・チェック・進捗バー・完了ドット・累積（積み上げ）ラベルにのみ使う。
- **danger（`--danger`）/ destructive = 失敗・破壊操作。**
- **警告的な「注意して」は色で表現しない。** 無彩色＋濃淡のコントラスト（インクの塗り pill 等）で示す。琥珀（amber）を「注意」に使うのは禁止。
- **恣意的な装飾色は使わない。** リンク・アクティブ状態・FAB・CTA は彩色せず、インクの高コントラストで組む（Airbnb「画面の 90% は無彩色」方式）。

### ② アクセント緑は「写真の色域の外」の高彩度緑
達成の記号として写真に埋もれないよう、写真に含まれない高彩度のライム/ボルト系緑を使う。
**light と dark で明度別の値**を持つ（白地でネオンは沈むため light は同色相で一段深い）。

| テーマ | `--success` | 参照 hex | コントラスト | キャラクター |
|---|---|---|---|---|
| light | `oklch(0.60 0.19 140)` | `#309909` | 暖色紙上 3.4:1 | エレクトリック（Fitness+ 的ライム） |
| dark | `oklch(0.72 0.15 148)` | `#59be6c` | 暗地 8:1 | 深めエメラルド（静かな知性） |

緑の上に載る前景（チェック/ラベル）は必ず `text-success-foreground`（light=白 / dark=暗緑）を使い、
深め緑でも可読性を担保する。`text-white` を緑の上に直書きしない。

### ③ ホームの視覚的勝者は「今日の数値」
静的なページタイトル（旧「今日の習慣」）は置かない。一等地に**動的ステータスヘッダー**を置き、
画面最大タイポで今日の達成数「3/6」を出す（WHOOP 流：腕を伸ばした距離から読める大きさ）。
写真は「どの習慣かを識別させる上質な脇役」であって主役ではない。

構成: `キャプション（今日の達成）→ 巨大数字（達成=success / 分母=muted）→ 進捗バー`、
右肩に副次で `継続中の最長 連続日数`（数値=success）。数値は Geist Mono + tabular-nums。

### ④ 写真の扱いはテーマで分ける
同じ写真バナーを、light と dark で別の「島」として規格化する。

- **light =「明るいベール」**: 背景色系の半透明ウォッシュ＋`backdrop-blur` で frosted にし、写真を
  ライト UI に馴染む脇役にする。**文字はインク（`text-foreground`）**。可読性はベール濃度で担保。
- **dark =「暗い島」**: 色相ティント（`--photo-tint`）＋黒スクリムで写真に光を残しつつ**白文字**を可読に。

規格値（両テーマ共通）:

| 項目 | 値 |
|---|---|
| 折りたたみ高さ | `min-h-[96px]` |
| 角丸 | `rounded-2xl`（18px） |
| タイトル | `text-[19px] font-bold` |
| light ベール | `.banner-veil` / 展開時 `.banner-veil-expanded`（背景色 color-mix グラデ＋blur） |
| dark スクリム | `.banner-scrim` / 展開時 `.banner-scrim-expanded`（下濃く・上は写真素通し） |
| dark 色相ティント | `.banner-tint`（`--photo-tint`、dark でのみ表示） |

テーマ分岐は CSS の `dark:` / `hidden dark:block` / `dark:hidden` で行い、`useTheme` に依存しない（SSR 安全）。

### ⑤ 白カードは影で写真に対抗しない
サマリー等の白カードは、影（elevation）で存在感を出さない。**罫線（`border`）＋余白＋タイポの
ウェイト/サイズ差**で階層を作る（Airbnb 方式）。数値はインク、緑は達成・ポジティブ時のみ。

### ⑥ 数値は Geist Mono + tabular-nums
KPI・達成数・連続日数・金額などの数値は `font-mono tabular-nums` で桁を揃えて組む。

### ⑦ ベーストーンは light=暖色紙 / dark=ネイビー
エレクトリック緑（hue≈140）が「よそ者」に見えないよう、light の無彩色は青寄りをやめ
**紙っぽい暖色オフホワイト（hue≈95, 極小 chroma）**に振る。緑を画面唯一の色にする。
dark は深いネイビー。実値は「2. カラートークン」。

### ⑧ ロゴは単色（CSS フィルタ）
ブランドの青紫 SVG を新システムで浮かせない。**light = インク単色（`brightness(0)`）/ dark = 白
（`brightness(0)` + `invert`）**。実装は `<SmitchLogo className="brightness-0 dark:invert" />`。

---

## 2. カラートークン（globals.css と 1:1）

すべて oklch が正・hex は参照値。`@theme inline` により `--color-*` 経由で `bg-*` / `text-*` に解決される。

### 中核（無彩色 UI chrome）

| トークン | Light `oklch` / hex | Dark `oklch` / hex | 用途 |
|---|---|---|---|
| `--background` | `0.985 0.006 95` `#fbfaf6` | `0.18 0.025 250` `#09121c` | ページ地。light=暖色紙 / dark=ネイビー |
| `--foreground` | `0.34 0.014 100` `#393830` | `0.87 0.01 250` `#cfd5db` | 本文インク |
| `--card` | `0.997 0.004 95` `#fffefb` | `0.24 0.035 250` `#12202f` | カード面 |
| `--primary` | `0.30 0.012 100` `#2f2e27` | `0.93 0.004 260` `#e6e8ea` | FAB・CTA・アクティブ。**インク**（light=濃 / dark=白系） |
| `--primary-foreground` | `0.99 0.004 95` `#fcfcf9` | `0.20 0.008 260` `#14161a` | primary 上の前景 |
| `--secondary` / `--muted` / `--accent` | `0.955 0.008 95` `#f2f0ea` | `0.24 0.035 250` `#12202f` | 副次面・ミュート面 |
| `--muted-foreground` | `0.52 0.014 100` `#6b6960` | `0.7 0.015 260` `#999fa8` | ラベル・メタ・キャプション |
| `--border` / `--input` | `0.88 0.01 95` `#d9d7d0` | `0.35 0.05 250 / 40%` | 罫線・入力枠 |
| `--ring` | `0.55 0.02 100` `#747265` | `0.65 0.02 260` `#88909c` | フォーカスリング（**無彩色**。旧青を排除） |

### 意味色（semantic）

| トークン | Light `oklch` / hex | Dark `oklch` / hex | 意味 |
|---|---|---|---|
| `--success` | `0.60 0.19 140` `#309909` | `0.72 0.15 148` `#59be6c` | **達成・積み上げ専用** |
| `--success-foreground` | `1 0 0` `#ffffff` | `0.20 0.04 148` `#081b0b` | 緑の上の前景 |
| `--danger` | `0.66 0.1 40` `#c67c63` | `0.68 0.11 40` `#d28063` | 失敗（Coral） |
| `--destructive` | `0.65 0.12 30` `#ce7162` | `0.65 0.12 30` | 破壊操作（削除等） |
| `--skipped` | `0.70 0.014 100` `#a09f95` | `0.6 0.02 260` `#79818d` | スキップ・非アクティブ（暖色グレー） |
| `--track` | `0.9 0.008 95` `#dfded8` | `0.42 0.02 260` `#474d58` | 進捗リング下地 |
| `--warning` | `0.7 0.12 85` `#c1983a` | `0.75 0.12 85` | 予約（下記注記） |

> `--warning`（琥珀）は**「注意して」の装飾には使わない**（原則①）。真に caution 意味を持つ限定的な
> 用途のために token は残すが、既定では無彩色＋濃淡で表現する。

### データビジュアライゼーション / インパクト表示（別ガバナンス）

`--chart-1..5` と `--impact-health/cost/income/bg` は**データを区別するための多色系**であり、
UI chrome の無彩色ルールの対象外です（データビズは複数 hue を許容する）。統計・インパクト表示画面の
刷新（後続フェーズ）で個別に見直します。現行値は globals.css を参照。`--impact-income` が青系なのは
「収入」を他 3 軸と区別する意味色のためで、UI の青残骸ではありません。

### 写真バナー専用

- `--photo-tint`（light `0.55 0.12 262 / 0.20` / dark `0.55 0.13 262 / 0.26`）: **dark の暗い島でのみ**
  `.banner-tint` が使用。複数写真の色相をインディゴへ寄せてトーンを揃える。

---

## 3. Typography

### Font Stack
- **UI:** Geist Sans
- **Monospace:** Geist Mono（数値・KPI・達成数・金額・日付）。数値は `tabular-nums` 必須。

### Scale（v2 実値）

| Level | Size / Class | Weight | 用途 |
|---|---|---|---|
| Status（巨大数字） | `text-[72px]` mono, `leading-[0.85]` `tracking-tighter` | 600 | 動的ヘッダーの達成数「3」 |
| Status 分母 | `text-[40px]` mono | 500 | 「/6」（muted） |
| Status 副数値 | `text-[26px]` mono | 600 | 継続中の最長連続日数 |
| KPI 数値（サマリー） | `text-[26px]` mono `tabular-nums` | 600 | 今日のライフインパクトの獲得値 |
| H1 | `text-[28px]` (`text-2xl`+) | 700 | フォールバック見出し（習慣ゼロ時等） |
| H2 | `text-lg`（18px） | 600 | セクションヘッダー |
| Card Title（写真バナー） | `text-[19px]` | 700 | 習慣名 |
| H3 | `text-sm`（14px） | 600 | カードタイトル |
| Body | `text-sm`（14px） | 400 | 本文 |
| Caption | `text-[11px]` mono, `uppercase tracking-[0.16em]` | 500 | ステータスキャプション・ラベル |
| Micro | `text-[10px]` | 500 | バッジ・サブラベル・注記 |

---

## 4. Spacing & Radius

### Spacing
- **Max width:** `max-w-2xl`（672px）— モバイルファースト
- **Page padding:** `px-4`（16px）
- **Section gap:** `space-y-6`（24px）
- **Card padding:** `p-3`〜`p-4`（12〜16px）
- **Row gap:** `gap-3`（12px）

### Radius（`--radius` = 0.625rem = 10px を基点）
| Class | 値 | 用途 |
|---|---|---|
| `rounded-lg` | 10px | ボタン（詳細・スキップ）、内部要素 |
| `rounded-xl` | 14px | カード（サマリー・レビュー）、内側ガラスボックス |
| `rounded-2xl` | 18px | 写真バナーカード |
| `rounded-full` | — | FAB（`size-14`）、ステータスドット、pill/バッジ |

---

## 5. Logo

- M/W フリップ（**m** を反転すると **w** ＝ 道を switch）を核にした抽象マーク。
- 実体は `/smitch-logo.svg` を `<img>` で表示（`SmitchLogo`）。
- **v2 の色運用:** CSS フィルタで単色化。`className="brightness-0 dark:invert"`（light=インク黒 / dark=白）。
  ブランドの原色（青紫）は新システムでは使わない。

---

## 6. Iconography

- **System:** Lucide React
- **Size:** 16–20px（UI）、24px（ナビゲーション）
- **Stroke:** 2px（default）
- **Color:** `inherit`（親のテキスト色＝トークン）。アイコンに独自色を付けない（意味色を除く）。

---

## 7. Component Patterns（トークンで記述）

### Card（サマリー・レビュー等）
```
bg-card border border-border rounded-xl
p-4
// 影で写真に対抗しない（原則⑤）。elevation は使わず罫線＋余白で階層化。
```

### Button / CTA（Primary = インク）
```
bg-primary text-primary-foreground
hover:bg-primary/90
rounded-lg
```

### Button（Secondary / 中立）
```
bg-secondary text-secondary-foreground
hover:bg-secondary/80
rounded-lg
```

### FAB
```
bg-primary text-primary-foreground   // インク（dark=白系）。青/インディゴにしない
size-14 rounded-full shadow-lg
```

### 動的ステータスヘッダー（ホーム）
```
caption:  font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground
number:   font-mono text-[72px] font-semibold tabular-nums text-success   // 達成数
denom:    font-mono text-[40px] text-muted-foreground                     // /総数
bar:      h-2 rounded-full bg-muted → 内側 bg-success
```

### 写真バナー（原則④の規格に従う）
- 背景: `<img>` + `dark:` の tint/scrim ＋ light の veil を重ねる。
- 文字: `text-foreground dark:text-white`。ドット/リング/ラベルも同パターン。
- 内側ガラスボックス: `bg-background/70 dark:bg-white/10 backdrop-blur-md`、区切りは `bg-border/70 dark:bg-white/15`。

### 通知/注意バナー（例: 昨日のレビュー）
```
bg-card border border-border rounded-xl        // 無彩色カード
count pill: bg-primary text-primary-foreground // 注意はインクの塗りコントラストで（琥珀不使用）
```

---

## 8. Status Indicators & Mood Icons

### Status Indicators（トークン名で）
| Status | 色 | アイコン |
|---|---|---|
| Completed | `bg-success` / 前景 `text-success-foreground` | Check |
| Failed | `bg-danger` | X |
| Skipped | `bg-skipped` | Minus |
| None | `border-skipped`（写真上 dark は `dark:border-white/70`） | Circle (outline) |
| 進捗リング下地 | `--track`（写真上 dark は白系） | — |

### Mood Icons（既存・意図的にパレット色を使用）
気分は 5 段階のスペクトル表現で、意味の連続性を示すため Tailwind パレット色を許容する（例外扱い・下記 9）。

| Mood | Icon | Color |
|---|---|---|
| 1 | Frown | `text-red-400` |
| 2 | Meh | `text-orange-400` |
| 3 | CircleMinus | `text-muted-foreground` |
| 4 | Smile | `text-lime-500` |
| 5 | Laugh | `text-green-500` |

---

## 9. 意図的な例外（列挙にないハードコードはバグ）

1. **写真バナー「暗い島」（dark）の白アルファ・パレット**: `bg-white/90` `text-white` `bg-white/10`
   `ring-white/30` や白ガラスチップ上の `text-gray-900` 等は、テーマ非依存で「常に暗い写真の上に白で
   浮かせる」ための固定パレット。トークン化するとこの設計と競合するため、この zone 内に限り許容する。
2. **達成の紙吹雪パーティクル**: `var(--success)` で統一（意味＝達成の緑）。虹色 hex は廃止済み。
3. **Mood Icons**: 気分スペクトルの連続性表現として Tailwind パレット色（red/orange/lime/green）を許容。
4. **データビズ / インパクト表示の多色**: `--chart-*` `--impact-*` は区別のための多 hue パレット（原則①の対象外）。

---

## 10. LP（ランディングページ）は別言語

LP は意図的に**別のデザイン言語**（黒ブルータリスト、`#0A0A0A` 基調）で組む。本デザインシステムの
トークン体系（暖色紙 light / ネイビー dark）の**対象外**です。LP はアプリの実画面スクリーンショットの
埋め込み先であり、その主戦場は **dark テーマ**（黒 LP 上で映える深めエメラルド＋白インク）です。
アプリ画面を LP に載せるときは dark を第一候補にしてください。

---

## 11. Voice & Tone

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
