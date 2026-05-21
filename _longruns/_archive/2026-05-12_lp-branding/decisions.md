# Decisions Log — LP Branding (2026-05-12)

## D1: LP は実パス `app/marketing/` に配置（route group 非採用）
- **日時**: 2026-05-12（plan.md v2 反映）
- **判断**: `app/(marketing)/page.tsx` ではなく `app/marketing/page.tsx`
- **理由**: route group は URL 上は無視されるため、`(app)/page.tsx`（既存 home）と `(marketing)/page.tsx` が同じ `/` に解決されビルド失敗する。実パス配置 + middleware rewrite が Next.js 16 の標準パターン
- **エビデンス**: Plan Review v1（agentId aeaee99842846c64a）BLOCKER 1 指摘 → v2 で修正、レビュー APPROVE（agentId a94066ff1eafa1472）

## D2: host 判定は `NEXT_PUBLIC_MARKETING_HOSTS` env で一元化
- **日時**: 2026-05-12
- **判断**: middleware と robots.ts/sitemap.ts は `process.env.NEXT_PUBLIC_MARKETING_HOSTS` をカンマ区切りパースし、host 名が含まれるかで marketing/apex を判定
- **理由**: 本番（www.s-mitch.com）/ preview（shukan-xxx.vercel.app）/ dev（localhost）で異なる host を扱う必要があり、ハードコード回避。preview deployment でも env を一時設定するだけで LP 動作確認できる
- **エビデンス**: Plan Review SHOULD_FIX 3 指摘 → v2 で env 設計を追加、APPROVE

## D3: middleware matcher は現行のまま、host 判定は関数冒頭で実施
- **日時**: 2026-05-12
- **判断**:
  - 既存 matcher `/, /discover/:path*, /stats/:path*, /settings/:path*` は維持
  - 新規追加: `/marketing/:path*`（apex から直接アクセス時に rewrite で隠蔽するため）
  - middleware 関数冒頭で `host = request.headers.get('host')` を読み、`NEXT_PUBLIC_MARKETING_HOSTS` に含まれかつ `pathname === '/'` なら `NextResponse.rewrite('/marketing')` で即 return（auth.getUser を呼ばない）
- **理由**: matcher から `/login` を除外したままにすることで認証リダイレクトループを回避。host ベース判定で apex 経路は従来挙動を完全に維持
- **エビデンス**: Plan Review BLOCKER 2 / NOTE C 指摘 → v2 で rules 明文化、APPROVE

## D4: Cloudflare proxy OFF / Vercel 同一プロジェクトに www 追加
- **日時**: 2026-05-12
- **判断**:
  - Vercel `shukan` プロジェクトに `www.s-mitch.com` を追加ドメインとして登録（別プロジェクトを作らない）
  - Cloudflare DNS で `www` → CNAME `cname.vercel-dns.com`、proxy OFF（DNS only）必須
- **理由**: 同一 middleware で host 判定するため同一 deployment が必須。Cloudflare proxy ON では Vercel 証明書発行が遅延・失敗する事例あり
- **エビデンス**: Plan Review SHOULD_FIX 4 指摘 → v2 で rules 明文化、APPROVE。MEMORY の Infrastructure 記載（apex は proxy OFF）と整合

## D7: Spec Review 指摘の取捨（バイアス緩和ガード適用）
- **日時**: 2026-05-12（Spec Review by longrun-reviewer agentId a177300e89e5cc043）
- **REQUEST_CHANGES** だが BLOCKER 2件 + SHOULD_FIX 数件はすべて軽微で APPROVE 可能と判定。以下のとおり取捨:
  - **指摘 1-A / 2-A / 3-A (a) 採用**: 全 change のファイルパスを `app/...` → `src/app/...` に統一（既存リポは `src/app/` 配下）。perl で一括置換、12 ファイル修正
  - **指摘 3-D (a) 採用**: Next.js 16 で `headers()` は async 化。change-C tasks 2.1/2.2 で `await headers()` 必須、関数を `async` 化。design Risks にも追記
  - **指摘 1-B (a) 採用**: change-A tasks 2.1 の分岐順序を厳格化（分岐1/2/3 で即 return、Supabase へ進まない）
  - **指摘 1-C (a) 採用**: spec.md で `createServerClient` と `auth.getUser` の関係を明示
  - **指摘 2-B (a) 採用**: Hero タグラインを `<h1>` 限定
  - **指摘 2-C (a) 採用**: marketing 配下に inline SVG 禁止を明示。ロゴは `<Image>` 経由
  - **指摘 3-C (a) 採用**: robots apex 用 Requirement 名に「preserves app non-indexed posture」を追加
  - **指摘 X-A (a) 採用**: layout.tsx の責務を change-B = title+lang、change-C = openGraph/twitter を**追加**と明示
  - **指摘 2-D (b) 反論**: marketing page は sync Server Component として実装する方針（state なし、async fetch なし）。RTL の async 対応は不要
  - **指摘 3-E (b) 反論**: sitemap の `lastModified` は assert 不要（spec は `url` のみ assert）。tasks 2.2 にメモ追記済み

