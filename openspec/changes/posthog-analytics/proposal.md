# Proposal: posthog-analytics

> Note: 実装済み（PR #35, branch `oratta/posthog`）を OpenSpec change として事後記録したもの。

## Why

ローンチ後のプロダクト改善と、成功率ソーシャル機能（issue #22: 何人が取り組み/挫折したか→成功率表示）の前提となる行動データが一切計測されていない。ローンチ前に匿名の行動計測基盤を入れてデータを溜め始める必要がある（issue #17, launch-blocker）。

## What Changes

- posthog-js を導入し、`instrumentation-client.ts` で初期化（`NEXT_PUBLIC_POSTHOG_KEY` 未設定時は完全 no-op）
- `next.config.ts` に `/ingest` リバースプロキシ rewrites を追加（ad-blocker によるイベント欠損回避）
- 認証状態と連動した匿名識別: Supabase user UUID のみで identify、ログアウトで reset
- 匿名性の担保: `mask_all_text` / `mask_all_element_attributes` / `person_profiles: 'identified_only'`、自由入力テキスト（習慣名・メモ・リフレクションコメント）は送信しない
- 成功率算出の前提となる行動イベント計装: habit_created / habit_updated / habit_archived（挫折シグナル）/ habit_deleted / habit_status_set / quit_daily_done / urge_flow_started / urge_flow_completed / rocket_used / reflection_saved
- ページビューは SDK の history_change モードで App Router の SPA 遷移を自動計測

## Capabilities

### New Capabilities

- `product-analytics`: 匿名の行動計測基盤。PostHog 初期化・匿名識別・イベント計装・プロキシ経由送信の要件を定義する

### Modified Capabilities

（なし — 既存 capability の要件変更はない）

## Impact

- 依存追加: `posthog-js`
- 新規: `src/instrumentation-client.ts`, `src/lib/analytics.ts`
- 変更: `next.config.ts`（rewrites + skipTrailingSlashRedirect）, `src/components/auth-provider.tsx`（identify/reset）, `src/hooks/useHabits.ts`（イベント計装）, `src/app/(app)/page.tsx`（reflection_saved）
- 運用: PostHog Cloud (US) プロジェクト作成と `NEXT_PUBLIC_POSTHOG_KEY` の Vercel / `.env.local` 設定が必要（未設定環境では no-op）
