# Tasks: stripe-billing-foundation

## 1. セットアップ

- [x] 1.1 `stripe` npm パッケージを導入し、`package.json` / lockfile を更新する
- [x] 1.2 Stripe テストモードに Products / Prices（月額 $4.99 / 年額 $39.99 / Lifetime $99）を **`tax_behavior: inclusive`（税込総額）で作成**し、Price ID を控える（Stripe CLI または ダッシュボード。手順をメモ化）。※ `tax_behavior` は Price 作成後に変更不可。change-D の総額表示要件の前提
- [x] 1.3 `.env.local` に `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_LIFETIME` / `NEXT_PUBLIC_TRIAL_DAYS=14` を追加し、`.env.local.example`（存在すれば）にキー名のみ追記する
- [x] 1.4 `src/lib/billing/config.ts` を作成（Price ID 解決・トライアル日数・ゲート対象/上限の設定値集約。欠落 env は説明的エラー）

## 2. DB マイグレーション

- [x] 2.1 `supabase/migrations/YYYYMMDDHHmmss_add_subscriptions.sql` を作成（`subscriptions`: user_id FK / stripe_customer_id / stripe_subscription_id / status / plan / trial_end / current_period_end / cancel_at_period_end、RLS: 本人 select のみ。`stripe_events`: event_id unique + processed_at、service role のみアクセス）
- [ ] 2.2 dev プロジェクトへ `supabase db push` を実行し、テーブルと RLS ポリシーを確認する（**deferred**: worktree からは dev DB に適用しない方針。マージ後にメインで実行）
- [x] 2.3 `src/lib/supabase/subscriptions.ts` を作成（habits.ts パターンの snake↔camel マッピング・型定義・CRUD。webhook 用 service role 書き込みは server-only モジュールに分離）

## 3. テスト先行（RED）

- [x] 3.1 `src/__tests__/billing-config.test.ts`: Price ID の env 解決・欠落時エラー・トライアル日数設定値の反映を書く
- [x] 3.2 `src/__tests__/api-stripe-checkout.test.ts`: 認証ユーザーへの Checkout URL 返却（subscription/payment mode、metadata.user_id / client_reference_id 格納、既存 customer 再利用）・未認証 401（Stripe 非呼び出し）・不正 plan 400 を書く
- [x] 3.3 `src/__tests__/api-stripe-webhook.test.ts`: 正署名 200 / 不正署名 400（副作用なし）・4 イベント（checkout.session.completed subscription/payment, customer.subscription.updated, customer.subscription.deleted, invoice.paid）の `subscriptions` 更新・同一 event ID 重複配送の no-op・未対応イベント 200 を書く
- [x] 3.4 `src/__tests__/api-stripe-portal.test.ts`: 認証ユーザーへの Portal URL 返却・未認証 401・customer 不在 400 を書く
- [x] 3.5 `src/__tests__/paywall-gate.test.tsx`: entitlement 判定（trialing+期限内=許可 / trial 期限切れ=ブロック / active=許可 / lifetime=永続許可）・設定値変更でゲート対象が変わること・トライアル日数の小値（境界）を書く
- [x] 3.6 `src/middleware.ts` の matcher に `/api/stripe` 系パターンが含まれないことを assert する回帰テストを追加する
- [x] 3.7 `npm run test:run` で新規テストが全て RED であることを確認する

## 4. 最小実装（GREEN）

- [x] 4.1 `src/lib/billing/provider.ts`（薄い抽象: createCheckoutSession / createPortalSession / verifyAndParseWebhook → ドメインイベント）と `src/lib/billing/stripe.ts`（Stripe 実装、secret は env 経由）を作成する
- [x] 4.2 `src/app/api/stripe/checkout/route.ts` を作成（handler 内 `supabase.auth.getUser()`、plan 検証、customer 再利用 or 作成、session URL 返却）
- [x] 4.3 `src/app/api/stripe/webhook/route.ts` を作成（`request.text()` で raw body → 署名検証 → `stripe_events` 重複排除 → イベント別 upsert で `subscriptions` 同期、service role クライアント使用）
- [x] 4.4 `src/app/api/stripe/portal/route.ts` を作成（handler 内認可、customer 不在時 400、Portal URL 返却）
- [x] 4.5 トライアル開始処理を実装（`status: trialing` + `trial_end = now + 設定日数` の行作成。カード不要・Stripe 非呼び出し）
- [x] 4.6 `useSubscription`（または同等の取得 hook）と entitlement 判定の共有関数を実装（`subscriptions` のみ参照）
- [x] 4.7 paywall ゲートコンポーネントを実装（非 entitled 時にゲート対象アクションをブロックし、Checkout への CTA を含むアップグレード導線を表示。確認ステップ経由で Checkout API を呼ぶ構造にし、change-D の最終確認画面を差し込める形にする）。※billing-integration（D8）で本番ページへ結線完了：`PaywallGate` の `create_habit` ゲートをホームの習慣追加導線に組み込み（`shouldBlockCreateHabit`／entitled・トライアル中は従来 UX 維持・非 entitled は `/account?upgrade=1` へ）、CTA 先の `/account` で最終確認ステップ → `POST /api/stripe/checkout` を実装。`create-habit-gate.test.ts` / `account-billing.test.ts`
- [x] 4.8 `npm run test:run` で新規テストが全て GREEN になることを確認する

## 5. 品質確認（REFACTOR + 検証）

- [x] 5.1 `npm run lint` を実行してエラーゼロ（本 change 由来の新規エラー・警告ゼロを確認。baseline に既存 9 errors / 35 warnings があり、それらは未変更ファイル由来で本 change の範囲外）
- [x] 5.2 `npm run build` を実行してビルド成功（型チェック込み）
- [x] 5.3 既存テストが全て PASS であることを確認（回帰なし）
- [ ] 5.4 `stripe listen --forward-to localhost:3000/api/stripe/webhook` + テストカードで Checkout → `subscriptions` 同期 → Customer Portal アクセスまでを手動疎通確認し、結果を記録する（**deferred**: 実 Stripe テストキー未設定のため手動疎通は不可。`scripts/stripe-setup.ts` でキー投入後に実施。署名検証ロジックは webhook テストで実署名生成により検証済み）
- [x] 5.5 ソースツリーに `sk_test_` / `sk_live_` / `whsec_` のハードコードがないことを grep で確認する
