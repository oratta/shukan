---
phase: Setup
status: complete
last_updated: 2026-05-24T13:53:00+09:00
---

## 完了フェーズ

- [x] Setup: ツール検証 / コードベース調査 / ベースラインテスト

## ツール検証結果

- **openspec**: `/Users/oratta/.volta/bin/openspec` (v1.2.0)
- **git**: 2.40.1 on `lp-image-code-workflow`
- **node**: v22.7.0, npm 10.8.3
- **vitest**: 4.0.18 設定済み (`npm run test:run`)
- **playwright**: `@playwright/test` インストール済み、`playwright.config.ts` なし（`e2e-verify.spec.ts` 単独で動作）
- **OpenSpec 初期化状態**: ✅ 完了済み（`openspec/{backlog, changes, schemas, specs}` 全存在 + `longrun-tdd` schema fork 済み + `.gitignore` に `openspec/config.yaml` 追加済み）

## ベースラインテスト結果

- **vitest**: 11 test files / **197 tests / 全 PASS** (722ms)
- 主要テストファイル: middleware.test.ts (11) / robots.test.ts (3) / sitemap.test.ts (3) / marketing-metadata.test.ts (4) / marketing-page.test.tsx (5) など、marketing 周辺は既に十分なテストカバレッジあり

## コードベース調査結果（Build フェーズで使用）

### 既存実装の確認

| 項目 | 状態 | 詳細 |
|---|---|---|
| **middleware host 判定実装** | ✅ **既存** | `src/middleware.ts` に `NEXT_PUBLIC_MARKETING_HOSTS` parsing + Branch 1〜4 の host 判定実装済み（plan の change-A 事前調査タスクで「改修不要」が確定） |
| **既存 marketing LP** | ✅ 存在 | `src/app/marketing/{page.tsx, layout.tsx, copy.ts}` プレースホルダ実装 + `marketing-page.test.tsx` 5 テスト |
| **shadcn primitives** | ✅ 14 個 install 済み | button, card, checkbox, dialog, input, label, select, textarea などフォーム必須は全部揃い |
| **Supabase client** | ✅ `src/lib/supabase/{client.ts, server.ts}` | Browser/Server 分離パターン、cookie-based |
| **最新 migration** | ✅ `20260402000000_drop_habit_color.sql` | waitlist 追加は `20260524000000_add_waitlist.sql` で続く |
| **Tailwind v4** | ✅ `globals.css` に `@theme inline` OKLCh palette | tailwind.config.ts は不在（v4 流儀） |
| **components.json** | ✅ style=new-york, baseColor=neutral, cssVariables=true | shadcn add で installable |
| **GA4 実装** | ❌ 未実装 | change-H で新規追加 |
| **next.config.ts images.formats** | ❌ デフォルト | change-H best effort で AVIF/WebP 追加 |

### 既存テストカバレッジ（regression 監視対象）

- `middleware.test.ts` 11 tests: host 判定の既存挙動を保証 → change-A で env 設定変えても middleware ロジック自体は触らないので壊れない想定
- `marketing-page.test.tsx` 5 tests: 既存 LP の DOM 構造をテスト → **change-H で全面構築する際に意図的に書き換える**（現行テストは失敗する想定、置換する）
- `marketing-metadata.test.ts` 4 tests: OG / Twitter card メタデータ → change-H で layout 編集する際に regression 防止

## 次フェーズへの引き継ぎ

- Setup フェーズ完了、Build Contract フェーズへ進む
- change-A の「事前調査タスク」は既存 middleware 実装で完結（**改修不要**を decisions.md に記録）
- 既存 197 tests が PASS している状態を基準とし、Build 後も全 PASS + 新規テスト追加が条件
- 既存 `marketing-page.test.tsx` は change-H で書き換え対象（現行 5 tests は破棄、新 LP 用の tests に置き換え）

## 次フェーズで使う重要パス

- plan.md: `_longruns/2026-05-24_lp-image-code-workflow/plan.md`
- checkpoint.md: this file
- decisions.md: `_longruns/2026-05-24_lp-image-code-workflow/decisions.md`
- 既存 marketing: `src/app/marketing/{page.tsx, layout.tsx, copy.ts}`
- 既存 middleware: `src/middleware.ts`
- 既存 Supabase: `src/lib/supabase/{client.ts, server.ts}` + `supabase/migrations/`
- shadcn primitives: `src/components/ui/`
