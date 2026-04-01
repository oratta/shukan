# OpenSpec Backlog

## カラーパレット統一

ハードコードされた色（#3D8A5A, #B8860B, #FFF8F0, bg-green-500 等）をCSS変数に置き換え、DESIGN.md のブランドパレットに統一する。数十ファイルに跨がる。セマンティックカラー変数（--success, --impact-gold, --impact-bg 等）を globals.css に追加し、全コンポーネントのクラスを差し替える。

## Supabase/Vercel ベストプラクティス適用（レビュー残件）

2026-04-01 の全体レビューで検出。⭐は別changeで対応済み。

### パフォーマンス
- `feedbacks.ts` の各関数が毎回 `getUser()` を呼ぶ → `user.id` を引数で受け取るパターンに統一
- `useRocketOnDate` の select→条件分岐→update/insert を upsert 1回に簡略化
- Coping Steps の N+1 取得 → habit取得時にJOINまたは `in` フィルタで1クエリ化
- Server Components活用: 初回ロード（habits+completions）をServer Componentでprefetch → クライアントにprops渡し

### セキュリティ
- `deleteAccount()` が auth.users エントリを削除できない → Edge Function + service_role key で `auth.admin.deleteUser()` を使う

### スキーマ
- `daily_reflections.date` が TEXT型 → date型に統一（habit_completionsと揃える）
- `daily_reflections` に `(user_id, date)` の明示的インデックス追加

### 設定
- `useSettings` がまだ localStorage → `user_settings` テーブルに移行しデバイス間同期
- `src/lib/storage.ts` の不要コード削除
- `next.config.ts` にセキュリティヘッダー（CSP, X-Frame-Options等）追加
- LoginPage の `useSearchParams()` を `<Suspense>` で囲む
