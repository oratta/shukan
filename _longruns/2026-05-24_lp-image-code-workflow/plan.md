# Plan: LP image-to-code workflow (Smitch コンセプト訴求 LP)

## 生成情報
- 作成日: 2026-05-24
- Brain Dump元: docs/research/lp-image-to-code-workflow-2026.md + 対話ヒアリング
- 質問回数: 約 15 問

## ゴール

Codex CLI (gpt-image-2) + Claude Code (frontend-design plugin + DESIGN.md + shadcn skill) のハイブリッド画像→コードワークフローで、Smitch のコンセプト「**受動的に流される自己改善から、能動的に選び取る自己改善への転換**」を訴求する LP をリリースし、waitlist で先行ユーザー調査（ペイン / WTP / 環境希望 / なりたい自分）を回しながら、GA4 + Search Console で SEO キーワード仮説を実測する。

## ビジネスコンテキスト

### Smitch コンセプトコア（plan.md で再言語化）

`docs/context/product-concept.md` の補完として、本 LP では以下のコアを明示する:

- **否定するのはライフハック自体ではなく、ライフハックにたどり着くまでの「経路」**
- ❌ 受動的経路: SNS / ショート動画 / インフルエンサーから流れてきたライフハックを鵜呑みにして真似する
- ✅ 能動的経路: 自分の意思で「なりたい自分」を選ぶ → 科学的根拠のある選択肢が出る → どの習慣を採るか自分で判断する
- つまり Smitch の本質は「**情報経路の転換 (受動 → 能動)**」と「**手段 (習慣) と目的 (人生改革) の逆転**」

### 対象ユーザー（メインペルソナ確定: 拓郎 38 歳）

- 30 代後半〜40 代前半、ホワイトカラー / 専門職、都市在住
- 過去に Habitify / Streaks / Day One を試したが続かなかった（「連続日数がゼロに戻った瞬間に虚無感」体験で疲弊）
- 「科学的に正しい〇〇」「ハーバードが認めた〇〇」みたいな科学的エビデンス × 自己啓発の本をつい手に取ってしまう層（鈴木祐 / 池谷裕二 / メンタリスト DaiGo / 中野信子 系）
- 論文 PDF を直接読むのではなく、噛み砕かれた research summary を好む
- 検索: `習慣化 アプリ 続かない` / `エビデンスベース 自己改善` / `科学的 自己改善 アプリ`
- 響くトーン: 知的、静か、断定的、「研究によると」レベルのわかりやすさ

### 提供価値

- 拓郎ペルソナに「連続日数のプレッシャーから解放されたい、でも科学的な後ろ盾は欲しい」体験を約束
- 「なりたい自分」を起点とする LP 体験 → アプリ内オンボーディング設計の北極星
- waitlist で取得した「困っていること」「なりたい自分」を、要望の多いものから順に科学的根拠に基づいたリサーチに反映する co-creation 設計

### 成功指標

- waitlist 登録 CVR（基準: LP 訪問者の 3% 以上）
- WTP 中央値（市場の価格感度を捕捉）
- OS 希望分布（ネイティブ化判断材料）
- 流入キーワード（Search Console で SEO 仮説検証）

## 技術要件

- **スタック**: Next.js 16.1.6 / React 19.2.3 / TypeScript 5 / Tailwind CSS 4 / shadcn/ui / next-intl / next-themes
- **DB**: Supabase（既存 shukan プロジェクト）
- **画像生成**: Codex CLI + gpt-image-2（max 16 reference images, 1K/2K/4K native）
- **使用スキル**: `frontend-design` plugin（claude-plugins-official, installed）, `shadcn` (MCP), `serena-code-inspection` (token 節約用)
- **参照パターン**: 既存 `src/app/marketing/{page.tsx, layout.tsx, copy.ts}` の構造、`src/app/globals.css` のカラートークン
- **制約**:
  - JSX 内に hard-coded HEX 禁止（CSS 変数経由のみ）
  - shadcn primitives 必須（Button, Card, Form など）
  - 8px rhythm（Tailwind `4` = 16px = base unit）
  - WCAG AA contrast
  - mobile-first responsive (sm/md/lg/xl)
- **テストフレームワーク**: Vitest（ユニット）+ Playwright（E2E + visual regression）
- **テスト実行コマンド**: `npm run test:run` / `npm run test`（watch）/ `npx playwright test`

## スコープ

### 含むもの