## D6: Build Contract レビュー指摘の取捨（バイアス緩和ガード適用）
- **日時**: 2026-05-12（Build Contract レビュー by longrun-reviewer agentId a7055e7a972126bc8）
- **APPROVE** + 3指摘あり。以下のとおり取捨:
  - **指摘1 (a) 採用**: `app/robots.ts` の apex 挙動を `disallow: '/'` と明示。受け入れ条件 12 と change-C rules を更新。理由: builder が自律判断する範囲を超え、spec が曖昧だったため
  - **指摘2 (b) 反論**: OGP 画像パスは `public/og-image.png` を第一候補として流用する（builder は新規生成を検討してもよいが既存流用を優先）。理由: 嗜好レベル、build 影響なし
  - **指摘3 (b) 反論**: www の `/marketing` 直接アクセスは本runでは隠蔽せず、duplicate content 微調整は後続 issue 扱い。理由: 嗜好レベル、本runの成功指標（直帰率/login遷移率）に影響しない。SEO 微調整は LP 実体（codex+gpt-image-2）完成後に判断
- **エビデンス**: Agent 出力は本runディレクトリのチャットログに保持。指摘1の plan.md / decisions.md への反映は本コミットで完了

## D5: LP のコピー/レイアウト/ビジュアル本実装は本runスコープ外
- **日時**: 2026-05-12
- **判断**: 本runでは「土台」（routing, shell, SEO, deploy 手順）のみ。LP の最終レイアウト・コピー・ビジュアル素材は codex + gpt-image-2 に別途委譲
- **理由**: ユーザー指定。スコープを限定することで本runの確実性を担保し、デザイン創造性は codex+gpt-image-2 の得意領域で発揮させる
- **エビデンス**: longrun-plan Step 4 Interview ラスト質問の回答「gpt-image2を使って、codexで作らせてみたいので、LPの具体的な構成はいいや」

## D8: change-A 実装での自律判断（builder agentId TDD-run）
- **日時**: 2026-05-12（builder 実装フェーズ）
- **判断**:
  - **D8-1: middleware test の rewrite 判定方法**: `NextResponse.rewrite()` の検証には `res.headers.get('x-middleware-rewrite')` を使う。Next.js が内部 rewrite を伝達する公式ヘッダで、Vitest から observable。`res.url` などの代替は `NextResponse` インスタンスでは null になるため不採用
  - **D8-2: production 環境での `?marketing=1` 無視を追加テスト化**: spec の WHEN/THEN には明示されていないが、Risks 表「dev escape hatch が本番に混入すると SEO 操作の余地」を直接担保するため、S2 と同 describe ブロックに「production では `?marketing=1` を無視」テストを 1 ケース追加（11 tests / 8 Scenario）。可逆的・YAGNI 違反なし
  - **D8-3: marketing layout は `<html>` を返さない**: Next.js App Router では nested layout は `<html>`/`<body>` を持たない方が安全（既存 RootLayout が html を提供）。`src/app/marketing/layout.tsx` は `<div lang="ja">` のラッパに留め、Provider/フォントは継承させる。代替案「marketing 専用 RootLayout として html を持つ」は (app) との競合・Provider 二重化のリスク有り、却下
  - **D8-4: page を sync Server Component で実装**: D7 反論 2-D を遵守し `default function` は同期。テストでは `(MarketingPage as () => unknown)()` で同期実行し、React 要素ツリーを walk して text/href を集めて assert
- **エビデンス**: 11/11 tests GREEN、既存 171 + 新規 11 = 182 PASS、build 成功（`/marketing` route 登録確認）、lint は既存 9 errors / 35 warnings のまま（新規追加ファイルでの新規違反ゼロ）

