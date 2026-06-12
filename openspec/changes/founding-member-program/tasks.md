# Tasks: founding-member-program

## 1. DB スキーマ + 枠確保 RPC（TDD）

- [x] 1.1 マイグレーション `20260612000200_founding_memberships.sql` を作成（`founding_memberships` テーブル: id 連番 identity / user_id FK unique / tier check / discount_pct / claimed_at / stripe_price_id、RLS 有効化 + 本人 SELECT のみ、書き込みポリシーなし。RPC `claim_founding_slot` / `count_founding_slots` を実装）
- [x] 1.2 【RED】枠確保ロジックの単体テストを先に作成（Vitest, `founding-allocation.test.ts`）: 小 cap（2/3）での tier 判定・founder_50 上限到達で founder_30 フォールバック・全 cap 到達で none・同一 user の重複 claim が冪等であること
- [x] 1.3 【RED】並行 claim の競合テストを先に作成（`founding-allocation.test.ts`）: 50 claim を並行実行し、各 tier の件数が cap を超えない（over-allocation なし）ことを検証
- [x] 1.4 `claim_founding_slot(p_user_id, p_cap_50, p_cap_30, p_stripe_price_id)` RPC のロジックを実装（plpgsql / SECURITY DEFINER / `pg_advisory_xact_lock(718203)` で直列化 / COUNT で tier 判定 / founder_50 → founder_30 → none フォールバック / 既存 membership があれば既存 tier を返す冪等設計）。advisory lock キー 718203 の予約をコメントで明記。RPC 呼び出し層は `founding-admin.ts` に実装し `founding-admin.test.ts` でモック検証。tier 判定ロジックは `allocation.ts`（`decideTier` / `FoundingSlotStore`）のリファレンス実装で境界・並行・冪等を担保
- [x] 1.5 集計用 `count_founding_slots()` RPC のロジックを実装（tier 別件数のみ返す。個人データ非露出）。`getFoundingCounts()` で cap/claimed/remaining に整形（`founding-admin.test.ts`）
- [~] 1.6 【GREEN】`supabase db push` で dev に適用し、1.2 / 1.3 のテストが GREEN であることを確認 — **DEFERRED**: 並行 run 制約により worktree から push しない（plan.md 制約）。plpgsql は Vitest で直接実行できないため、tier フォールバック・並行 over-allocation 防止・冪等は `allocation.ts` の TS リファレンス実装テスト（11 ケース）で担保。**実 DB での RPC 検証はマージ後の統合検証項目**（decisions D6）

## 2. Webhook 統合（課金成功時のみ枠確保）

- [x] 2.1 env 設定を追加: `FOUNDING_CAP_50`（既定 50）/ `FOUNDING_CAP_30`（既定 200）を読み込む `src/lib/founding/config.ts`（`getFoundingCaps`、テストで上書き可。`founding-config.test.ts`）
- [x] 2.2 課金成功 Webhook ハンドラ（`subscription_activated` 分岐）に `applyFoundingClaim` を統合（caps を env から RPC 引数で渡す。`founding-webhook.test.ts`）
- [x] 2.3 Checkout 見込み tier と Webhook 確定 tier が異なる場合の補正を実装（`updateSubscriptionPrice` で Stripe Subscription の Price を確定 tier の Price に更新）。`founding/webhook.ts` + `billing/stripe.ts`
- [x] 2.4 Webhook 統合テストを作成（`founding-webhook.test.ts`）: 課金成功イベントで枠が確保される / 登録・トライアル開始（status-change / invoice.paid）では `claim_founding_slot` を呼ばない / Webhook リトライ（同一イベント再送）で二重確保しない / 見込み tier と確定 tier が異なる時に Stripe Subscription の Price が確定 tier に補正される

## 3. Stripe 割引適用（tier 別 Price）

- [x] 3.1 `scripts/stripe-setup.ts` を tier 別 Price 対応に拡張（monthly/annual × founder_50/founder_30、＋通常 monthly/annual/lifetime）。**全て `tax_behavior: 'inclusive'`**。`lookup_key` 命名規約（`founder50_monthly` 等）で整理し、Price ID を env（`STRIPE_PRICE_FOUNDER50_MONTHLY` 等）に一元化（`founding/config.ts`）。実 Price 作成は実キー必要のためマージ後（`npm run stripe:setup`）
- [x] 3.2 Checkout セッション生成を拡張（`resolveCheckoutPriceId`）: `predictFoundingTier` でその時点の残り枠から tier 候補を判定し、対応する Price ID でセッションを生成。失敗時は通常 Price にフォールバック（`founding-checkout.test.ts`）
- [x] 3.3 テストを作成（`founding-config.test.ts` / `founding-checkout.test.ts`）: tier ごとに正しい Price ID が選択される / 全 cap 消化済みなら通常 Price（年間は 20%off）が選択される / membership 行に `stripe_price_id` が記録される（RPC 引数経由）

## 4. 残り枠カウンタ API（公開・短期キャッシュ）

- [x] 4.1 `src/app/api/founding/slots/route.ts` を作成: 認証不要 GET、`getFoundingCounts()`（`count_founding_slots()` RPC）で集計し `{ founder50: { cap, claimed, remaining }, founder30: {...} }` のみ返す（個人データ非露出）
- [x] 4.2 `Cache-Control: public, s-maxage=15, stale-while-revalidate=30`（10〜30秒帯）のキャッシュヘッダを設定
- [x] 4.3 テストを作成（`founding-slots-route.test.ts`）: anon リクエストで集計値が返る / レスポンスに個人データが含まれない / 枠消費後に実数が反映される / キャッシュヘッダが 10〜30 秒帯である

## 5. 早期切替フロー + グランドファザリング

- [x] 5.1 トライアル中ユーザー向けの早期切替導線ロジックを実装（`src/lib/founding/early-switch.ts`: `shouldOfferEarlySwitch` は active trial のみ true、`earlySwitchConfirmationCopy` は「割引は決済完了時点で確定」を誠実に伝え偽の緊急性なし。`founding-early-switch.test.ts`）。※フル account ページ UI は change スコープ外（本 change はゲーティングロジック＋確定パスを担保）
- [x] 5.2 早期切替テスト（`founding-webhook.test.ts` の課金成功パス＝早期切替も同一）: トライアル中の Checkout → 課金成功でその時点の tier がロックされ membership/subscriptions が更新される
- [x] 5.3 グランドファザリングのテスト（`founding-webhook.test.ts`）: 更新イベント（invoice.paid / customer.subscription.updated）処理後も `claim_founding_slot` を再呼び出ししない（tier 別 Price 請求が維持され membership 行不変）

## 6. 品質確認

- [x] 6.1 `npm run test:run` で全テスト GREEN（境界テストは小 cap 2/3 で実行）— 317 passed（既存 269 + 新規 48）
- [x] 6.2 `npm run lint` で新規エラーゼロ（baseline 9 errors / 35 warnings 据え置き、本 change 由来の増分なし）
- [x] 6.3 `npm run build` でビルド成功（型チェック含む、`/api/founding/slots` route 登録確認）
- [x] 6.4 受け入れ条件 7,8,9,10,11,15 の充足をテスト一覧と突き合わせて確認（7→S16/founding-webhook, 8→S7/S8, 9→S4/decideTier, 10→S6/FoundingSlotStore 並行, 11→S12-15/slots-route, 15→S17/founding-webhook）
