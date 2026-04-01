## 1. Sort Order RPC

- [x] 1.1 マイグレーション作成: `update_habit_sort_orders(updates jsonb)` RPC関数を追加（SECURITY DEFINER + auth.uid()チェック）
- [x] 1.2 `supabase db push` でマイグレーション適用
- [x] 1.3 `src/lib/supabase/habits.ts` の `updateHabitSortOrders` を `supabase.rpc()` 呼び出しに変更

## 2. Completions 期間制限

- [x] 2.1 `fetchCompletions()` に `fromDate` パラメータを追加し、デフォルト90日前でフィルタ
- [x] 2.2 `useHabits.ts` の呼び出し側が正しく動作することを確認（ストリーク計算含む）

## 3. Middleware Matcher 絞込

- [x] 3.1 `src/middleware.ts` の matcher を `(app)` ルート（`/`, `/discover/:path*`, `/stats/:path*`, `/settings/:path*`）のみに変更
- [x] 3.2 `/login` のログイン済みリダイレクトを LoginPage コンポーネント側に移行（`useAuth()` + `router.push('/')`）
- [x] 3.3 `/privacy`, `/terms` がmiddleware未経由でアクセスできることを確認

## 4. テスト・検証

- [x] 4.1 既存テスト（calculation-logic, habits, frequency-support）がパスすることを確認
- [x] 4.2 ビルド成功・型チェックパス確認（動作確認はデプロイ後に実施）
