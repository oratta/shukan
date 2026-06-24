# Proposal: founding-member-program

## Why

Smitch のマネタイズ戦略（plan.md: monetization-foundation）では、初期にコミットしたユーザーを永久割引で優遇する「Founding Member」プログラムが転換率の中核を担う。リサーチ上も Founding Member / グランドファザリングは確立手法だが、「払う」こと自体を需要シグナルとするため、枠の確保は課金成功時のみ・小コホート限定・ハードクローズ必須という設計が要る。change-A（stripe-billing-foundation）の課金基盤の上に、この階層割引プログラムの DB・割引適用・公開カウンタを実装する。

## What Changes

- **新規追加**: Supabase `founding_memberships` テーブル（`id` 連番＝確保順, `user_id` FK unique, `tier`(founder_50/founder_30), `discount_pct`, `claimed_at`, `stripe_price_id`）
- **新規追加**: 課金成功時のアトミックな枠確保 RPC — 50%off 上限 50 人 → 埋まったら 30%off 上限 200 人 → 埋まったら通常価格へフォールバック（年間契約は通常 20%off）。DB レベル（トランザクション + ロック）で over-allocation を防止
- **新規追加**: 枠確保のトリガー制約 — 課金成功 Webhook 内でのみ実行。登録時・トライアル開始時には確保しない
- **新規追加**: Stripe 側の割引適用 — tier 別 Price ID（または Coupon）で Checkout に割引を反映
- **新規追加**: 残り枠カウンタ API — anon 取得可能な公開エンドポイント。集計値のみ返し個人データ非露出。短期キャッシュ（10〜30秒 revalidate）で実数を返す
- **新規追加**: トライアル中の早期切替フロー — トライアル途中で課金に切り替えると、その時点の Founding tier で割引が永久ロックされる
- **新規追加**: グランドファザリング — 一度確保した永久割引はサブスク更新時も維持される
- **設定値化**: 枠上限（50 / 200）は設定値（env / RPC 引数）。テストでは小さい値で境界検証できる

## Capabilities

### New Capabilities
- `founding-membership`: Founding Member 階層割引プログラム。枠のアトミック確保・tier フォールバック・Stripe 割引適用・残り枠公開カウンタ・早期切替・グランドファザリングを扱う

### Modified Capabilities
- なし（change-A の `subscriptions` / Webhook 基盤を利用するが、その要件自体は変更しない）

## Impact

- **影響コード**:
  - `supabase/migrations/`（`founding_memberships` テーブル + 枠確保 RPC の新規マイグレーション）
  - change-A の Stripe Webhook ハンドラ（`/api/stripe/webhook`）に枠確保呼び出しを追加
  - `src/app/api/founding/slots/route.ts`（残り枠カウンタ API、新規）
  - Checkout セッション生成ロジック（tier 別 Price ID の選択）
  - アカウント/課金画面の「早期切替」CTA（トライアル中のみ表示）
- **影響 API / 外部依存**: Stripe Products/Prices（tier 別の割引 Price を追加定義）。Supabase スキーマに `founding_memberships` 追加
- **依存関係**: **change-A `stripe-billing-foundation` に依存**（`subscriptions` テーブル・Webhook 受信基盤・Checkout セッション生成が前提）
- **影響範囲限定**: 既存の habits / reflections 等のスキーマ・既存認証フローは一切変更しない
