## 1. テスト先行（Red）

- [ ] 1.1 `src/__tests__/pwa-manifest.test.ts` を新設し、`src/app/manifest.ts` の default export 返り値が `name: "Smitch - Switch your path"` / `short_name: "Smitch"` / 192px・512px アイコン / `start_url: "/"` / `display: "standalone"` を含むことをアサートするテストを書く（この時点では manifest.ts 不在で FAIL）
- [ ] 1.2 同テストに `id` / `lang` / `dir` / `categories` の存在と、`theme_color: "#2B4162"` / `background_color: "#F8F9FA"` の維持をアサートするケースを追加する
- [ ] 1.3 同テストに `src/app/layout.tsx` のファイル内容が `"/manifest.json"` を含まず `/manifest.webmanifest` を参照していることをアサートするケースを追加する（fs 読み込み・node 環境）
- [ ] 1.4 同テストに `public/manifest.json` が存在しないことをアサートするケースを追加する
- [ ] 1.5 `npm run test:run` で新規テストが FAIL（Red）であることを確認する

## 2. 実装（Green）

- [ ] 2.1 `src/app/manifest.ts` を新設: `MetadataRoute.Manifest` を返す default export。既存 `public/manifest.json` の全フィールド（name / short_name / description / start_url / display / background_color / theme_color / orientation / icons 192・512）を移行し、`id: "/"` / `lang` / `dir: "ltr"` / `categories` を追加する。icons の purpose は未指定のまま（maskable にしない）
- [ ] 2.2 `src/app/layout.tsx` の `manifest: "/manifest.json"` を `manifest: "/manifest.webmanifest"` に更新する
- [ ] 2.3 `public/manifest.json` を削除する
- [ ] 2.4 `npm run test:run` で全テスト PASS（Green）を確認する

## 3. 検証

- [ ] 3.1 TypeScript 型チェック（`npx tsc --noEmit`）エラーなし
- [ ] 3.2 Next.js ビルド（`npx next build`）エラーなし
- [ ] 3.3 Service Worker・追加依存パッケージが入っていないこと、テーマカラー・ブランド文言が変更されていないことを diff で確認する
- [ ] 3.4 （手動）`npm run dev` → Chrome DevTools → Application → Manifest で `/manifest.webmanifest` が読め、installability エラーがないことを確認する
