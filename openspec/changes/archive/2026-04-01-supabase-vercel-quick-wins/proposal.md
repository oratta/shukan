## Why

全体レビューで検出した3つの低コスト・高インパクトな問題を修正する。`fetchCompletions()` の全件取得はデータ増加に伴いパフォーマンスが線形劣化し、`updateHabitSortOrders` のN+1更新はドラッグ操作ごとにN回のHTTPリクエストを発生させ、middleware matcherが全パスにマッチしているためpublicページでも不要なSupabase認証リクエストが走っている。

## What Changes

- `fetchCompletions()` に日付範囲パラメータを追加し、デフォルトで直近90日分に制限
- `updateHabitSortOrders` をPostgreSQL RPC関数による一括更新に置き換え（N回→1回）
- middleware の matcher を認証必要パス `/(app)` グループのみに絞込、`/privacy`・`/terms`・`/login` 等を除外

## Capabilities

### New Capabilities

- `sort-order-rpc`: habit の sort_order を一括更新する PostgreSQL RPC 関数

### Modified Capabilities

- なし（既存のspecレベルの振る舞いは変わらない。内部実装の最適化のみ）

## Impact

- `src/lib/supabase/habits.ts`: fetchCompletions, updateHabitSortOrders の変更
- `src/hooks/useHabits.ts`: fetchCompletions の呼び出し側変更
- `src/middleware.ts`: matcher パターン変更
- `supabase/migrations/`: 新規マイグレーション（RPC関数追加）
- Supabase Dashboard: RPC関数デプロイ