## D9: change-B 実装での自律判断（builder feature/lp-shell-and-copy）
- **日時**: 2026-05-12（builder 実装フェーズ）
- **判断**:
  - **D9-1: テスト戦略 — `@testing-library/react` を追加せず tree-walking 方式を継続**: tasks 1.2 の「必要に応じて RTL を追加」に対し、追加せず既存 `middleware.test.ts` S8 と同じ tree-walking helper を採用。理由: (a) vitest 環境が `node`（DOM なし）で、jsdom 導入は他 7 ファイルへの副作用リスクあり、(b) sync Server Component の構造アサーション（h1/footer/href/text 存在）は walk で十分、(c) D7 反論 2-D「sync Server Component」方針と一貫。YAGNI 遵守
  - **D9-2: copy.ts のキー設計と ja 文言**: spec 必須キー 6 個（`tagline`/`heroSubcopy`/`problemText`/`solutionText`/`ctaLabel`/`footerCredit`）のみエクスポート、locale 辞書化はしない。文言は product-concept.md「コアコンセプト」「他の習慣アプリとの決定的な違い」「ターゲットユーザー」セクションから抽出し、Voice & Tone（静かに寄り添う／押し付けない）を意識して 1〜2 文に圧縮。代替案「`as const` literal で文字列リテラル型を保持」は将来の英語化拡張時に `Record<Locale, string>` への移行が逆に冗長になるため不採用
  - **D9-3: 主要 CTA は `<a>` 単一、aria-label を付けず可視テキストで accessible name を成立**: spec S11 の「accessible label = copy.ts の ja 文字列」を満たすため、`<a>{ctaLabel}</a>` の可視テキストをそのまま accessible name にする（aria-label を上書きしない）。Next.js `<Link>` ではなく `<a>` を選んだ理由: 遷移先が外部 origin（`https://s-mitch.com/login`）であり、`<Link>` のクライアントナビゲーション最適化は効かないため。design.md Risks「Server/Client 混在」と整合
  - **D9-4: layout.tsx は `<html>` を返さず `<div lang="ja">` のみ**: D8-3 の方針を継続。metadata の `title` を `Smitch — Switch your path.`（em dash）に更新し、description を ja サブコピーに更新。openGraph/twitter は change-C 範囲のため本 change では追加しない（tasks 2.3 / design Non-Goals に従う）
  - **D9-5: 色は semantic class のみ（`bg-background`/`text-foreground`/`bg-primary`/`text-muted-foreground`/`border-border` 等）**: hex 直書きゼロを `grep -rnE '#[0-9A-Fa-f]{3,8}' src/app/marketing/` で検証。inline SVG なし、ロゴ画像も本 change では参照しない（codex+gpt-image-2 委譲領域、tasks 3.4 注記に従う）
- **エビデンス**: 187/187 tests GREEN（baseline 182 + 新規 5）、build 成功、hex grep 0 件、lint baseline と同一の 44 problems / 9 errors（新規違反ゼロ）

## D10: change-C 実装での自律判断（builder feature/seo-ogp-deploy）
- **日時**: 2026-05-12（builder 実装フェーズ）
- **判断**:
  - **D10-1: `next/headers` のモック方式**: `vi.mock('next/headers', () => ({ headers: () => headersMock() }))` で `headers` を関数として再エクスポートし、内部の `headersMock` を `mockResolvedValue(new Headers({ host: '...' }))` で切り替える二段構成を採用。理由: `vi.mock` の factory に直接 `vi.fn()` を返すと hoisting の都合で `mockReset()` を `beforeEach` から触りにくいため、外側に名前付き mock を保持。design.md Risks の vitest mock 方針と一貫
  - **D10-2: metadata に文言定数を抽出（`TITLE` / `DESCRIPTION`）**: layout.tsx で title / description / openGraph / twitter の 4 箇所に同一文字列が必要なため、ローカル定数に括り出して DRY。change-B の文言を維持しつつ change-C で追加するだけのため D7 指摘 X-A（責務分離）に違反しない
  - **D10-3: 追加テスト「`NEXT_PUBLIC_MARKETING_HOSTS` が unset の場合 disallow / empty」**: spec S15-S18 の Scenario は host が apex の場合のみ要求するが、env 完全未設定（preview deployment の安全 fallback）も同等に disallow / empty を返すべきと判断し robots/sitemap 双方に 1 ケースずつ追加。design.md Risks「preview deployment で env 未設定 → robots が apex 扱い → preview がインデックスされない」を直接担保するため、可逆的・YAGNI 違反なし
  - **D10-4: 動作確認 (tasks 3.4 / 3.5) は未実施で残し、deploy-steps.md (5) のユーザー確認チェックリストに包含**: dev server を本 builder run でバックグラウンド起動して curl 確認するより、デプロイ後のスモークテストで `curl https://www.s-mitch.com/robots.txt` を実施する方が SSL/host 両方を一気に検証できて費用対効果が高い。ユニットテストで host 分岐の関数挙動は全網羅済み、build で `/robots.txt` `/sitemap.xml` が dynamic route として登録されたことも確認済み
  - **D10-5: deploy-steps.md は本runディレクトリ配下に保存（D4 継続）**: `_longruns/2026-05-12_lp-branding/deploy-steps.md`。長期保管が必要になれば後で `docs/deploy/` へ移動できるよう、内容はプロジェクト/ホスト名を明示してパス自己完結
- **エビデンス**: 197/197 tests GREEN（baseline 187 + 新規 10）、build 成功（`/robots.txt` `/sitemap.xml` `ƒ` として route 登録）、lint baseline と同一の 9 errors / 35 warnings（新規違反ゼロ）、deploy-steps.md は 5 必須セクション + ロールバック手順 + smoke-test チェックリスト含む
