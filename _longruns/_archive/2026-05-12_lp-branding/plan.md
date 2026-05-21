# Plan: Smitch ブランディングLP（www.s-mitch.com）

## 生成情報
- 作成日: 2026-05-12
- Brain Dump元: GitHub Issue #1（ブランディングページ（LP）作成）+ docs/context/product-concept.md
- 質問回数: 5問
- 関連 Issue: https://github.com/oratta/shukan/issues/1

## ゴール

Smitch のコアメッセージ（「なりたい自分から科学が習慣を導く」）を体現するLPを `www.s-mitch.com` に公開し、未ログイン訪問者を `s-mitch.com/login` へ送り込むマーケティング起点を作る。

## ビジネスコンテキスト

- **対象ユーザー**: 「何か変えたい」と思っているが何から始めればいいかわからない自己改善志向の人（既存習慣アプリに「これで本当に意味あるの？」と疑問を持つ層）
- **提供価値**: 既存習慣アプリとの違い（「なりたい自分」起点、科学的根拠、内面的変化）をLPで明示し、SNS/コンテンツからの流入を本アプリ体験に接続する
- **成功指標**:
  - 直帰せず /login へ遷移するセッション率 ≧ 30%（リリース後計測）
  - LP公開後、外部チャネル（SNS等）からのトラフィックを www に集約できる状態

## 技術要件

- **スタック**: Next.js 16.1.6 App Router / React 19 / TypeScript 5 / Tailwind CSS 4 / Shadcn UI / next-themes
- **既存パターン参照**:
  - `src/middleware.ts`（認証ガード。host判定ロジックを追加する基点）
  - `src/app/(app)/`（既存ルートグループの構成）
  - `src/app/login/page.tsx`（ルートグループ外配置の例）
  - `DESIGN.md`（カラーパレット / タイポグラフィ / Voice&Tone を遵守）
- **制約**:
  - LP の実体（コピー・セクション・ビジュアル）は **codex + gpt-image-2** で別途生成する想定。本plan.mdは「土台」のみ範囲とする
  - DESIGN.md のセマンティックカラー変数を使い、ハードコード色は追加しない
  - middleware の認証ガード対象は apex（s-mitch.com）配下のアプリパスのみに限定し、www では一切走らせない
  - ja単体。next-intl の英語ルートはLPでは追加しない
  - **`NEXT_PUBLIC_MARKETING_HOSTS` 環境変数**を新設（カンマ区切り、本番 = `www.s-mitch.com`、preview/dev では追加可能）。middleware と robots/sitemap はこの env を参照
- **テストフレームワーク**: Vitest（既存。`npm test` / `npm run test:run`）
- **テスト実行コマンド**: `npm run test:run`（ユニット）+ 手動 Playwright/curl による host ベースの統合確認
- **ビルド確認**: `npm run build && npm run lint`

## スコープ

### 含むもの

1. **ルーティング基盤（host ベース rewrite）**
   - LP は **実パス `app/marketing/page.tsx`** に配置（route group `(marketing)` ではない。`(app)/page.tsx` と `/` を奪い合いビルド失敗するため）
   - `src/middleware.ts` を拡張: 関数冒頭で `request.headers.get('host')` を読み、`NEXT_PUBLIC_MARKETING_HOSTS`（カンマ区切り env、本番値 `www.s-mitch.com`）に含まれかつ `pathname === '/'` なら `NextResponse.rewrite(new URL('/marketing', request.url))` で即終了。`auth.getUser()` は呼ばない
   - apex（`s-mitch.com` / `localhost` / その他）は既存ロジックそのまま（認証ガード継続）
   - 既存 middleware matcher `/, /discover/:path*, /stats/:path*, /settings/:path*` は **そのまま維持**（`/login` も matcher 対象外のまま）
   - apex から `/marketing` への直接アクセスは middleware で 404 へ rewrite（隠蔽）または apex `/` へ rewrite

