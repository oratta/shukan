# Design: stripe-billing-foundation

## Context

Smitch は Next.js 16.1.6 (App Router) + Supabase (auth + PostgreSQL + RLS) で稼働中。`src/middleware.ts` が限定 matcher でセッション更新・認証リダイレクトを担い、route handler の前例として `src/app/auth/callback/route.ts` がある。DB アクセスは `src/lib/supabase/habits.ts` の snake_case↔camelCase マッピング + RLS 前提 CRUD パターンが確立している。Stripe パッケージは未導入。

本 change はマネタイズ基盤 run（plan: `_longruns/2026-06-08_monetization-foundation/plan.md`）の change-A であり、change-B（Founding 割引）・change-C（ティザー）・change-D（国内法対応）が本 change の Checkout / Webhook / `subscriptions` の上に積み上がる。

制約（config.yaml rules 由来）:

- Stripe secret / webhook secret は env 経由。コードにハードコード禁止
- Webhook は冪等に実装（重複イベント想定）。署名検証必須
- サブスク状態の真実源は Supabase `subscriptions`。UI はそれを参照
- 将来 MoR（Paddle / Lemon Squeezy / Polar 等）への切替余地のため、決済プロバイダ抽象は薄く挟む

## Goals / Non-Goals

**Goals:**

- Stripe テストモードで月額 $4.99 / 年額 $39.99 / Lifetime $99 の Checkout が完走し、`subscriptions` に状態が同期される
- Webhook（checkout.session.completed / customer.subscription.updated / customer.subscription.deleted / invoice.paid）が署名検証付き・冪等で動作する
- カード不要の14日トライアルと、トライアル終了後の paywall ゲート（設定値で可変）が機能する
- Customer Portal で自己解約できる
- 既存の middleware / 認証フローに一切の回帰を起こさない（matcher 非拡張）

**Non-Goals:**

- Founding Member 割引・枠管理（change-B）
- ティザーページ / waitlist（change-C）
- 特商法表記・最終確認画面の法定表示・税込総額表示（change-D。ただし本 change は Checkout を「クライアントの明示的な確認ステップ経由で呼ぶ」構造にし、change-D が確認画面を差し込める形にする）
- 本番モードの Stripe キー設定・本番 Webhook エンドポイント登録（デプロイ作業として別管理）
- MoR への実切替・多通貨税最適化

## Decisions

### D1: Webhook は `/api/stripe/webhook`、middleware matcher は拡張しない

- **判断**: Webhook route は middleware matcher の対象外パスに置き、署名検証は handler 内で行う。認証必須の Checkout / Portal route も `/api/stripe/*` に置き、handler 内で `supabase.auth.getUser()` により認可する
- **代替案 A**: middleware matcher に `/api/stripe/:path*` を追加して認証を一元化
- **却下理由**: Webhook（無認証必須）と Checkout/Portal（認証必須）が同じ prefix に同居するため、matcher での除外管理が複雑化し事故リスクが上がる。plan.md で「middleware matcher は拡張しない」方針が確定済み

### D2: 冪等性は `stripe_events` テーブルでのイベント ID 重複排除 + upsert の二段構え

- **判断**: 処理済み Stripe event ID を `stripe_events` テーブル（`event_id` unique）に記録し、重複イベントは 200 を返して no-op。さらに `subscriptions` への書き込み自体を `stripe_subscription_id` / `user_id` キーの upsert にして、万一の再処理でも同一状態に収束させる
- **代替案 A**: upsert のみで冪等性を担保（イベント記録なし）
- **却下理由**: `customer.subscription.updated` の out-of-order 配送など、純粋な upsert だけでは「古いイベントで新しい状態を上書き」しうる。event ID 記録は監査ログとしても安価で有用

### D3: カード不要トライアルは Stripe ではなく `subscriptions` テーブルで自前管理

- **判断**: トライアル開始時は Stripe オブジェクトを一切作らず、`subscriptions` に `status: trialing` + `trial_end = now + TRIAL_DAYS` の行を insert する。課金切替時（Checkout 完了）に初めて Stripe Customer / Subscription が紐づく
- **代替案 A**: Stripe Subscription の `trial_period_days` + `payment_method_collection: if_required` を使う
- **却下理由**: カード不要トライアルのためだけに全トライアルユーザーの Stripe Customer/Subscription を作ると、未課金ユーザーが Stripe 側に大量に残り管理ノイズになる。真実源を `subscriptions` に置くルールとも整合し、トライアルは DB だけで完結する方がシンプル。change-B の「トライアル中の早期切替」も通常の Checkout 開始として自然に表現できる

