# LP 構成リニューアル 設計ドキュメント（#53 / #20 前段）

> このドキュメントは #53 の成果物。LP のセクション構成・コピー・掲載素材・計測方針を確定する。
> 実装は本ブランチ（`agent/issue-53-lp-redesign`）で先行着手済み。オーナーは PR で確認する。
> 出典: `docs/context/product-concept.md`、`DESIGN.md`（Voice & Tone）、`src/messages/{ja,en}.json`（実オンボーディング）。

---

## 訴求の軸（決定事項）

3 案（A: 生涯インパクト診断 / B: 習慣アプリ挫折者への共感 / C: なりたい自分・アイデンティティ）を検討し、
**A を主軸、C を「なぜ」の額縁、B を Problem セクションの一拍**に統合した折衷を採用する。

- **軸名: エビデンス起点の生涯インパクト（Evidence-first / lifetime-impact）**
- **一文**: 「続ける」アプリではなく、科学的根拠で習慣を選び、それが人生（健康寿命・気分・支出・収入）に
  どう効くかを数字にして見せる。ゴールは"なりたい自分"、手段は科学。

### なぜこの軸か（根拠）

1. **実装済みの体験に直結する（過大約束を避けられる）。** 現行アプリのオンボーディングは実際に
   「生涯インパクト診断 → KPI（健康寿命 / 前向きな気持ちの時間 / 出費削減 / 増える収入）選択 → 科学ランクの習慣選択 → トラッキング」
   という流れ（`src/messages/ja.json` の `onboarding.*`）。A はこの実体をそのまま LP の約束にできる。
2. **オーナーの実装方針（でっち上げ禁止・実態に合わせる）と整合する。** C 単独だと「なりたい自分→提案」の
   具体 UI が #2 で未完のため LP がアプリの先を約束してしまう。A は既にある機能で裏を取れる。
3. **ブランド前提「うさんくさくない」を最大化できる。** 数値には景表法対応の注記を近接させ、断言しない。
4. **B を主軸にしない理由**: 挫折共感は"製品の真実"ではなく感情フレーム。Problem の一拍に圧縮すれば効くが、
   主軸にすると「で、何をくれるのか」が弱い。

### この軸で構成がどう変わるか

- 旧 LP の架空 Testimony（37歳・企画職）と架空数値の OutcomeGallery（集中 +2.1時間/日 等）を**削除**。
- 代わりに **ImpactAxes セクション**（4 KPI 軸を「軸ラベル＋意味」で提示、個別数値はでっち上げない）を新設。
- 旧「準備中・waitlist（保存先なし）・アプリを Concept Prototype と呼ぶ」CTA を廃止し、
  **実アプリ（Stripe・Founding 実装済み）への導線**に置換。

### リスク

- 景表法（#39）: インパクトの数値表現。→ ImpactAxes と FAQ に「試算・個人差・非保証」注記を近接配置して緩和。
- ブランドトーンとの緊張: 数値で語ると冷たく見えうる。→ 具体数値を LP に出さず「軸」と「意味」に留め、静かなトーンを維持。

---

## Hero コピー（ja / en 両方）

コピーの正本は `src/messages/{ja,en}.json` の `marketing.hero`。以下は設計時点の確定文言。

| 要素 | ja | en |
|---|---|---|
| eyebrow | エビデンスベースのライフパスビルダー | Evidence-based life path builder |
| title | 科学が選ぶ、／あなたに効く習慣。 | Science picks the habits／that work for you. |
| subtitle | Smitch は「なりたい自分」から始まります。根拠のある習慣を自分で選び、それが健康寿命・気分・お金にどう効くかを数字で見える化する、エビデンスベースのライフパスビルダーです。 | Smitch starts from who you want to become. Choose evidence-backed habits yourself, and see how they move your healthy years, mood, and money — an evidence-based life path builder. |
| CTA（主） | 無料で診断を始める → アプリ | Start your free diagnosis → app |
| CTA（副） | 仕組みを見る → #how | See how it works → #how |
| trust line | ストリークではなく、人生へのインパクトを。 | Impact on your life — not streaks. |

（`\n` は改行位置。翻訳者が改行を制御する。LP は locale 固有の改行をハードコードしない。）

---

## セクション一覧

上から順に。Problem→Solution・CTA・FAQ を含む本格構成。`※軸依存` はこの軸を変えると文言・構成が変わる箇所。

1. **Header** — ロゴ + LocaleSwitcher（ja/en 切替）
2. **Hero** — 約束（軸の中核）。主 CTA = アプリ、副 CTA = 仕組みへ。`※軸依存`
3. **Problem** — ストリーク疲れ（B の圧縮）。3 つの共感ポイント。数値・製品主張なし。
4. **HowItWorks（仕組み）** — 実オンボーディングの 3 拍（領域を選ぶ → 科学が習慣を並べる → インパクトを数字で）。
   **コードで描画**（スクショ非依存）。`※軸依存`
5. **ImpactAxes（何が数字になるのか）** — 実アプリの 4 KPI 軸。**個別数値はでっち上げない。** 景表法注記を近接。`※軸依存（景表法/#39）`
6. **Difference（比較）** — product-concept.md の「続けるアプリ vs Smitch」対照表。実在の positioning。`※軸依存`
7. **Evidence（透明性）** — 各習慣に「何に効くか/確からしさ/注意点」。実 evidence 機能を反映。
8. **FAQ** — 6 項目（後述、5 件以上）。
9. **Cta（クロージング）** — アプリ導線 + Founding Member プログラム（実在・実カウント）。旧 waitlist フォーム廃止。`※軸依存`
10. **Footer** — Privacy / Terms / 特商法 / Genetta Inc. / Switch your path.