2. **ドメイン/インフラ設定**
   - **Vercel `shukan`（既存）プロジェクトに `www.s-mitch.com` を追加ドメインとして紐付け**（apex と同一 deployment に乗せ、同じ middleware が走ることを前提）
   - Cloudflare DNS で `www` → CNAME `cname.vercel-dns.com`、**proxy OFF（DNS only）必須**（proxy ON だと Vercel 証明書発行が遅延・失敗する事例あり）
   - SSL 証明書が Vercel ダッシュボードで `Issued` になるまで待ってから動作確認
   - apex（s-mitch.com）→ www への redirect は **行わない**（apex はアプリ用に残す）

3. **LP土台コンポーネント**
   - `app/marketing/layout.tsx`: 既存 Header/BottomNav なし、LP専用の軽量レイアウト
   - `app/marketing/page.tsx`: codex+gpt-image-2 の出力を流し込むためのページコンテナ（初版はプレースホルダ Hero + 「アプリを始める」CTA → `https://s-mitch.com/login`）
   - フッター（プライバシー /privacy・利用規約 /terms へのリンク、Genetta Inc クレジット）

4. **SEO / OGP（host 判定 dynamic）**
   - `<title>` / `<meta description>`: product-concept.md のタグライン "Switch your path." を反映（marketing側 layout/page の metadata）
   - OGP（`og:title` / `og:description` / `og:image` / `twitter:card`）: 既存 `public/og/*.png` を活用（無ければ作成）
   - **`app/robots.ts`** は dynamic（`headers()` から host を読む）に実装:
     - host が www → `/` を Allow（marketing は `/` で公開されるため。実体パス `/marketing` も Allow）
     - host が apex → 既存挙動を維持（noindex / Disallow 戦略）
   - **`app/sitemap.ts`** も同様に host 判定し、www は LP のみ、apex はアプリの公開ページのみ

5. **コア コピー1案 決め打ち（v0）**
   - product-concept.md を元にした Hero コピー1案、Problem→Solution 1パラグラフ、CTAコピーを `app/marketing/copy.ts` 等にまとめて保持
   - codex+gpt-image-2 渡しは別フェーズだが、入力資料として copy.ts を仕上げる

6. **デプロイ手順書**
   - `_longruns/2026-05-12_lp-branding/deploy-steps.md` を作成し、(1) Vercel 同一プロジェクトへの www 追加手順、(2) Cloudflare DNS 設定（CNAME / proxy OFF）、(3) Vercel env で `NEXT_PUBLIC_MARKETING_HOSTS` を設定、(4) SSL 発行待ち、(5) 動作確認チェックリストを列挙

### 含まないもの

- LP の最終レイアウト / セクション構成 / ビジュアル素材生成（**codex + gpt-image-2 への委譲。本runでは扱わない**）
- 英語ローカライズ（ja単体先行）
- メールキャプチャ / waitlist 機能（Supabase テーブル追加なし）
- A/B テスト / Analytics 計測タグ（PostHog 等）の組み込み（将来 Issue で扱う）
- apex → www への redirect、または apex 側のLP化（apex はアプリ用途で固定）
- Pricing / 課金導線（Issue #3 で扱う）

## Changes分解

