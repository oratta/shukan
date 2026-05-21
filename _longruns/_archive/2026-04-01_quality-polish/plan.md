# Longrun: Quality Polish

**作成日**: 2026-04-01
**目的**: ドッグフーディング期限（04-08）前に、コード品質・パフォーマンス・セキュリティを一括改善する

## Background

openspec/backlog.md に蓄積されたレビュー残件（2026-04-01検出分）とカラーパレット統一を、1つのロングランにまとめて実施する。新機能は含まない。

## Changes

### Change 1: カラーパレット統一
**概要**: ハードコードされた色（23ファイル）をCSS変数に置き換え、ブランドパレットに統一
**ファイル**:
- `src/app/globals.css` — セマンティックカラー変数を追加（`--success`, `--impact-health`, `--impact-cost`, `--impact-income`, `--impact-bg` 等）
- 23ファイルのハードコード色を CSS 変数 / Tailwind クラスに差し替え
**対象パターン**: `#3D8A5A`, `#B8860B`, `#FFF8F0`, `bg-green-500`, `text-green-*`, `text-yellow-*`, `text-red-*` 等
**スキル**: なし（grep + 一括置換）
**注意**: ダークモード対応も確認（`.dark` セレクタ内の変数定義）

### Change 2: パフォーマンス改善
**概要**: 冗長な DB アクセスパターンを修正
**タスク**:
1. `src/lib/supabase/feedbacks.ts` — 4関数が毎回 `getUser()` を呼ぶ → `userId` を引数で受け取るように変更。呼び出し元で1回だけ取得
2. `src/lib/supabase/habits.ts` の `useRocketOnDate` — select→条件分岐→update/insert を upsert 1回に簡略化
3. Coping Steps の N+1 取得 → habit 取得時に JOIN または `in` フィルタで1クエリ化
**スキル**: なし

### Change 3: スキーマ改善
**概要**: DB スキーマの型とインデックスを修正
**タスク**:
1. `daily_reflections.date` を TEXT → DATE 型に変更（マイグレーション作成）
2. `daily_reflections` に `(user_id, date)` の明示的インデックス追加
**ファイル**: `supabase/migrations/` に新規マイグレーション
**実行**: マイグレーション作成後 `supabase db push` で dev/prod 両方に適用
**注意**: 既存データの型変換（TEXT→DATE）が安全に行えるか確認。新DB（データ空）なので問題ないはず

### Change 4: セキュリティ・設定改善
**概要**: セキュリティヘッダー追加、不要コード削除、Suspense修正
**タスク**:
1. `next.config.ts` にセキュリティヘッダー追加（CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy）
2. `src/lib/storage.ts` 削除（未使用の localStorage ラッパー）
3. LoginPage の `useSearchParams()` を `<Suspense>` で囲む
**スキル**: nextjs-server-client-components（Suspense 修正時に参照）

### Change 5: deleteAccount Edge Function
**概要**: アカウント削除で auth.users エントリも完全に削除
**タスク**:
1. Supabase Edge Function を作成（`supabase/functions/delete-user/`）
2. `service_role` キーで `auth.admin.deleteUser()` を呼ぶ
3. フロントエンドの `deleteAccount()` を Edge Function 呼び出しに変更
**注意**: `service_role` キーは環境変数で管理。フロントエンドに露出させない

## Execution Order

```
Change 1 (カラーパレット)     ← 最大規模、他に依存なし
Change 2 (パフォーマンス)     ← 並行可能
Change 3 (スキーマ)           ← 並行可能、supabase db push 必要
Change 4 (セキュリティ・設定) ← 並行可能
Change 5 (Edge Function)     ← Change 3 の後が望ましい（同じ DB 操作）
```

Change 1〜4 は独立しているため並行実行可能。

## Risk

| リスク | 影響 | 対策 |
|--------|------|------|
| カラー置換でダークモードが壊れる | 見た目崩れ | 各変数に `.dark` 定義を忘れずに |
| スキーマ変更で既存クエリが壊れる | データ取得失敗 | 新DBはデータ空なのでリスク低。型変換テスト |
| Edge Function のデプロイ | 404エラー | Supabase CLI でローカルテスト後にデプロイ |
| CSP が厳しすぎて機能が壊れる | ページ表示エラー | report-only モードで先にテスト |

## Done Criteria

- [ ] `npm run test:run` 全テストパス
- [ ] `npm run build` ビルド成功
- [ ] ハードコード色がゼロ（grep で検出されない）
- [ ] `feedbacks.ts` の各関数が `userId` を引数で受け取る
- [ ] `daily_reflections.date` が DATE 型
- [ ] セキュリティヘッダーが応答に含まれる
- [ ] `src/lib/storage.ts` が削除されている
- [ ] アカウント削除で auth.users も削除される
