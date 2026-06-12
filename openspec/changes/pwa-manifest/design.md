## Context

- スタック: Next.js 16.1.6 (App Router / Turbopack), TypeScript 5, Vitest (`environment: 'node'`)
- Next.js App Router は `src/app/manifest.ts` が `MetadataRoute.Manifest` を返す default export を持つ場合、ビルド時に `/manifest.webmanifest` として自動配信する（Content-Type: `application/manifest+json`）
- 現在は `public/manifest.json` を静的配信し、`src/app/layout.tsx` の `metadata.manifest = "/manifest.json"` が `<link rel="manifest">` を生成している
- Chrome の installability 要件は「有効な manifest（name / icons 192・512 / start_url / display）+ HTTPS」。Service Worker は不要

## Goals / Non-Goals

**Goals:**
- manifest を型安全な TypeScript コードに移行し、unit テストで必須項目を担保する
- `id` / `lang` / `dir` / `categories` を追加して manifest を強化する
- 配信元を `/manifest.webmanifest` に一本化する（`public/manifest.json` 削除）

**Non-Goals:**
- Service Worker / オフライン対応（plan.md 制約: SW 禁止）
- maskable アイコン・screenshots の追加（専用アセット制作が必要。将来改善）
- テーマカラー・ブランド文言の変更
- インストール導線 UI（後続 change-B: install-prompt-ui のスコープ）

## Decisions

### D1: `src/app/manifest.ts`（静的関数）で配信する

`MetadataRoute.Manifest` を返す同期の default export 関数とする。動的要素（locale 別 manifest 等）は不要なので、リクエスト依存の処理は入れない。Next.js がビルド時に静的生成し `/manifest.webmanifest` で配信する。

代替案: `public/manifest.json` 維持 → 型チェック・テスト不可のため却下。`route handler` 自作 → Next.js 標準のメタデータ規約で足りるため却下。

### D2: 移行内容は既存値の完全踏襲 + 4フィールド追加

| フィールド | 値 | 備考 |
|---|---|---|
| name | "Smitch - Switch your path" | 既存値そのまま |
| short_name | "Smitch" | 既存値そのまま |
| description | "Evidence-based life path builder. Choose the right habits backed by science." | 既存値そのまま |
| start_url | "/" | 既存値そのまま |
| display | "standalone" | 既存値そのまま |
| background_color | "#F8F9FA" | 既存値そのまま（変更禁止） |
| theme_color | "#2B4162" | 既存値そのまま（変更禁止） |
| orientation | "portrait-primary" | 既存値そのまま |
| icons | 192 / 512 PNG（purpose 未指定） | 既存値そのまま。maskable にしない |
| **id** | "/" | 追加。アプリ識別子。start_url と一致させる |
| **lang** | "en" | 追加。manifest 内テキスト（name/description が英語）に合わせる |
| **dir** | "ltr" | 追加 |
| **categories** | ["health", "lifestyle", "productivity"] | 追加 |

### D3: `metadata.manifest` の更新は必須（両方必要）

manifest.ts を置くだけでは `<link rel="manifest">` の href は変わらない。`src/app/layout.tsx` の `metadata.manifest` を `/manifest.webmanifest` に更新し、配信実体（manifest.ts → /manifest.webmanifest）と HTML 参照を一致させる。旧 `public/manifest.json` は削除して二重配信を防ぐ。

### D4: テストは node 環境の unit テスト3系統

DOM 環境は導入しない（plan.md 制約）。`src/__tests__/pwa-manifest.test.ts` に集約:

1. **manifest 返り値検証**: `src/app/manifest.ts` の default export を直接 import して呼び出し、name / short_name / 192・512 アイコン / start_url / display: "standalone" を含むことをアサート
2. **layout.tsx 参照検証**: `layout.tsx` をファイルとして読み（`fs.readFileSync`）、`"/manifest.json"` 文字列を含まないことをアサート（既存 `src/__tests__/` のファイル内容アサート方式に準拠）
3. **旧ファイル不存在検証**: `fs.existsSync("public/manifest.json")` が false であることをアサート

## Risks / Trade-offs

- **リスク: 参照と実体の不一致**（manifest.ts を置いたのに layout.tsx が `/manifest.json` のまま → 404）→ テスト2・3で機械的に検知する
- **リスク: lang を "en" にすると ja ユーザー向け表記と不一致** → 現状の name/description が英語であり、locale 別 manifest は今回スコープ外。将来 i18n manifest が必要になれば別 change で対応
- **トレードオフ: purpose 未指定の icons** → Android で maskable 最適化が効かないが、既存アイコンのセーフゾーンが未検証のため安全側（未指定 = any 扱い）に倒す（plan.md rule 準拠）

## Migration Plan

1. テスト追加（Red）→ `src/app/manifest.ts` 新設（Green）
2. `src/app/layout.tsx` の参照更新 + `public/manifest.json` 削除（Green）
3. ロールバック: manifest.ts と テストを削除し、`public/manifest.json` と layout.tsx 参照を git revert で戻すだけ。DB・依存関係への影響なし

## Open Questions

なし（plan.md レビュー Round 1 で論点は解消済み）