### change-A: marketing-routing-middleware
- **スコープ**: `app/marketing/page.tsx` + `app/marketing/layout.tsx`（実パス、route group ではない）を新設。`src/middleware.ts` に host ベース rewrite ロジックを追加。`NEXT_PUBLIC_MARKETING_HOSTS` env を新設して www / preview / dev での marketing 判定を一元化。既存 matcher は変更しない。回帰テスト（既存 / / /login / /discover などの apex 挙動）と新規テスト（host=www のとき auth.getUser を呼ばないことのモック検証）を Vitest で実装
- **使用スキル**: なし（純粋な Next.js App Router + middleware の実装）
- **依存関係**: 独立（先行）
- **config.yaml rules**:
  - "LP は route group `(marketing)` ではなく **実パス `app/marketing/`** に配置する。`(app)/page.tsx` と `/` を奪い合うため route group は使えない"
  - "middleware は関数冒頭で `host = request.headers.get('host') ?? ''` を取得し、`NEXT_PUBLIC_MARKETING_HOSTS`（カンマ区切り）に含まれかつ `request.nextUrl.pathname === '/'` の場合に `NextResponse.rewrite(new URL('/marketing', request.url))` で **即 return**。Supabase auth.getUser() は絶対に呼ばない"
  - "既存 middleware matcher `/, /discover/:path*, /stats/:path*, /settings/:path*` は **変更しない**（/login は matcher 対象外のまま、無限ループ回避）"
  - "apex（www以外）から `/marketing` への直接アクセスは middleware で `NextResponse.rewrite(new URL('/', request.url))` で隠蔽する（404 ではなく apex `/` へ流す。404 ページが (app) layout を継承し認証ガードと干渉する可能性を回避）"
  - "上記隠蔽を有効化するため、middleware の matcher に `/marketing/:path*` を追加する（既存 4 パターンに加える形）。これにより `/marketing` 直接アクセスが middleware を通り rewrite される"
  - "ローカル開発では `?marketing=1` クエリパラメータでも marketing rewrite を発動できる dev 限定 escape hatch を用意（NODE_ENV !== 'production' のみ有効）"
  - "Vitest テスト: `vi.mock('@supabase/ssr')` で createServerClient をモックし、host=www のとき auth.getUser のモック call count が 0 であることを assert"
  - "既存 (app) ルートの挙動を一切壊さない。回帰テストで host=s-mitch.com / localhost の場合の /, /discover, /stats, /settings の従来挙動を確認"

### change-B: lp-shell-and-copy
- **スコープ**: LP土台（Hero プレースホルダ / CTA / フッター）と core copy（`copy.ts` または messages 直書き）を実装。product-concept.md を1次ソースに、ja コピー1案を確定。codex+gpt-image-2 への入力資料を兼ねる
- **使用スキル**: なし（DESIGN.md を遵守してTailwindで実装）
- **依存関係**: change-A 完了後（routing が存在する前提で表示確認できる）
- **config.yaml rules**:
  - "DESIGN.md のカラー変数のみ使用、ハードコード色禁止"
  - "Voice&Tone: 静かな知性、押し付けない、エビデンスベース"
  - "CTAリンク先は環境変数 `NEXT_PUBLIC_APP_URL`（=`https://s-mitch.com`）+ `/login` でハードコード回避"
  - "marketing layout は (app) layout のヘッダー/ナビを継承しない。独立した軽量 layout を組む"

### change-C: seo-ogp-deploy
- **スコープ**: SEO/OGPメタデータ、**dynamic な `app/robots.ts` / `app/sitemap.ts`**（host 判定して www と apex で異なる挙動を返す）、Vercel の www ドメイン追加手順、Cloudflare DNS設定手順、`_longruns/2026-05-12_lp-branding/deploy-steps.md` の作成、apex 側 noindex 維持の確認
- **使用スキル**: なし（手動DNS/Vercel操作はユーザー実行、コードはAI実装）
- **依存関係**: change-B 完了後
- **config.yaml rules**:
  - "OGP画像は既存 `public/og/` 配下を流用、無ければ 1200x630 の薄背景版を生成"
  - "apex 側 (app) の noindex（既存設定）を絶対に壊さない"
  - "DNS/Vercel 設定はユーザーに手順を提示して実行依頼。AI が直接APIを叩かない"
  - "Vercel ドメイン追加は **既存 `shukan` プロジェクトに www.s-mitch.com を追加する形**で apex と同一 deployment にする（別プロジェクトを作らない）"
  - "Cloudflare DNS: www → CNAME `cname.vercel-dns.com`、**proxy OFF（DNS only）必須**。proxy ON では Vercel 証明書発行が失敗する事例があるため deploy-steps.md に明記"
  - "`app/robots.ts` は dynamic 実装。`headers()` から host を読み、host が `NEXT_PUBLIC_MARKETING_HOSTS` に含まれるとき `rules: [{ userAgent: '*', allow: '/' }]` + `sitemap: 'https://www.s-mitch.com/sitemap.xml'` を返し、apex（s-mitch.com 等）のとき `rules: [{ userAgent: '*', disallow: '/' }]` を返してアプリ側を非インデックス化"
  - "`app/sitemap.ts` も同様に host 判定。www のときは `/` を URL リストに含め、apex のときは空配列を返す（apex はアプリで SEO 不要）"

