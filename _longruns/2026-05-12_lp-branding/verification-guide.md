# Verification Guide — LP Branding

## 環境
- URL: ローカル `http://localhost:3000`、本番 `https://www.s-mitch.com`（LP） / `https://s-mitch.com`（app）
- 起動: `npm run dev`
- テスト: `npm run test:run`
- ビルド: `npm run build && npm run lint`

## change-A: marketing-routing-middleware

### S1: www host returns marketing page at root
- WHEN: GET `host: www.s-mitch.com` `pathname: /`
- THEN: middleware が `/marketing` に internal rewrite、`auth.getUser` 非呼び出し
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S2: dev escape hatch in non-production
- WHEN: dev サーバーで `pathname: /` + `?marketing=1`
- THEN: `/marketing` に rewrite
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S3: apex unauthenticated user gets redirected to login
- WHEN: 未ログイン GET `host: s-mitch.com` `pathname: /`
- THEN: `/login` へリダイレクト（既存挙動）
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S4: apex authenticated user reaches home
- WHEN: ログイン済み GET `host: s-mitch.com` `pathname: /`
- THEN: 既存 `(app)/page.tsx` に到達
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S5: localhost without escape hatch behaves as apex
- WHEN: GET `host: localhost:3000` `pathname: /` 未ログイン
- THEN: 既存認証フロー（`/login` redirect）
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S6: apex direct /marketing rewritten to root
- WHEN: GET `host: s-mitch.com` `pathname: /marketing`
- THEN: `/` に internal rewrite で隠蔽
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S7: Supabase mock not called for www root
- WHEN: Vitest で `@supabase/ssr` モック、`host: www.s-mitch.com` `pathname: /`
- THEN: `createServerClient` mock call count = 0
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S8: /marketing renders standalone layout
- WHEN: marketing route がレンダリングされる
- THEN: Hero プレースホルダ + CTA → apex login + フッター（privacy/terms）が `(app)` 依存なしで描画
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

## change-B: lp-shell-and-copy

### S9: Hero section is visible
- WHEN: marketing page がレンダリングされる
- THEN: `<h1>` に "Switch your path."、ja サブコピーに「なりたい自分」「科学」
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S10: Problem and Solution texts coexist
- WHEN: marketing page がレンダリングされる
- THEN: ja Problem テキスト + Solution テキストの両方が存在
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S11: Primary CTA href points to login
- WHEN: marketing page がレンダリングされる
- THEN: 1 つの主要 CTA、href は `https://s-mitch.com/login`（または `NEXT_PUBLIC_APP_URL/login`）、accessible label は `copy.ts` の ja 文字列
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S12: Footer links resolve to legal pages
- WHEN: marketing page がレンダリングされる
- THEN: footer に `href="/privacy"` と `href="/terms"`、`Genetta Inc` テキスト
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S13: copy.ts exports core strings
- WHEN: ビルド
- THEN: `src/app/marketing/copy.ts` が `tagline`/`heroSubcopy`/`problemText`/`solutionText`/`ctaLabel`/`footerCredit` をエクスポート
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S14: No hardcoded hex in marketing pages
- WHEN: `src/app/marketing/**/*.{ts,tsx}` を hex `#[0-9A-Fa-f]{3,8}` で grep
- THEN: match count = 0（ロゴは `<Image>` 経由）
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

## change-C: seo-ogp-deploy

### S15: robots for www host allows all
- WHEN: `src/app/robots.ts` default export、host = `www.s-mitch.com`
- THEN: `{ rules: [{ userAgent: '*', allow: '/' }], sitemap: 'https://www.s-mitch.com/sitemap.xml' }`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S16: robots for apex disallows everything
- WHEN: `src/app/robots.ts`、host = `s-mitch.com`
- THEN: `{ rules: [{ userAgent: '*', disallow: '/' }] }`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S17: sitemap for www lists root URL
- WHEN: `src/app/sitemap.ts`、host = `www.s-mitch.com`
- THEN: `url` に `https://www.s-mitch.com/` を含む配列
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S18: sitemap for apex is empty
- WHEN: `src/app/sitemap.ts`、host = `s-mitch.com`
- THEN: 配列長 = 0
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S19: og:title and og:image present in HTML
- WHEN: marketing page HTML レスポンス
- THEN: `<meta property="og:title"`, `<meta property="og:description"`, `<meta property="og:image"`, `<meta name="twitter:card"` を含む
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S20: deploy-steps.md contains required steps
- WHEN: `_longruns/2026-05-12_lp-branding/deploy-steps.md` が存在
- THEN: (1) Vercel ドメイン追加 (2) Cloudflare CNAME proxy OFF (3) env 設定 (4) SSL 待ち (5) 動作確認チェックリスト
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了