- **change-A**: foundation（DESIGN.md / brand-references skeleton / CLAUDE.md hard rules / Codex image generation prompt template / scripts/codex-image-gen.sh）+ marketing host インフラ整備（Cloudflare DNS CNAME 追加 / Vercel domain 追加 / `NEXT_PUBLIC_MARKETING_HOSTS` env 設定）+ Supabase `waitlist` テーブル migration
- **change-B**: Hero セクション（画像生成 → curation → 実装）— pilot として品質検証も兼ねる
- **change-C**: Problem-Solution セクション
- **change-D**: Why Smitch セクション（既存 product-concept.md 比較表ベース）
- **change-E**: How it works セクション（3 ステップ + UI スクリーンショット）
- **change-F**: Evidence セクション（噛み砕き research summary + バリュー軸インパクト可視化デモ）
- **change-G**: CTA セクション + waitlist フォーム UI + 送信 Server Action + Thank You ページ（Concept Prototype 案内含む）
- **change-H**: GA4 + Search Console 計測仕込み + 統合（既存 `src/app/marketing/page.tsx` 全面置換）+ a11y/Lighthouse 微調整 + 既存 `copy.ts` 全面入れ替え

### 含まないもの

- ネイティブアプリ化（Expo / Capacitor / PWA 強化）— waitlist OS 希望データを 3 ヶ月見てから別 longrun
- 確認メール送信 / メルマガ配信（Resend 統合）— 必要になったら別 longrun
- A/B テストインフラ（複数 Hero copy バリアント並走）— 単一バージョンで実測してから次フェーズで判断
- PostHog 等のスクロール深度 / ヒートマップ計測 — GA4 + Search Console で十分判断材料が取れる想定、不足なら別 longrun
- FAQ / Comparison Table / Testimonials の独立セクション — 6 セクション構成で開始、必要なら別 longrun
- Concept Prototype 本体側の修正（バッジ追加など） — 今回は LP 側からの案内だけ
- 多言語化（英語 LP）— 現状は ja 単一

## Changes分解

### change-A: foundation + インフラ + waitlist DB

- **スコープ**:
  - **事前調査タスク**: 既存 `src/middleware.ts` の host 判定実装（`NEXT_PUBLIC_MARKETING_HOSTS` 参照ロジック）を serena で確認。既に実装済み（5/21 lp-branding run で導入済み）の想定だが、改修が必要な場合は本 change に追加する
  - `docs/design/DESIGN.md` 新規作成（既存 globals.css を権威ソースとして color HEX 同期 + typography 候補 + 8px rhythm + motion budget + hard rules）
  - `docs/design/brand-references/` ディレクトリ作成（README で 16 枚 role-label 仕組みを明示、初回は logo SVG のみ配置）
  - `docs/design/prompts/section-prompt-template.md` 作成（リサーチ §5.1 のテンプレを Smitch 用に埋め込み済みで配置）
  - `scripts/codex-image-gen.sh` 作成（Codex CLI を呼び出す薄ラッパ）
  - `CLAUDE.md` に Smitch コンセプトコア + hard rules（コード化向け）追記
  - Cloudflare で `www.s-mitch.com` CNAME を Vercel に向ける
  - Vercel project shukan に `www.s-mitch.com` domain 追加
  - Vercel env vars に `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` 設定（Production + Preview）
  - Supabase migration: `waitlist` テーブル作成（後述データモデル参照）
  - **ユーザーゲート**: インフラ整備後、本番 `https://www.s-mitch.com` で marketing route が、`https://s-mitch.com` で既存 Concept Prototype がそれぞれ表示されること（既存 apex regression なし）をユーザーが目視確認
- **使用スキル**: serena-code-inspection（既存ファイル調査）
- **依存関係**: 独立。内部の「ドキュメント雛形作成」と「Cloudflare/Vercel/Supabase インフラ」は並列実行可
- **config.yaml rules**:
  - "DESIGN.md は globals.css の HEX をスナップショットで転記する。差分検出スクリプトを scripts/check-design-md-sync.sh に置く"
  - "brand-references/ は最初は logo SVG のみ。Build フェーズで必要に応じて追加"

### change-B: Hero セクション（pilot、コンポーネント作成のみ）

