# Proposal: stripe-billing-foundation

## Why

Smitch にはまだ課金手段がなく、マネタイズ戦略（Founding Member プログラム＋サブスク/Lifetime 併設）を進めるための決済土台が存在しない。Founding Member 割引（change-B）・ティザー/waitlist（change-C）・国内法対応（change-D）はすべて課金基盤の上に成り立つため、Stripe Checkout / Webhook / Customer Portal / Supabase `subscriptions` 同期 / トライアル管理 / paywall ゲートを最初の独立 change として構築する。

## What Changes

- **新規追加**: Stripe Products / Prices 定義（月額 $4.99 / 年額 $39.99 / Lifetime $99。テストモード。Price ID は env 経由で注入）
- **新規追加**: `stripe` npm パッケージ導入と Stripe クライアント初期化モジュール（secret key は env 経由、ハードコード禁止）
- **新規追加**: Checkout セッション生成 API route（`/api/stripe/checkout`）。route handler 内で `supabase.auth.getUser()` により認可。サブスク（subscription mode）と Lifetime（payment mode）の両対応
- **新規追加**: Webhook 受信 API route（`/api/stripe/webhook`）。middleware matcher 外に配置し、handler 内で署名検証。`checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` / `invoice.paid` を冪等に処理
- **新規追加**: Supabase `subscriptions` テーブル（user_id FK / stripe_customer_id / stripe_subscription_id / status / plan / trial_end / current_period_end / cancel_at_period_end、RLS per user）と Webhook イベント重複排除用 `stripe_events` テーブル。マイグレーション + snake↔camel マッピング付き CRUD（`src/lib/supabase/habits.ts` パターン踏襲）
- **新規追加**: Customer Portal セッション生成 API route（`/api/stripe/portal`）。handler 内認可
- **新規追加**: 14日トライアル（カード不要）。トライアル開始時に `subscriptions` に `status: trialing` 行を作成し、`trial_end` を設定。トライアル日数は env/設定値で可変
- **新規追加**: paywall ゲートコンポーネント。`subscriptions` の状態を真実源として、トライアル終了後（未課金）にゲート対象アクションをブロック。ゲート対象・上限・トライアル日数は設定値で可変
- **新規追加**: 決済プロバイダの薄い抽象レイヤー（将来の MoR — Paddle / Lemon Squeezy / Polar 等 — への切替余地を残す）
- **middleware matcher は拡張しない**（既存の認証フローへの影響ゼロ）

## Capabilities

### New Capabilities

- `stripe-billing`: Stripe による課金基盤（Checkout / Webhook / Customer Portal / `subscriptions` 同期 / 14日カード不要トライアル / paywall ゲート）

### Modified Capabilities

- なし（課金まわりの既存 spec は存在しない。既存 middleware / 認証フローの要件は変更しない）

## Impact

- **影響コード（新規）**: `src/app/api/stripe/checkout/route.ts` / `src/app/api/stripe/webhook/route.ts` / `src/app/api/stripe/portal/route.ts` / `src/lib/billing/`（プロバイダ抽象 + Stripe 実装 + 設定値）/ `src/lib/supabase/subscriptions.ts` / paywall ゲートコンポーネント / `supabase/migrations/YYYYMMDDHHmmss_add_subscriptions.sql`
- **影響コード（既存）**: なし。`src/middleware.ts` の matcher は変更しない
- **外部依存**: `stripe` npm パッケージを新規導入。Stripe ダッシュボード（テストモード）に Products/Prices を作成
- **環境変数**: `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_LIFETIME` / `NEXT_PUBLIC_TRIAL_DAYS`（既定14）等を `.env.local` / Vercel env に追加（手動作業）
- **DB**: `subscriptions` / `stripe_events` テーブル追加（既存テーブル無変更）
- **後続 change との関係**: change-B（Founding 割引）は本 change の Webhook / Checkout に割引適用を追加する。change-D（国内法）は Checkout 直前の最終確認画面を実装する — 本 change では Checkout API をクライアントの明示的な確認ステップから呼ぶ構造にしておき、確認画面の法定表示内容は change-D に委ねる
