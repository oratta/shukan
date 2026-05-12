# Tasks: marketing-routing-middleware

## 1. テスト先行（RED）

- [x] 1.1 `src/__tests__/middleware.test.ts` を新規作成し、host 別シナリオの失敗テストを書く
  - Scenario: www host returns marketing page at root
  - Scenario: dev escape hatch in non-production
  - Scenario: apex unauthenticated user gets redirected to login（既存挙動の回帰テスト）
  - Scenario: apex authenticated user reaches home（既存挙動の回帰テスト）
  - Scenario: localhost without escape hatch behaves as apex
  - Scenario: apex direct /marketing rewritten to root
  - Scenario: Supabase mock not called for www root
- [x] 1.2 `vi.mock('@supabase/ssr')` で `createServerClient` をモックし、call count を assert できる構造にする
- [x] 1.3 `npm run test:run` を実行して全シナリオが RED であることを確認

## 2. 最小実装（GREEN）

- [x] 2.1 `src/middleware.ts` に host 判定 → marketing rewrite ロジックを追加（**分岐順序を厳格に**）
  - 関数冒頭で `host = request.headers.get('host') ?? ''` を取得
  - `process.env.NEXT_PUBLIC_MARKETING_HOSTS?.split(',').map(s => s.trim()).filter(Boolean) ?? []` で marketing host 集合を構築
  - **分岐1**: `host` が集合に含まれかつ `request.nextUrl.pathname === '/'` のとき → `NextResponse.rewrite(new URL('/marketing', request.url))` を `return`（**即終了、Supabase へは進まない**）
  - **分岐2**: dev escape hatch — `process.env.NODE_ENV !== 'production' && request.nextUrl.searchParams.get('marketing') === '1' && request.nextUrl.pathname === '/'` でも分岐1と同様に rewrite を return
  - **分岐3**: `host` が集合に含まれず `pathname === '/marketing'` のとき → `NextResponse.rewrite(new URL('/', request.url))` を `return`（隠蔽、Supabase へは進まない）。spec の `subject to existing authentication` という記載は rewrite 後の `/` を Next.js が処理する際 middleware が再び発火しないことを示しており、本 middleware 内で `auth.getUser` を呼ぶ意味ではない
  - 上記いずれにも該当しない場合のみ既存の Supabase 認証ロジックへ進む
- [x] 2.2 `src/middleware.ts` の `config.matcher` に `/marketing/:path*` を追加（既存 4 パターンに加える）
- [x] 2.3 `src/app/marketing/layout.tsx` を新規作成（既存 (app) layout のヘッダー/ナビを継承しない軽量レイアウト）
- [x] 2.4 `src/app/marketing/page.tsx` を新規作成（Hero プレースホルダ + CTA → `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://s-mitch.com'}/login` + フッター）
- [x] 2.5 `.env.local.example`（存在すれば）または `.env.local`（存在すれば dev 用）に `NEXT_PUBLIC_MARKETING_HOSTS=www.s-mitch.com` のコメント例を追記
- [x] 2.6 `npm run test:run` で全シナリオが GREEN になることを確認

## 3. 品質確認（REFACTOR + 検証）

- [x] 3.1 `npm run lint` を実行してエラーゼロ
- [x] 3.2 `npm run build` を実行してビルド成功
- [x] 3.3 既存テスト（171件）が全 PASS であることを確認
- [x] 3.4 verification-guide.md のテスト実装完了・ロジック実装完了の `[x]` をマーク
