## Context

Shukan は Next.js 16 + Supabase で構築された習慣トラッキングアプリ。全体レビューで以下の3つのパフォーマンス/セキュリティ問題を検出した：

1. **completions全件取得**: `fetchCompletions()` が `habit_completions` テーブルの全レコードを取得。1年利用で数千行になり初回ロードが劣化
2. **sortOrder N+1更新**: `updateHabitSortOrders()` がhabitsの数だけ個別UPDATEを発行（10個なら10リクエスト）
3. **middleware過剰マッチ**: static assets以外の全パスで `supabase.auth.getUser()` が実行され、publicページでも不要なDB問い合わせが発生

## Goals / Non-Goals

**Goals:**
- completions取得を日付範囲で制限し、初回ロード時間を一定に保つ
- sortOrder更新を1リクエストに統合
- publicページ（/login, /privacy, /terms）でSupabase認証リクエストを発生させない

**Non-Goals:**
- Server Components化（別タスク）
- completionsの無限スクロール/ページネーション（現時点では90日固定で十分）
- RLS ポリシーの見直し（現状問題なし）

## Decisions

### 1. completions の日付範囲制限

`fetchCompletions()` に `fromDate` パラメータを追加。デフォルトは90日前。

- ダッシュボード（今日のステータス + ストリーク計算）は90日分で十分
- Stats/ReviewCalendar は月単位で取得する既存の `getMonthlyCompletions()` があるため影響なし
- ストリーク計算: 現在の `calculateStreak()` は completions配列を日付降順でスキャンするため、90日以上の連続ストリークは正確に計算できなくなる → 実用上90日連続を超えるケースは稀。将来必要なら専用のストリーク集計カラムを追加する

**選択肢:**
- A) 固定90日 ← 採用。シンプルで十分
- B) 動的に期間を広げる（ストリーク計算のため） → 過剰設計

### 2. sortOrder 一括更新 RPC

PostgreSQL関数 `update_habit_sort_orders(updates jsonb)` を作成。

```sql
CREATE OR REPLACE FUNCTION update_habit_sort_orders(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE habits h
  SET sort_order = (u->>'sortOrder')::int
  FROM jsonb_array_elements(updates) AS u
  WHERE h.id = (u->>'id')::uuid
    AND h.user_id = auth.uid();  -- RLS相当の制約を関数内で保証
END;
$$;
```

- `SECURITY DEFINER` + 関数内で `auth.uid()` チェック → RLSをバイパスしつつセキュリティを維持
- クライアントからは `supabase.rpc('update_habit_sort_orders', { updates: [...] })` で1回のリクエスト

### 3. middleware matcher 絞込

現在のmatcher:
```
/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```

変更後: `/(app)` ルートグループ配下 + ルートパス(`/`)のみにマッチ。`/login`, `/auth/callback`, `/privacy`, `/terms` はmiddleware対象外。

```typescript
export const config = {
  matcher: [
    '/',
    '/discover/:path*',
    '/stats/:path*',
    '/settings/:path*',
  ],
};
```

ログイン済みユーザーが `/login` にアクセスした場合のリダイレクト（既存機能）は、LoginPageコンポーネント側で `useAuth()` をチェックして `router.push('/')` する形に移行。

## Risks / Trade-offs

- **90日制限によるストリーク精度**: 90日超の連続ストリークが途切れて見える可能性。ドッグフーディング中に検証し、問題なら上限を拡張
- **RPC関数のSECURITY DEFINER**: RLSバイパスのため、関数内のセキュリティチェックが唯一の防御ライン。`auth.uid()` チェックを確実に含める
- **middleware matcher変更**: 新しい `(app)` ルートを追加した際にmatcherへの追加を忘れるリスク → ルートグループ構造に依存するため、新ページ追加時の手順に含める