### D4: サブスク状態の真実源は Supabase `subscriptions`、書き込みは Webhook（service role）のみ

- **判断**: UI / paywall は `subscriptions` のみを参照し、Stripe API を直接照会しない。`subscriptions` への課金状態の書き込みは Webhook handler（service role クライアント）に限定。RLS はユーザー自身の行の select のみ許可（insert/update はトライアル開始用の限定経路を除き service role）
- **代替案 A**: ページ表示時に Stripe API で都度状態確認
- **却下理由**: レイテンシ・レート制限・障害時の可用性で不利。config.yaml rule「真実源は Supabase `subscriptions`」に反する

### D5: 決済プロバイダ抽象は `src/lib/billing/` の薄いインターフェースに留める

- **判断**: `BillingProvider` 相当の最小インターフェース（createCheckoutSession / createPortalSession / verifyAndParseWebhook → ドメインイベント）+ Stripe 実装の 1 ファイル構成。アプリコードは抽象経由でのみ呼ぶ
- **代替案 A**: 抽象なしで Stripe SDK を直接散在させる／**代替案 B**: フル多プロバイダプラグイン機構
- **却下理由**: A は将来 MoR 切替（税務負担次第で Paddle 等へ）の改修範囲が全域に広がる。B は YAGNI。plan.md の指針「確定不要なら最小限の抽象に留める」に従い薄い層のみ

### D6: 価格・トライアル日数・ゲート対象は設定値（env + 設定モジュール）で可変

- **判断**: Price ID（`STRIPE_PRICE_MONTHLY` 等）・トライアル日数（`NEXT_PUBLIC_TRIAL_DAYS`、既定14）・ゲート対象/上限は `src/lib/billing/config.ts` 相当の設定モジュールに集約し、テストでは小さい値で境界を検証できるようにする
- **代替案 A**: 定数ハードコード
- **却下理由**: plan.md 制約「ゲートは環境変数 or 設定値で可変にし、ポリシーと実装を分離する」。価格・日数は後から調整可能にする意思決定ガイドラインがある

### D7: Webhook の生ボディ取得は route handler で `request.text()`

- **判断**: 署名検証には生ボディが必須のため、webhook route では JSON パース前に `await request.text()` で raw body を取得し `stripe.webhooks.constructEvent()` に渡す（App Router の route handler はデフォルトで body を加工しないのでこれで足りる）
- **代替案 A**: Pages Router 式の `bodyParser: false` 設定
- **却下理由**: App Router では不要。Next.js 16 の route handler パターンに素直に従う

### D8: DB アクセスは `src/lib/supabase/subscriptions.ts` に集約し habits.ts パターンを踏襲

- **判断**: snake_case↔camelCase マッピング・型定義・CRUD を `src/lib/supabase/subscriptions.ts` にまとめ、既存 `habits.ts` の規約（マッピング関数 + RLS 前提）に合わせる
- **代替案 A**: route handler 内に直接 supabase クエリを書く
- **却下理由**: 既存コードベースの確立パターンから外れ、change-B が同テーブルを扱う際の再利用性が落ちる

### D9: Webhook dispatch uses a provider-agnostic domain-event union (apply-time)

- **判断**: `verifyAndParseWebhook(rawBody, signature)` は Stripe event を `BillingDomainEvent`（`subscription_activated` / `subscription_status_changed` / `subscription_canceled` / `invoice_paid` / `ignored` の判別ユニオン）に変換して返す。webhook route は `event.kind` で分岐し、Stripe 型を一切参照しない
- **代替案 A**: route 内で Stripe.Event を直接 switch する
- **却下理由**: D5 の薄い抽象方針と整合。MoR 切替時に route を書き換えずに provider 実装の変換だけ差し替えられる。`ignored` を明示ケースにすることで未対応イベントの 200 応答が型で保証される

### D10: subscriptions は user_id をキーに 1 ユーザー 1 行 upsert（apply-time）

- **判断**: `subscriptions` に `unique(user_id)` を張り、課金成功 webhook は `onConflict: user_id` で upsert。`stripe_subscription_id` にも部分 unique を張り、updated/deleted/invoice 系はこの id で update。トライアル開始も同じ user_id upsert（再スタート無害化）
- **代替案 A**: 1 ユーザー複数行（履歴を行で保持）
- **却下理由**: 真実源は「現在の課金状態」であり履歴は Stripe / stripe_events に残る。1 行に集約すると entitlement 判定と RLS が単純化し、リプレイが同一状態に収束する（受け入れ条件12）