### 情報設計の原則

- **1 セクション 1 メッセージ。** スクロールで「共感 → 仕組み → 何が得られる → なぜ違う → 根拠 → 疑問解消 → 行動」。
- **アプリのスクショに依存しない。** 実画面は #2 / #61 で刷新中。HowItWorks / ImpactAxes はアイコン + コピーで構築。
- **ja/en 完全対応。** 全コピーを next-intl `marketing` namespace に集約（`marketing-page.test.tsx` で ja/en パリティを検証）。

---

## 各セクションの掲載素材

スクショは**実画面を撮り直さない**方針（#2/#61 で陳腐化）。掲載素材は「画面名 + 見せたい要素」の抽象指定に留める。
アプリ画面スクショが必要になるのは #20 実装時ではなく、#2/#61 の UI 確定後に別途差し込む想定。

| セクション | 素材種別 | 指定 |
|---|---|---|
| Hero | 人物写真（アプリ画面ではない） | `public/landing/photo-hero-man.png`（据え置き）。実画面モックは使わない |
| Problem | 人物写真 | `public/landing/photo-problem-woman.png`（据え置き） |
| HowItWorks | アイコン + コピー | Lucide `Target / FlaskConical / TrendingUp`。**スクショ不要** |
| ImpactAxes | アイコン + コピー | Lucide `HeartPulse / Smile / PiggyBank / Coins`。**スクショ不要**。数値プレースホルダも置かない |
| Difference | 表 | コードの比較表。画像なし |
| Evidence | 人物写真 | `public/landing/photo-detail-reading.png`（据え置き） |
| CTA | なし | 導線ボタンのみ |

### 将来スクショを入れるなら（#2/#61 確定後の抽象指定）

- **HowItWorks step1**: 「なりたい自分/KPI 選択」画面 — 4 領域（健康寿命/気分/支出/収入）が選べること。
- **HowItWorks step2**: 「習慣リスト」画面 — 効く順に並び、エビデンスの強さラベルが付くこと。
- **HowItWorks step3 / ImpactAxes**: 「インパクト試算」画面 — 4 軸の数値と注記が同一視界にあること。
- 注意: 上記は**画面確定まで実ファイルを LP に配線しない**。旧 `iphone-*.png` モックは実オンボーディングと乖離のため削除済み。

---

## FAQ（項目 5 件以上）

正本は `marketing.faq.items`（ja/en）。ネイティブ `<details>` で JS なしでも開閉可。6 項目を掲載（受け入れ条件の 5 件以上を満たす）。

1. 無料で使えますか？（診断/お試しは無料、継続は有料、カード不要で試せる）
2. 科学的根拠って、どこまで本当？（公開研究にもとづく試算・確からしさ提示・**非保証注記**）
3. 他の習慣アプリと何が違う？（「続ける」より「選ぶ」／なりたい自分から逆算）
4. ストリーク（連続日数）はありますか？（日数は主役にしない）
5. 途中でやめられますか？（いつでも解約・違約金なし）
6. 対応環境は？（ブラウザで動く Web アプリ）

---

## 計測の考え方

- 本設計では計測コードは実装しない（PostHog 導入は #58、A/B 基盤は #63 が担当）。LP は計測を差し込める形に留める。
- 計測すべき主要イベント（#58 で実装する想定の指定）:
  - `lp_view`（表示）
  - `lp_cta_click`（Hero 主 CTA / Cta 主 CTA / Founding CTA を `location` プロパティで区別）
  - `lp_locale_toggle`（ja/en 切替）
  - `lp_faq_open`（どの質問が開かれたか）
- A/B（#63）は Hero の title / 主 CTA 文言を差し替え口にする想定。コピーが `marketing.hero.*` に集約済みなので分岐しやすい。

---

## #2 を待たずに進めたことで陳腐化しうる箇所

#2（UI/UX 修正）・#61（アプリ全体 UI 再構築）でアプリ画面が変わると古くなる部分。本設計は影響を最小化した。

- **アプリ画面スクショ全般**: 本 LP はアプリ画面スクショを一切使わない設計にしたため、**陳腐化しない**。
  （旧 `iphone-*.png` 12 枚は実オンボーディングと乖離のため削除済み。）
- **HowItWorks の 3 拍の文言**: 実オンボーディングのフロー名（KPI 選択 → 習慣ランク → インパクト）に依存。
  #2 でフローの呼称が変われば要更新。→ コピーが `marketing.how.steps` に集約済みなので追従は容易。
- **ImpactAxes の 4 軸ラベル**: 実 KPI（`onboarding.kpi.*`）に対応。KPI の増減・改称があれば要更新。
- **将来スクショを入れる場合**（上表）: #2/#61 の画面確定を待って差し込む。それまでは配線しない。
- **CTA の遷移先前提**: 「アプリは公開済み・Stripe/Founding 実装済み」という現状に依存。リリース形態が変われば要更新。

---

## 実装メモ（このブランチで行ったこと）

- コピーを `src/messages/{ja,en}.json` の `marketing` namespace に集約（ja/en 完全対応）。
- `src/app/marketing/page.tsx` を新 8 セクション構成に再編。`src/app/marketing/layout.tsx` の LP 言語を locale 追従に。
- `src/components/landing/` を再構築: 新規 Hero / Problem / HowItWorks / ImpactAxes / Difference / Evidence / Faq / Cta。
  削除: Process / Detail / OutcomeGallery / SelectionCriterion / Testimony / CtaWaitlistForm、および `marketing/copy.ts`。
- `src/__tests__/marketing-page.test.tsx` を新構成に合わせて書き換え（ja/en パリティ検証を追加）。
