# Proposal: marketing-routing-middleware

## Why

Smitch のマーケティング起点として `www.s-mitch.com` に LP を公開する必要がある。一方 `s-mitch.com`（apex）は既存ユーザーのアプリ環境として認証ガード・既存ルートを維持する必要がある。同一 Next.js デプロイで host ベースに出し分ける routing 基盤を作ることで、別リポ・別デプロイのオーバーヘッドなしに2ロール対応を実現する。

## What Changes

- **新規追加**: `src/app/marketing/page.tsx` および `src/app/marketing/layout.tsx`（実パス。route group `(marketing)` は使わない／`(app)/page.tsx` との `/` 衝突回避）
- **新規追加**: `src/middleware.ts` の関数冒頭に host ベース rewrite ロジック
  - host が `NEXT_PUBLIC_MARKETING_HOSTS`（カンマ区切り env）に含まれかつ `pathname === '/'` のとき `NextResponse.rewrite(new URL('/marketing', request.url))` で即 return（Supabase `auth.getUser()` を呼ばない）
  - apex（www 以外）から `/marketing` 直接アクセスは `NextResponse.rewrite(new URL('/', request.url))` で隠蔽
  - 上記の隠蔽を有効化するため、middleware matcher に `/marketing/:path*` を追加（既存 4 パターンは維持）
- **新規追加**: dev 限定 escape hatch — `NODE_ENV !== 'production'` のとき `?marketing=1` クエリで marketing rewrite を発動可能
- **新規追加**: `NEXT_PUBLIC_MARKETING_HOSTS` 環境変数（本番値 `www.s-mitch.com`、preview/dev で追加可能）
- **新規追加**: `src/__tests__/middleware.test.ts` — Vitest + `vi.mock('@supabase/ssr')` で middleware を直接呼び、host 別の挙動と auth.getUser 非呼び出しを assert

## Capabilities

### New Capabilities
- `marketing-host-routing`: host ベースで apex / www を分岐するルーティング能力

### Modified Capabilities
- なし（既存 spec は無く、middleware の挙動は本runで初めて spec 化される）

## Impact

- **影響コード**: `src/middleware.ts` / `src/app/marketing/page.tsx`（プレースホルダ）/ `src/app/marketing/layout.tsx`（プレースホルダ）/ `src/__tests__/middleware.test.ts`（新規テスト）
- **影響 API / 外部依存**: なし（Supabase スキーマ無変更、DB 無変更）
- **影響インフラ**: 環境変数 `NEXT_PUBLIC_MARKETING_HOSTS` を Vercel preview/production に追加する必要（手動作業、change-C で deploy-steps.md に記載）
- **影響範囲限定**: 既存 (app) 配下の `/`, `/discover`, `/stats`, `/settings`, `/login` の認証フローは一切変更しない