## 画面・UI設計

- **LPページ初版（v0、本run内で実装）**:
  - ヒーローセクション: タグライン "Switch your path." + サブコピー（product-concept.md 「なりたい自分から科学が習慣を導く」を要約した1〜2文）+ 「アプリを始める」CTAボタン → `https://s-mitch.com/login`
  - シンプルなProblem→Solutionパラグラフ（1ブロック）
  - フッター: プライバシー / 利用規約 / Genetta Inc クレジット
- **本実装（次フェーズ、codex+gpt-image-2）**:
  - 本 plan.md のスコープ外。codex 側で別途デザイン・コピー・ビジュアル生成を行う想定
- **既存DESIGNとの整合**:
  - DESIGN.md のカラー / タイポ / Voice&Tone をそのまま継承
  - ロゴ・ファビコンは既存アセットを流用

## データモデル

DB変更なし。Supabase スキーマ・RLS には一切手を入れない。

## 受け入れ条件

**必須条件（常に含める）:**

1. [ ] 全changeのOpenSpec仕様が作成・レビュー済み
2. [ ] 全changeのテストが作成され全てPASSしている
3. [ ] ビルドエラーなし（`npm run build` + `npm run lint` 成功）
4. [ ] 統合テストがPASS（worktreeマージ後の `npm run test:run`）

**機能固有の条件:**

5. [ ] `www.s-mitch.com` にアクセスすると `app/marketing/page.tsx` のLPが表示される（middleware による host ベース rewrite。URL バーは `/` のまま）
6. [ ] `s-mitch.com`（apex）にアクセスすると従来通り認証ガードが動作し、未ログインは /login にリダイレクト、ログイン済みは /（home）が表示される
7. [ ] LP の「アプリを始める」CTAをクリックすると `https://s-mitch.com/login` に遷移する
8. [ ] **Vitest ユニットテスト**: middleware を直接呼び、`vi.mock('@supabase/ssr')` で createServerClient をモック化した状態で、`host = www.s-mitch.com` + `pathname = /` のリクエストに対して auth.getUser のモック call count が `0` であることを assert する
9. [ ] **回帰テスト**: middleware を直接呼び、`host = s-mitch.com` / `localhost` の場合に既存の認証フロー（未ログインなら /login への redirect）が変わらないことを assert する
10. [ ] `app/marketing/page.tsx` のHero/CTA/フッターを Vitest で構造テスト（要素の存在 + CTAリンク先 = `https://s-mitch.com/login`）
11. [ ] OGP/meta タグが Next.js Metadata API で設定され、`view-source` で `og:title` `og:description` `og:image` が確認できる
12. [ ] `app/robots.ts` が dynamic 実装で、host = www のときに `allow: '/'` + sitemap URL を返し、host = apex のときに `disallow: '/'` を返す（テストはホスト別に Vitest で出力 JSON を assert）
13. [ ] apex から `/marketing` への直接アクセスは隠蔽されている（rewrite または 404）
14. [ ] preview deployment で `NEXT_PUBLIC_MARKETING_HOSTS` に preview URL を追加すれば LP を確認できる（preview 動作確認手段が存在する）
15. [ ] DNS / Vercel ドメイン追加手順が `_longruns/2026-05-12_lp-branding/deploy-steps.md` に整理され、(1) Vercel 同一プロジェクトに www 追加、(2) Cloudflare CNAME + proxy OFF、(3) env 設定、(4) SSL Issued 待ち、(5) 動作確認の順で記述されている

