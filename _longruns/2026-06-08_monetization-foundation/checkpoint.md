---
phase: Build Contract
status: complete
last_updated: 2026-06-12T09:15:00
---

## 完了フェーズ
- [x] Setup: ツール検証・コードベース調査・ベースライン記録完了
- [x] Build Contract: APPROVED by longrun-reviewer（ラウンド2。ラウンド1の指摘4件+既存コード問題2件を全採用して plan.md 反映 → D2 参照）

## ツール検証結果
- openspec: /Users/oratta/.volta/bin/openspec (v1.2.0)
- git: 2.40.1 on monetization-strategy-pla
- openspec/: 初期化済み（schemas/longrun-tdd 存在）
- vitest: npm run test:run で実行可（npm install 実施済み）

## テストベースライン
- 11 test files / 197 tests 全PASS（2026-06-12 09:03）

## Stripe スキル探索結果（plan.md セットアップ前提）
- ローカル skills / marketplace plugins: Stripe スキルなし
- OpenSkills: 利用不可
- → 代替: Context7（plugin:context7）で Stripe + Next.js 16 App Router の最新パターンを builder が参照する方針

## コードベース調査の要点（Explore Agent 報告より）
- ルーティング: `(app)`=認証保護 / `marketing/`=ホスト分岐（`NEXT_PUBLIC_MARKETING_HOSTS` + middleware rewrite）。`/privacy` `/terms` は認証不要ページの前例
- middleware matcher: `/`, `/discover/*`, `/stats/*`, `/settings/*`, `/marketing/*`。新規公開ページ/API は matcher 外なら認証不要
- Supabase: client.ts(browser)/server.ts(SSR cookie)。habits.ts に snake↔camel マッピング + CRUD + RPC パターン
- migrations: `YYYYMMDDHHmmss_desc.sql` 形式 14本。RLS は `auth.uid() = user_id` パターン。view は service_role 限定の前例あり（article_feedback_stats）
- i18n: `src/messages/{en,ja}.json` + cookie locale
- テスト: vitest (node env, `src/**/*.test.ts(x)`)、Playwright は `e2e-verify.spec.ts`
- API route 前例: `src/app/auth/callback/route.ts`。Edge function 前例: `supabase/functions/delete-user`
- Stripe 依存パッケージ: なし（新規導入）

## Changes状態
| Change | Tasks | Tests | Status |
|--------|-------|-------|--------|
| change-A (Stripe課金基盤) | - | - | 未着手 |
| change-B (Founding割引) | - | - | 未着手（A依存） |
| change-C (ティザーLP+waitlist) | - | - | 未着手（静的部分は独立、残枠APIはB依存） |
| change-D (国内法準拠) | - | - | 未着手（表記/プライバシーは独立、確認画面はA/B依存） |

## 次フェーズへの引き継ぎ
- 次: Build Contract（longrun-reviewer で plan.md の Changes 分解レビュー）