- **スコープ**:
  - Codex CLI で Phase 1 mood board 4-8 枚（1024x1024 low quality, vary palette/lighting）
  - **ユーザーゲート**: mood board の方向性を 1 つ選んでもらう
  - Codex CLI で Phase 2 Hero hi-fi 4 variants（2048x1152 PNG, vary one dimension）
  - **ユーザーゲート**: variant を 1 つ選んでもらう
  - `public/landing/hero.png` に配置
  - `src/components/landing/Hero.tsx` 実装（Hero コピー 3 行 + 画像 + 2 つの CTA は waitlist セクションへスクロール）
  - **pilot 用プレビューページ**: `src/app/marketing/_preview/page.tsx` を一時作成し、Hero コンポーネントだけを描画して動作確認（最終的に change-H で削除）
  - **ユーザーゲート**: ブラウザで Hero 表示確認 + NG ビジュアル 12 項目チェックリストを目視 sign-off（以降のセクションは Codex プロンプトに NG リスト append で自律生成）
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-A 完了後
- **config.yaml rules**:
  - "Hero コピーは plan.md 確定版（3 行）を変更禁止"
  - "画像 generation は 1 回の vary one dimension のみ。複数次元変動禁止"
  - "`src/app/marketing/page.tsx` は本 change で編集しない（change-H で全面構築する）"
  - "`public/landing/hero.png` は 2048x1152 PNG。`next/image` の自動最適化（webp/avif 変換）に任せる"

### change-C: Problem-Solution セクション（コンポーネント作成のみ）

- **スコープ**:
  - フック: 「**連続日数のカウントに振り回されていませんか**」「**SNS で流れてきたライフハック、試して続かなかった経験はありませんか**」2 段重ね
  - Solution 本文: 「Smitch は『なぜ』から始める / なりたい自分から始めるアプローチ」
  - 必要なら補助画像 1 枚 (Codex)
  - `src/components/landing/ProblemSolution.tsx` 実装
  - `_preview/page.tsx` に追加してプレビュー確認
  - **ユーザーゲート**: ブラウザ確認
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-B 完了後（pilot 結果を踏まえる）
- **config.yaml rules**:
  - "問いかけは 2 つ並べる構造。1 段にまとめない"
  - "`src/app/marketing/page.tsx` は本 change で編集しない"

### change-D: Why Smitch セクション（コンポーネント作成のみ）

- **スコープ**:
  - 比較表（既存習慣アプリ vs Smitch、`docs/context/product-concept.md` 比較表ベース）
  - 結論行: 「だから続けやすい」ではなく「**だから人生が動く**」
  - `src/components/landing/WhySmitch.tsx` 実装（shadcn Table primitive 使用）
  - `_preview/page.tsx` に追加してプレビュー確認
  - **ユーザーゲート**: ブラウザ確認
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-C 完了後
- **config.yaml rules**:
  - "`src/app/marketing/page.tsx` は本 change で編集しない"

### change-E: How it works セクション（コンポーネント作成のみ）

- **スコープ**:
  - 3 ステップ: ① なりたい自分を選ぶ ② 科学が習慣を導く ③ 1 週間で実感 + アンロック
  - 各ステップに小さなイラスト or UI screenshot mockup（Codex で生成 or 既存アプリのスクリーンショット流用は Build で判断）
  - `src/components/landing/HowItWorks.tsx` 実装
  - `_preview/page.tsx` に追加してプレビュー確認
  - **ユーザーゲート**: ブラウザ確認
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-D 完了後
- **config.yaml rules**:
  - "`src/app/marketing/page.tsx` は本 change で編集しない"

### change-F: Evidence セクション（コンポーネント作成のみ）

- **スコープ**:
  - 噛み砕き research summary（「ハーバード大学の研究によると」「行動科学の知見では」レベル、論文 PDF 引用 NG）
  - バリュー軸インパクト可視化デモ（既存 `--color-impact-health/cost/income` トークンを使った視覚化、health/cost/income の 3 軸サンプル）
  - `src/components/landing/Evidence.tsx` 実装
  - `_preview/page.tsx` に追加してプレビュー確認
  - **ユーザーゲート**: ブラウザ確認 + research summary が「鈴木祐 / 池谷裕二 系の言い回し」になっているか目視
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-E 完了後
- **config.yaml rules**:
  - "research summary には実在の研究を最低 2 件引用。引用元は学会論文ではなくサイエンスライターの一般書 (鈴木祐 系) を出典に含めてよい"
  - "`src/app/marketing/page.tsx` は本 change で編集しない"

### change-G: CTA + waitlist フォーム + Thank You（コンポーネント作成のみ）