## 意思決定ガイドライン

- **優先順位**: シンプルさ > 既存 (app) を壊さないこと > LP の凝った演出
- **リスク許容度**: 保守的（既存ユーザー導線の回帰を避ける）
- **不明点の扱い**:
  - LPコピーで迷ったら product-concept.md の表現を優先採用（自前で言葉を作らない）
  - middleware の host 判定で迷ったら「marketing 側を早期 return、apex 側は従来ロジック」のルールに従う
  - codex+gpt-image-2 の領域に踏み込む実装が出てきたらスコープ外と判断し、本runでは扱わない

## 動作確認方法

- **開発サーバー**: `npm run dev`（http://localhost:3000）
  - LP動作確認（dev escape hatch）: `http://localhost:3000/?marketing=1` で LP が表示される（NODE_ENV !== production 限定）
  - LP動作確認（host 偽装）: `curl -H "Host: www.s-mitch.com" http://localhost:3000/` または `/etc/hosts` で `127.0.0.1 www.s-mitch.com` を一時追加してブラウザで `http://www.s-mitch.com:3000`
  - アプリ動作確認: 通常通り `http://localhost:3000`
- **テスト**: `npm run test:run`（Vitest。middleware ユニットテスト含む）
- **ビルド**: `npm run build && npm run lint`
- **確認手順**:
  1. `npm run dev` で起動
  2. `http://localhost:3000/?marketing=1` → LP が表示されることを確認
  3. `curl -H "Host: www.s-mitch.com" -I http://localhost:3000/` → 200 を返し LP コンテンツが返ることを確認
  4. apex（または localhost 通常アクセス）で従来通り認証フローが動くことを確認（未ログイン → /login redirect）
  5. CTAクリック相当のリンクが `https://s-mitch.com/login` を指していることを確認（DOM 検査 or HTMLレスポンスgrep）
  6. `npm run test:run` で全テスト PASS（middleware のモックテスト含む）
  7. `npm run build && npm run lint` 通過
  8. （ステージング）Vercel preview に `NEXT_PUBLIC_MARKETING_HOSTS` を一時設定し、preview URL で LP を確認
  9. （本番リハ）`www.s-mitch.com` で SSL `Issued` 確認後、ブラウザで実アクセスし LP 表示 + CTA → s-mitch.com/login 遷移を確認

## Brain Dumpからの原文メモ

> プロダクト化ロードマップの 1/5（最初に着手）
>
> ## 背景
> 現状、Smitchはマーケティングしやすいメッセージが中心になっていない。コアとなる体験「なりたい自分から習慣を選ぶ」「科学的根拠で努力が数値化される」がUI・対外発信に十分反映されていない。
> LP制作を通じてプロダクトのコアメッセージを確定させ、その後のUI改修・課金設計・リリースの基盤とする。
>
> ## やること
> - メッセージ起点で設計：「なりたい自分 → 習慣 → 科学的根拠で数値化」のストーリーを言語化
> - ターゲット・トーン・コアコピーの確定
> - LPデザイン・実装
> - 公開導線（独自ドメイン or サブドメイン、s-mitch.com との関係整理）
>
> ## 完了条件
> - [ ] コアメッセージが言語化されている（誰に・何を約束するか）
> - [ ] LPが公開されている
> - [ ] LPから本アプリへの導線が機能している
>
> ## 関連
> - 後続: #2 コア機能UI/UX修正（LPで確定したメッセージに沿って再設計）

### Interview での追加決定事項

- URL: **www.s-mitch.com = LP / s-mitch.com (apex) = アプリ**
- 実装場所: 同一 Next.js リポ内に `app/(marketing)/` グループ追加、middleware で host 判定
- i18n: ja 単体、CTAは「アプリを始める」→ /login
- コアメッセージ: product-concept.md を1次ソースに、コピー1案を本run内で決め打ち
- LP の中身（セクション構成・ビジュアル）は codex + gpt-image-2 に委譲。本plan.md は「土台」のみ