### D11: 実 Stripe キー未設定下での 1.2 / 5.4 の扱い（apply-time）

- **判断**: Products/Prices 作成（1.2）は実行可能スクリプト `scripts/stripe-setup.ts`（`tax_behavior: 'inclusive'` 固定・live キー拒否・キー欠落時は Stripe 非呼び出しで説明的エラー）として実装し、ドライランで完了とする。手動疎通（5.4）と `supabase db push`（2.2）は実キー／DB 適用が必要なため deferred とし、マージ後に実施。署名検証は webhook テストで `generateTestHeaderString` による実署名生成で検証済み
- **代替案 A**: 実キーを取得して疎通まで完了させる
- **却下理由**: 本 run の制約で実キーは未設定。可逆的かつ安全側（スクリプト化して後から一発実行）を選択

### D12: lint は「本 change 由来の新規エラーゼロ」で判定（apply-time）

- **判断**: 着手時点の baseline に既存 9 errors / 35 warnings（`useHabits.ts` の rules-of-hooks、各所の `set-state-in-effect` 等、未変更ファイル由来）がある。本 change の完了基準は「本 change が新規エラー・警告を増やさないこと」とし、`useSubscription.ts` の `set-state-in-effect` 指摘は effect 内の同期 setState を Promise 経由に統一して解消した
- **エビデンス**: 自分の変更を stash した baseline = 9 errors、適用後も 9 errors（差分ゼロ）
- **却下理由（既存エラーの一括修正）**: スコープ外の広範な既存コードリファクタになり YAGNI / 回帰リスク。別 backlog 扱い

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Webhook の out-of-order / 重複配送で `subscriptions` が不整合になる | D2 の event ID 重複排除 + upsert。重複イベントテストと並行配送を想定したテストを必須にする（受け入れ条件12） |
| `checkout.session.completed` 時に user_id とイベントを紐付けられない | Checkout セッション作成時に `client_reference_id` と `metadata.user_id` の両方へ Supabase user ID を必ず格納し、webhook 側でどちらからでも復元できるようにする |
| トライアルを DB 自前管理にしたことで、Stripe 側とトライアル概念が二重化する | トライアル中は Stripe オブジェクトを作らない（D3）ことで「Stripe にトライアルは存在しない」と単純化。課金開始後は Stripe のステータスが webhook 経由で唯一の更新源 |
| service role キーが webhook handler に必要になり、漏洩時の影響が大きい | service role クライアントは server-only モジュールに隔離し、`import 'server-only'` で client bundle 混入を防ぐ。env 経由のみで注入 |
| paywall 判定がクライアント側だけだと改ざん可能 | ゲートは UI ブロック（本 change の範囲）としつつ、entitlement 判定関数を共有モジュール化し、将来サーバー側で同じ判定を流用できる形にする。データ書き込み系のサーバー側強制は RLS が下支え |
| 将来 MoR 切替時に Stripe 固有カラム（`stripe_customer_id` 等）がスキーマに残る | カラム名は Stripe 前置で明示しておき、切替時に provider 別カラム追加で対応可能。抽象レイヤー（D5）でアプリコード側の影響は局所化 |
| テストでの Stripe 依存（ネットワーク）でテストが不安定になる | 単体テストは Stripe SDK をモックし、署名検証は `stripe.webhooks.generateTestHeaderString` 相当で実署名を生成して検証ロジックを実テスト。実 Stripe との疎通は `stripe listen --forward-to localhost:3000/api/stripe/webhook` での手動確認に分離 |

## Migration Plan

1. `supabase/migrations/YYYYMMDDHHmmss_add_subscriptions.sql` を追加（`subscriptions` + `stripe_events`、RLS ポリシー込み）。既存テーブル無変更のため後方互換
2. dev プロジェクトへ `supabase db push`（dev: `xhqddzdpcpvxpprxykct`）。prod への適用は run 完了後の昇格フローで実施
3. Stripe テストモードに Products/Prices を作成し、Price ID / secret / webhook secret を `.env.local` に追加。Vercel env（Preview/Production）は本番昇格時に設定
4. ロールバック: 新規テーブル 2 つと新規 route のみのため、マイグレーションの逆適用（drop table）+ コード revert で完全に戻せる。既存機能への影響なし

## Open Questions

- なし（API route 配置・トライアル方式・価格は plan.md / ユーザー確認で確定済み。価格の最終値は意思決定ガイドライン上「調整可能な既定値」として扱う）