- **スコープ**:
  - CTA セクション文言（plan.md 確定版）
  - waitlist フォーム実装（Server Action）
    - 必須: メアド / 使いたい環境 multi-checkbox (Web PC / Web Mobile / iOS Mobile / Android Mobile)
    - 任意: 使っている類似アプリ / 困っている理由 / WTP (radio 0/300/500/1000/2000/3000+) / なりたい自分
  - `src/components/landing/CtaWaitlistForm.tsx` 実装
  - `src/app/marketing/_actions/submit-waitlist.ts`（Server Action）
  - `INSERT INTO waitlist ...` の Server Action
  - エラーハンドリング（重複メアド / 必須欠落 / spam 拒否）
  - Thank You 表示（同ページ内 success state、`useState` で切替）
    - 「ご登録ありがとうございます」+ 「頂いた声を反映」メッセージ
    - Concept Prototype 案内（リンク: https://s-mitch.com）
  - `_preview/page.tsx` に追加してプレビュー確認
  - **ユーザーゲート**: dummy データでフォーム送信エンドツーエンド確認 + Supabase に INSERT 確認 + Thank You 表示確認
- **使用スキル**: frontend-design, shadcn
- **依存関係**: change-F 完了後
- **config.yaml rules**:
  - "Server Action は Supabase service_role を使わない。anon key + RLS INSERT policy 経由"
  - "**spam 対策 minimum**: ① honeypot field（hidden text input、bot のみが値を埋めると Server Action 側で拒否） ② Server Action 内で同一 IP からの連続送信を rate limit（in-memory Map で 5 req/min/IP、Vercel Edge では IP は `x-forwarded-for` ヘッダ） ③ Turnstile / reCAPTCHA は今回は導入しない"
  - "`src/app/marketing/page.tsx` は本 change で編集しない"

### change-H: 統合 + GA + a11y + copy.ts 置換 + 全面構築

本 change が唯一 `src/app/marketing/page.tsx` を編集する。change-B〜G で作成したコンポーネントを統合し、旧プレースホルダ LP を完全に置き換える。

- **スコープ**:
  - **必須完了条件 4 点**:
    1. GA4 (Next.js Script + gtag) を `src/app/marketing/layout.tsx` に注入し、`waitlist_submit` / `concept_prototype_click` / `scroll_depth_50` / `scroll_depth_75` イベント計測が動作する
    2. Search Console verification（meta tag）
    3. `src/app/marketing/page.tsx` を change-B〜G の新コンポーネント群で全面構築（Hero → ProblemSolution → WhySmitch → HowItWorks → Evidence → CtaWaitlistForm → Footer）
    4. 既存 `src/app/marketing/copy.ts` 全面置換（旧 problemText / solutionText / heroSubcopy などは削除。git history で追えるため archive コメントは不要）
    5. a11y: WCAG AA contrast 確認、keyboard navigation、prefers-reduced-motion 対応
  - **後始末タスク**: `src/app/marketing/_preview/` ディレクトリ削除（change-B〜G で作った pilot プレビュー）
  - **best effort タスク**:
    - `next.config.ts` の `images.formats: ['image/avif', 'image/webp']` 設定確認・追加
    - Lighthouse 目標スコア達成（Performance 80+ / Accessibility 90+ / SEO 95+ / Best Practices 90+）— **未達項目は受け入れ可、未達詳細は `openspec/backlog.md` に記録**
  - **ユーザーゲート**: 本番デプロイ前に Preview URL で全セクション統合確認、Lighthouse スコア目視（目標未達があれば backlog 化方針確認）
- **使用スキル**: frontend-design, shadcn, serena-code-inspection
- **依存関係**: change-G 完了後

## 画面・UI設計

### LP 全体構造（縦スクロール、6 セクション + Footer）

