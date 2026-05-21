# Proposal: seo-ogp-deploy

## Why

change-A で routing 基盤、change-B で LP コンテンツが揃ったが、SEO（robots / sitemap）と OGP（SNS シェア時の見え方）が未整備のままだと公開後の検索流入・SNS 露出が機能しない。同時に Vercel / Cloudflare の本番デプロイ手順を deploy-steps.md に集約し、ユーザーが手作業で追従できる状態を作る。

## What Changes

- **新規追加**: `src/app/robots.ts`（dynamic）— host を `headers()` から読み、www（`NEXT_PUBLIC_MARKETING_HOSTS` に含まれる場合）は `allow: '/'` + sitemap URL、apex は `disallow: '/'` を返す
- **新規追加**: `src/app/sitemap.ts`（dynamic）— www は `/` を含む URL リスト、apex は空配列
- **更新**: `src/app/marketing/layout.tsx`（または `page.tsx`）に Next.js Metadata API で OGP/Twitter Card メタデータを設定（`og:title`, `og:description`, `og:image`, `twitter:card` 等）
- **新規追加**: `_longruns/2026-05-12_lp-branding/deploy-steps.md` — Vercel ドメイン追加 / Cloudflare DNS / env 設定 / SSL 待ち / 動作確認チェックリスト
- **新規追加**: `src/__tests__/robots.test.ts` / `src/__tests__/sitemap.test.ts` — host 別出力を assert

## Capabilities

### New Capabilities
- `marketing-seo`: LP の SEO・OGP 提供能力

### Modified Capabilities
- なし

## Impact

- **影響コード**: `src/app/robots.ts` / `src/app/sitemap.ts` / `src/app/marketing/layout.tsx` / `src/__tests__/robots.test.ts` / `src/__tests__/sitemap.test.ts`
- **影響成果物**: `_longruns/2026-05-12_lp-branding/deploy-steps.md`（plan ディレクトリ内のドキュメント）
- **影響インフラ**: Vercel `shukan` プロジェクトに `www.s-mitch.com` 追加 / Cloudflare DNS `www` CNAME / Vercel env `NEXT_PUBLIC_MARKETING_HOSTS` 設定 — 全てユーザーが手作業で実行する手順を deploy-steps.md に記載
- **影響範囲**: apex 側がこれまで `robots.txt` を返していなかったため、`disallow: '/'` を返すようになる変更が新規発生。アプリは認証必須で SEO 不要のため副作用なし
