## Why

Smitch を PWA としてホーム画面に追加可能（installable）にする第一歩として、Web App Manifest の配信を Next.js のコード管理下に移す必要がある。

現状の `public/manifest.json` は静的ファイルで:
1. **型安全でない** — Next.js の `MetadataRoute.Manifest` 型による検証が効かず、フィールドのタイプミスや欠落をビルド時に検出できない
2. **テスト不可能** — JSON ファイルの内容を unit テストでアサートする経路がなく、installability 必須項目（name / icons 192・512 / start_url / display）の退行を検知できない
3. **強化フィールドが不足** — `id` / `lang` / `dir` / `categories` がなく、インストール後のアプリ識別やストア的メタデータが弱い

`src/app/manifest.ts` に移行すれば、Next.js が `/manifest.webmanifest` を自動配信し、TypeScript の型チェックと Vitest の unit テストで manifest 内容を恒久的に担保できる。後続 change（install-prompt-ui）のインストール導線は、この manifest が正しく配信されていることが前提となる。

## What Changes

- `src/app/manifest.ts` を新設し、`MetadataRoute.Manifest` を返す default export を実装する。既存 `public/manifest.json` の内容（name: "Smitch - Switch your path" / short_name: "Smitch" / description / start_url: "/" / display: "standalone" / background_color: "#F8F9FA" / theme_color: "#2B4162" / orientation: "portrait-primary" / icons 192・512）をそのまま移行し、`id` / `lang` / `dir` / `categories` を追加して強化する
- `public/manifest.json` を削除する（配信元の二重化を防ぐ）
- `src/app/layout.tsx` の `manifest: "/manifest.json"` を `manifest: "/manifest.webmanifest"` に更新する（Next.js は manifest.ts から `/manifest.webmanifest` を自動配信する。metadata.manifest はその URL への参照であり両方必要）
- unit テスト（Vitest, node 環境, `src/__tests__/` 配下）を追加: manifest 返り値の必須項目検証、layout.tsx の旧パス参照排除、public/manifest.json の不存在検証

**制約（plan.md config.yaml rules）:**
- Service Worker を追加しない。manifest と metadata の変更のみに留める
- 既存のテーマカラー（#2B4162 / #F8F9FA）とブランド文言を変更しない
- icons の purpose は未指定のまま据え置く（maskable にしない。既存アイコンがセーフゾーンを満たすか不明なため）

## Capabilities

### New Capabilities

- `pwa-manifest`: Web App Manifest を `src/app/manifest.ts` から型安全に配信し、PWA installability の必須項目を unit テストで担保する

### Modified Capabilities

（なし — 既存 capability への変更はない。layout.tsx の変更は manifest 参照 URL の1行のみ）

## Impact

- `src/app/manifest.ts` — 新設（MetadataRoute.Manifest の default export）
- `public/manifest.json` — 削除
- `src/app/layout.tsx` — `metadata.manifest` の参照先を `/manifest.webmanifest` に変更（1行）
- `src/__tests__/pwa-manifest.test.ts` — 新設（unit テスト）