```
┌─ Hero ─────────────────────────────────┐
│  なりたい自分への最短コースを見つける   │
│  エビデンスベースで習慣を組み合わせて   │
│  人生を切り替えるためのアプリ → Smitch │
│  [waitlistへ] [詳しく見る]              │
└────────────────────────────────────────┘

┌─ Problem→Solution ────────────────────┐
│ 連続日数のカウントに振り回されていませんか │
│ SNSで流れてきたライフハック…経験は？  │
│ Smitchは「なぜ」から始める             │
└───────────────────────────────────────┘

┌─ Why Smitch ───────────────────────────┐
│  既存習慣アプリ │ Smitch                │
│  続けることが目的 │ 人生が目的           │
│  連続日数動機 │ バリュー軸インパクト  │
│  だから人生が動く                       │
└────────────────────────────────────────┘

┌─ How it works ─────────────────────────┐
│  ① なりたい自分を選ぶ                  │
│  ② 科学が習慣を導く                    │
│  ③ 1 週間で実感 + アンロック           │
└────────────────────────────────────────┘

┌─ Evidence ─────────────────────────────┐
│  ハーバード大学の研究によると…         │
│  バリュー軸インパクト可視化(health/cost/income)│
└────────────────────────────────────────┘

┌─ CTA + waitlist ───────────────────────┐
│  Smitchは現在準備中です                │
│  [waitlist フォーム]                   │
└────────────────────────────────────────┘

┌─ Footer ───────────────────────────────┐
│  Privacy │ Terms │ © Genetta Inc.      │
└────────────────────────────────────────┘
```

### Visual トーン（Codex Project Style Block の Smitch 値）

- **Brand essence**: science × soul, evidence-based life path builder. "Switch your path."
- **Tone**: quiet, intentional, no-glare; introspective rather than performative
- **Audience**: 30s-40s knowledge workers who reject pseudoscience and SNS-flex culture; readers of pop-science books
- **Adjectives (Codex Style Block)**: `quiet` / `intentional` / `soft natural light` / `editorial` / `asymmetric`
- **Color palette**: globals.css 由来（DESIGN.md で HEX 同期）
- **Typography mood**: editorial serif for evidence claims, clean humanist sans for UI（具体的フォント名は Build フェーズで決定）

### NG ビジュアル（Codex プロンプトに毎回 append、12 項目）

1. 紫グラデーション on 白背景
2. tech bro neon / cyberpunk
3. 画像内に Inter / Roboto / Space Grotesk / Arial / system fonts が可視
4. 3 カラム rounded-card feature grid 画像
5. Glass orb / 3D blob / smooth gradient with no texture
6. Generic stock-photo people（※スマホを持つ手自体は OK）
7. Flexing / showing-off body language
8. Streak counters / gamification badges 視覚
9. Watermarks / borders / studio logos
10. Perfect symmetry
11. Eye-contact-with-camera if people appear
12. 植物擬人化（「習慣を育てる」系メタファー）

## データモデル

### Supabase `waitlist` テーブル

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,

  -- 使いたい環境（multi-select, 最低 1 つは true）
  wants_web_pc boolean default false,
  wants_web_mobile boolean default false,
  wants_ios_mobile boolean default false,
  wants_android_mobile boolean default false,
  constraint at_least_one_env check (
    wants_web_pc or wants_web_mobile or wants_ios_mobile or wants_android_mobile
  ),

  -- 任意項目
  current_apps text,
  pain_points text,
  willingness_to_pay_jpy int check (willingness_to_pay_jpy in (0, 300, 500, 1000, 2000, 3000)),
  ideal_self text,
  source text,

  created_at timestamptz default now()
);

alter table waitlist enable row level security;

