# Tasks: seo-ogp-deploy

## 1. テスト先行（RED）

- [x] 1.1 `src/__tests__/robots.test.ts` を新規作成
  - Scenario: robots for www host allows all
  - Scenario: robots for apex disallows everything
  - `vi.mock('next/headers')` で `headers` を関数モック化、`host` を切り替えて assert
- [x] 1.2 `src/__tests__/sitemap.test.ts` を新規作成
  - Scenario: sitemap for www lists root URL
  - Scenario: sitemap for apex is empty
- [x] 1.3 `src/__tests__/marketing-metadata.test.ts`（任意）または既存 marketing-page test に metadata 検証を追加
  - Scenario: og:title and og:image present in HTML（あるいは exports `metadata` の構造を直接 assert）
- [x] 1.4 `npm run test:run` で対象シナリオ RED

## 2. 最小実装（GREEN）

- [x] 2.1 `src/app/robots.ts` を新規作成（**Next.js 16 で `headers()` は async API。`await headers()` 必須**）
  - `import { headers } from 'next/headers'`
  - **`export default async function robots(): Promise<MetadataRoute.Robots>`** として定義
  - 関数内で `const host = (await headers()).get('host') ?? ''`
  - `NEXT_PUBLIC_MARKETING_HOSTS` をカンマ区切りパース（`.split(',').map(s => s.trim()).filter(Boolean)`）
  - host が含まれれば `{ rules: [{ userAgent: '*', allow: '/' }], sitemap: 'https://www.s-mitch.com/sitemap.xml' }`
  - そうでなければ `{ rules: [{ userAgent: '*', disallow: '/' }] }`
- [x] 2.2 `src/app/sitemap.ts` を新規作成（同じく **async**）
  - `export default async function sitemap(): Promise<MetadataRoute.Sitemap>`
  - `const host = (await headers()).get('host') ?? ''`
  - 同じく host 判定し、www のときのみ `[{ url: 'https://www.s-mitch.com/', lastModified: new Date() }]`、それ以外は `[]`
  - 注意: Vitest では `lastModified` は assert せず `url` のみ assert する（テスト実行時刻に依存しないため）
- [x] 2.3 `src/app/marketing/layout.tsx` の Metadata API に OGP/Twitter Card を **追加**（change-B で設定済みの title / lang は上書きせず追記）
  - `metadataBase: new URL('https://www.s-mitch.com')`
  - `openGraph: { title, description, url, images: ['/og-image.png'], type: 'website' }`（`/og-image.png` は既存 `public/og-image.png` を流用）
  - `twitter: { card: 'summary_large_image', title, description, images: ['/og-image.png'] }`
- [x] 2.4 `_longruns/2026-05-12_lp-branding/deploy-steps.md` を新規作成（5ステップ列挙）
- [x] 2.5 `npm run test:run` 全 GREEN

## 3. 品質確認

- [x] 3.1 `npm run lint` エラーゼロ
- [x] 3.2 `npm run build` 成功
- [x] 3.3 既存テスト＋change-A/B テストが全 PASS
- [ ] 3.4 `curl -H "Host: www.s-mitch.com" http://localhost:3000/robots.txt` で正しい robots を返すか動作確認（dev server 動作確認はデプロイ前ユーザー手動 verification として残す。ユニットテストで網羅済み）
- [ ] 3.5 `curl http://localhost:3000/robots.txt`（apex 相当）で `Disallow: /` を確認（同上）
- [x] 3.6 verification-guide.md 該当 Scenario `[x]`
