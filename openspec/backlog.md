# OpenSpec Backlog

## LP / Marketing（2026-05-12 lp-branding run から）

- `<html lang>` の locale 動的化: marketing host の場合は `ja` を強制したい（現状 next-intl の locale 由来で en になりがち）。RootLayout は apex と共有なので別アプローチ要検討（middleware で host 別 locale cookie 上書き、または marketing 専用 RootLayout）
- LP の A/B テスト: コアコピー A/B でコンバージョン測定（_longruns/2026-05-24_lp-image-code-workflow で単一バージョン実装、3 ヶ月実測してから判断）
- middleware host 大文字小文字対応: `request.headers.get('host')` を `.toLowerCase()` し、env 側もマッチさせる堅牢化（実害は低い、Vercel/Cloudflare で正規化済み）

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

## PWA manifest screenshots（将来改善）
- DevTools Manifest の "Richer PWA Install UI" 警告解消のため、`form_factor: wide`（PC用）+ モバイル用のスクリーンショット画像を制作し `src/app/manifest.ts` の `screenshots` に追加する。installability 自体には不要だがインストールダイアログの見栄えが向上する（2026-06-23 PWA run で先送り）
