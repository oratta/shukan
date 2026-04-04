# OpenSpec Backlog

## Supabase/Vercel ベストプラクティス適用（残件）

### パフォーマンス
- Server Components活用: 初回ロード（habits+completions）をServer Componentでprefetch → クライアントにprops渡し

### 設定
- `useSettings` がまだ localStorage → `user_settings` テーブルに移行しデバイス間同期

## 完了済み（2026-04-01 quality-polish ロングランで対応）

- ~~カラーパレット統一~~ → セマンティックカラー変数追加、21ファイル置換
- ~~`feedbacks.ts` の getUser() 削減~~ → userId 引数化
- ~~`useRocketOnDate` の upsert 化~~
- ~~Coping Steps の N+1 解消~~ → `fetchCopingStepsByHabitIds` 追加
- ~~`deleteAccount()` Edge Function~~ → `supabase/functions/delete-user/` 作成
- ~~`daily_reflections.date` TEXT→DATE~~ → マイグレーション適用済み
- ~~`daily_reflections` インデックス追加~~
- ~~セキュリティヘッダー追加~~ → X-Frame-Options, X-Content-Type-Options 等
- ~~`src/lib/storage.ts` 削除~~ → 既に不在
- ~~LoginPage Suspense修正~~
