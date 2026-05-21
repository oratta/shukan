# Design: seo-ogp-deploy

## Context

change-A / B で LP コンテンツが揃ったが、SNS シェア / 検索クローラ / 本番デプロイの3点が残課題。Next.js 16 の Metadata API（`src/app/robots.ts` / `src/app/sitemap.ts` / `metadata` export）は dynamic 化が容易で、`next/headers` `headers()` から request host を読めるためサーバーサイドで host 分岐できる。

## Goals

- robots / sitemap で host 別の出し分け（www は SEO 対象、apex は完全 disallow）
- LP の OGP / Twitter Card 設定で SNS シェア時の見栄えを確保
- Vercel + Cloudflare の手動デプロイ手順を deploy-steps.md に集約

## Non-Goals

- Analytics（PostHog 等）の組み込み（後続 issue）
- 構造化データ（JSON-LD）の精細化（v0 では不要）
- 多言語 hreflang 対応（ja 単体）

## Decisions

### D1: `src/app/robots.ts` / `src/app/sitemap.ts` で dynamic 実装
- **判断**: 関数内で `headers()` を呼び `host` を取得、`NEXT_PUBLIC_MARKETING_HOSTS` と比較して分岐
- **代替案 A**: 静的 `public/robots.txt` を置く
- **却下理由**: apex / www で異なる内容を返す必要があり、静的ファイルでは対応できない

### D2: apex は `disallow: '/'`、www は `allow: '/'` + sitemap URL
- **判断**: apex（s-mitch.com 配下）はアプリで認証必須・SEO 不要なので全 disallow。www は marketing なので全 allow + sitemap 指定
- **代替案 A**: apex は robots を返さず（404）、www のみ allow を返す
- **却下理由**: 明示的に disallow を返した方がクローラの挙動が予測可能。空ファイルでは「全許可」と解釈されるリスクあり

### D3: OGP は既存 `public/og-image.png` を流用、`og:url` は marketing host
- **判断**: Build Contract レビュー指摘2 で確認した通り、新規生成より既存流用を優先。`og:url` は `https://www.s-mitch.com/`
- **代替案 A**: `public/og/marketing-1200x630.png` を新規生成
- **却下理由**: 既存画像で十分な品質。新規生成は codex+gpt-image-2 の本格デザイン時にまとめて行う方が効率的

### D4: deploy-steps.md は plan ディレクトリ内に保存
- **判断**: `_longruns/2026-05-12_lp-branding/deploy-steps.md` に置き、本runアーカイブ時に一緒に保管
- **代替案 A**: `docs/deploy/marketing-lp.md`
- **却下理由**: 本run固有の作業手順。長期保管が必要になれば後で `docs/` へ移動

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| `headers()` は Server Component / Server Action / Route Handler のみで利用可能 | robots.ts / sitemap.ts は全て Server コンテキストで動作するため問題なし |
| **Next.js 16 で `headers()` は async API**（v15.0 から非推奨化、v16 で完全 async 化） | `await headers()` を使い、robots/sitemap の default export 関数を `async` で定義する。`const host = (await headers()).get('host')` |
| Vitest テストで `headers()` をモックする必要がある | `vi.mock('next/headers', () => ({ headers: vi.fn() }))` で `headers` を Promise を返す関数モック化し、`mockResolvedValue(new Headers({ host: '...' }))` で host を切り替える |
| Vercel preview deployment では `NEXT_PUBLIC_MARKETING_HOSTS` が未設定 → robots が apex 扱いになり Disallow → preview URL がインデックスされない | 想定通り。preview を SEO 対象にする必要はない。LP 確認時は env を手動追加 |
| `og:image` の絶対 URL 解決 | Next.js 16 では `metadataBase` で base URL を指定すれば相対パスでも絶対化される。`metadataBase: new URL('https://www.s-mitch.com')` を layout に設定 |
| Cloudflare proxy ON で証明書発行失敗 | deploy-steps.md に「proxy OFF 必須」を太字で明記。手順書チェックリストにも入れる |

## Migration Plan

- なし（DB 変更なし）
- 本番反映は deploy-steps.md に従いユーザーが手動実行

## Open Questions

- なし
