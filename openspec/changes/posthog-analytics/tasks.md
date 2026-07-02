# Tasks: posthog-analytics

> 1〜5 は PR #35（branch `oratta/posthog`）で実装・検証済み。6 はマージ後の手動運用タスク。

## 1. SDK 導入と初期化

- [x] 1.1 `posthog-js` を依存に追加
- [x] 1.2 `src/instrumentation-client.ts` で init（キー未設定時 no-op、`defaults: '2025-05-24'`、`person_profiles: 'identified_only'`、`mask_all_text` / `mask_all_element_attributes`）

## 2. リバースプロキシ

- [x] 2.1 `next.config.ts` に `/ingest` → `us.i.posthog.com` / `us-assets.i.posthog.com` の rewrites を追加
- [x] 2.2 `skipTrailingSlashRedirect: true` を設定
- [x] 2.3 middleware の matcher が `/ingest` を掴まないことを確認

## 3. 匿名識別

- [x] 3.1 `src/lib/analytics.ts` ラッパー作成（track / identifyUser / resetAnalytics、イベント名 union 型）
- [x] 3.2 `auth-provider.tsx` でログイン時に Supabase user UUID のみで identify、SIGNED_OUT で reset

## 4. 行動イベント計装

- [x] 4.1 `useHabits.ts`: habit_created / habit_updated / habit_archived / habit_deleted / habit_status_set / quit_daily_done / urge_flow_started / urge_flow_completed / rocket_used
- [x] 4.2 `src/app/(app)/page.tsx`: reflection_saved（mood と has_comment のみ、コメント本文は送らない）

## 5. 検証

- [x] 5.1 lint 0 errors / vitest 472 件パス / `next build` 成功
- [x] 5.2 dev サーバーで `/login` 200（no-op 動作）と `/ingest/static/array.js` 200（プロキシ疎通）を確認
- [x] 5.3 PR #35 作成

## 6. 運用セットアップ（マージ後・手動）

- [ ] 6.1 PostHog Cloud (US) でプロジェクト作成、Project API Key 取得
- [ ] 6.2 Vercel 環境変数 `NEXT_PUBLIC_POSTHOG_KEY` を Production / Preview に設定
- [ ] 6.3 メインリポの `.env.local` に `NEXT_PUBLIC_POSTHOG_KEY` を追加
- [ ] 6.4 デプロイ後、PostHog Activity で $pageview と行動イベントの流入を確認