-- INSERT: 誰でも可能
create policy "anyone can insert" on waitlist for insert with check (true);
-- SELECT/UPDATE/DELETE: service_role のみ（Supabase Studio で閲覧）
```

`willingness_to_pay_jpy = 3000` は「3,000 円以上」を意味する集計値。

## 受け入れ条件

**必須条件（常に含める）:**
1. [ ] 全 change の OpenSpec 仕様（proposal/spec/design/tasks）が作成・レビュー済み
2. [ ] 全 change のテストが作成され全て PASS している（Vitest + Playwright）
3. [ ] ビルドエラーなし（`npm run build` + 型チェック）
4. [ ] 統合テストが PASS（worktree マージ後 main で全テスト再実行）

**機能固有の条件:**
5. [ ] `www.s-mitch.com` で marketing route が、`s-mitch.com` で既存 Concept Prototype がそれぞれ表示される（既存 apex regression なし）
6. [ ] 既存 `src/app/marketing/page.tsx` が新コピー（Hero 3 行構造）に置き換わっている
7. [ ] 6 セクション全てが LP 上に縦スクロールで表示される（Hero / Problem-Solution / Why Smitch / How it works / Evidence / CTA + Footer）
8. [ ] waitlist フォームから送信したテストデータが Supabase の `waitlist` テーブルに INSERT される
9. [ ] フォーム送信後 Thank You 表示に遷移し、Concept Prototype (https://s-mitch.com) へのリンクが表示される
10. [ ] OS multi-checkbox で 0 個チェックの場合、DB 制約エラーまたはフォーム validation でブロックされる
11. [ ] honeypot field 経由の bot 送信 / 同一 IP 5 req/min 超の rate limit が Server Action で拒否される
12. [ ] `public/landing/hero.png` が存在し、`next/image` で配信されている
13. [ ] GA4 計測スクリプトが marketing host のみで読み込まれる（apex / localhost ではブロック）
14. [ ] Lighthouse スコア（**目標値、未達項目は backlog 化を許容**）: Performance 80+ / Accessibility 90+ / SEO 95+ / Best Practices 90+
15. [ ] NG ビジュアル 12 項目のチェックは **pilot Hero (change-B) でユーザーが目視 sign-off**、以降のセクションは Codex プロンプトに NG リスト append + builder Agent 自律判断（事後目視は scope 外）

## 意思決定ガイドライン

- 優先順位: **コンセプト訴求力 > シンプルさ > 拡張性 > パフォーマンス**
- リスク許容度: 中程度（pilot Hero で品質ゲートを設けた上で残セクションは速度優先）
- 不明点の扱い: **Codex の発散結果を尊重 + ユーザーの curation を信頼**。Plan で「これは決めない」と明示した範囲（visual の具体・モーション・色のバランス・レイアウト 1px）は Codex に任せる
- セクション単位の人間ゲート（画像 curation + UI 確認）を必ず挟む
- 既存 product-concept.md / Smitch のブランドトーンを変更する場合は必ずユーザー確認

## 動作確認方法

- **開発サーバー**: `npm run dev` → `http://localhost:3000/?marketing=1`（middleware dev escape）
  - もしくは `.env.local` に `NEXT_PUBLIC_MARKETING_HOSTS=localhost:3000` を一時設定 → `http://localhost:3000` （Branch 1）
- **本番 URL**: `https://www.s-mitch.com`（change-A 完了後）
- **Concept Prototype**: `https://s-mitch.com`（既存、Thank You ページから案内）
- **テスト実行**:
  - `npm run test:run`（Vitest ユニット）
  - `npx playwright test`（E2E + visual regression）
  - `npm run lint`（ESLint）
  - `npm run build`（型チェック + production build）
- **確認手順**:
  1. `npm run dev` を起動
  2. `http://localhost:3000/?marketing=1` にアクセス
  3. Hero〜Footer まで縦スクロールで全 6 セクション表示確認
  4. waitlist フォームに dummy データ送信 → Thank You ページ表示確認
  5. Supabase Studio で `waitlist` テーブルに dummy データ INSERT 確認
  6. Concept Prototype リンク → s-mitch.com 遷移確認
  7. Lighthouse 実行（Chrome DevTools）でスコア確認
  8. 本番デプロイ後 `https://www.s-mitch.com` で再確認

## Brain Dumpからの原文メモ

> なりたい自分から始めるってところがコンセプトとして良くて誰かがいいって言った習慣をなんとなく始めるんじゃなくて、自分がこうなりたいってところから、そのために最適な科学的なエビデンスのある習慣を取り入れて、それが達成していく喜びを感じよう、みたいなイメージだな。

> 他の習慣アプリは、習慣をいかに身につけるかに焦点を当てています。このアプリは、いかに人生を素晴らしいものにするかに注力し、そのための手段として習慣を使います。その点で、他のアプリと異なるところです。

> ライフハック自体を否定するんじゃなくてライフハックにたどり着くまでの経路がSNSとかショートとかそういうマーケティング的に流れてくるっていうのが違うよねっていうのを提案したい

> 「科学的に正しいXXX」みたいな「ハーバードが認めたXXX」みたいな科学的エビデンス×自己啓発みたいな本をつい手に取ってしまう、くらいのイメージ

> なりたい自分への最短コースを見つける / エビデンスベースで習慣を組み合わせて / 人生を切り替えるためのアプリ -> Smitch

> 今回のアプリのコンセプトは違うんだけども、エビデンスベースの習慣管理をするっていうプロトタイプバージョンのアプリがあります。先行的に触ってみたい方はぜひ触ってみてください。みたいな見せ方かなぁ。ウェイトリスト送信後の送信完了画面で置いておいていいかもしれません。Smitch(Concept Prototype ver)でどうだろう？
