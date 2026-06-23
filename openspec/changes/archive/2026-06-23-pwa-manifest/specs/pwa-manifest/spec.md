## ADDED Requirements

### Requirement: Web App Manifest is served from manifest.ts at /manifest.webmanifest

アプリは `src/app/manifest.ts`（`MetadataRoute.Manifest` を返す default export）から Web App Manifest を生成し、`/manifest.webmanifest` で配信しなければならない（SHALL）。manifest は既存ブランド値（name: "Smitch - Switch your path" / short_name: "Smitch" / theme_color: "#2B4162" / background_color: "#F8F9FA"）を維持し、installability 必須項目（name / icons 192・512 / start_url / display: "standalone"）と強化フィールド（id / lang / dir / categories）を含む。

#### Scenario: Manifest is installable-complete at /manifest.webmanifest
- **WHEN** ブラウザで `/manifest.webmanifest` にアクセスする
- **THEN** `name: "Smitch - Switch your path"`、`short_name: "Smitch"`、192px と 512px の icons、`start_url: "/"`、`display: "standalone"` を含む JSON が返る
- **AND** `id` / `lang` / `dir` / `categories` フィールドが含まれる
- **AND** `theme_color: "#2B4162"` と `background_color: "#F8F9FA"` が変更されずに含まれる

#### Scenario: Manifest content is verified by unit tests
- **WHEN** `npm run test:run` を実行する
- **THEN** `src/app/manifest.ts` の返り値が name / short_name / 192px・512px アイコン / start_url / `display: "standalone"` を含むことを検証する unit テストが PASS する

### Requirement: HTML references the new manifest URL exclusively

`src/app/layout.tsx` の `metadata.manifest` は `/manifest.webmanifest` を参照しなければならず（SHALL）、旧 `public/manifest.json` は削除して配信元を一本化しなければならない（SHALL）。

#### Scenario: Page links to /manifest.webmanifest and old file is gone
- **WHEN** アプリの任意のページを開いて HTML の `<link rel="manifest">` を確認する
- **THEN** href が `/manifest.webmanifest` であり、`/manifest.json` への参照は存在しない
- **AND** リポジトリに `public/manifest.json` が存在しない

#### Scenario: Reference consistency is verified by unit tests
- **WHEN** `npm run test:run` を実行する
- **THEN** `src/app/layout.tsx` が `/manifest.json` を参照していないこと、および `public/manifest.json` が存在しないことを検証する unit テストが PASS する
