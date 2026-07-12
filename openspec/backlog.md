# OpenSpec Backlog

> **2026-07-06: 未完了項目は GitHub issue へ移行済み**（/loops:issueify による。以下の各項目に issue 番号を注記。タスク管理は issue 側が正）

## オンボーディング再設計の後続（2026-06-12 onboarding-kpi plan から）

- アプリ全体UIの再構築: 外部リリースに向け、オンボーディング（onboarding-kpi run)で確立した新しいデザイントーンに合わせてアプリ全体（ホーム含む）をわかりやすく整理されたUIに刷新する（ホームでの「選んだKPI（tracked_kpis）」の表示・強調は 2026-07-03 impact-3scene run で先行対応済み） → **issue #61 へ移行済み（size:large）**

## LP / Marketing（2026-05-12 lp-branding run から）

- `<html lang>` の locale 動的化: marketing host の場合は `ja` を強制したい（現状 next-intl の locale 由来で en になりがち）。RootLayout は apex と共有なので別アプローチ要検討（middleware で host 別 locale cookie 上書き、または marketing 専用 RootLayout） → **issue #57 へ移行済み（agent-ready）**
- LP の本格デザイン（codex + gpt-image-2 委譲）: 現状はプレースホルダ Hero + Problem→Solution + CTA + Footer のシンプル構成。本格ビジュアル・セクション構成（FAQ / Comparison / Testimonials 等）は別run → **issue #62 へ移行済み（human-only, size:large）**
- LP の Analytics 計測: PostHog 等で直帰率・CTA クリック率を計測 → **issue #58 へ移行済み（agent-ready）**
- LP の A/B テスト: コアコピー A/B でコンバージョン測定 → **issue #63 へ移行済み（agent-proposed）**
- waitlist / メール取得: LP CTA とは別に「興味あり」層を捕捉 → **issue #64 へ移行済み（agent-proposed）**
- middleware host 大文字小文字対応: `request.headers.get('host')` を `.toLowerCase()` し、env 側もマッチさせる堅牢化（実害は低い、Vercel/Cloudflare で正規化済み） → **issue #56 へ移行済み（agent-ready）**

## Supabase/Vercel ベストプラクティス適用（残件）

### パフォーマンス
- Server Components活用: 初回ロード（habits+completions）をServer Componentでprefetch → クライアントにprops渡し → **issue #59 へ移行済み（agent-ready）**

### 設定
- ~~`useSettings` がまだ localStorage → `user_settings` テーブルに移行しデバイス間同期~~ → **実態と乖離のためクローズ（2026-07-06）**: `useSettings` フックは存在せず、設定は既に `user_profiles` テーブルで DB 化済み。localStorage 使用は PWA バナーの dismiss 記録（`src/components/pwa/install-banner.tsx`）のみ

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
- DevTools Manifest の "Richer PWA Install UI" 警告解消のため、`form_factor: wide`（PC用）+ モバイル用のスクリーンショット画像を制作し `src/app/manifest.ts` の `screenshots` に追加する。installability 自体には不要だがインストールダイアログの見栄えが向上する（2026-06-23 PWA run で先送り） → **issue #60 へ移行済み（agent-ready）**
