# Tasks: founding-member-program

## 1. DB スキーマ + 枠確保 RPC（TDD）

- [ ] 1.1 マイグレーション `YYYYMMDDHHmmss_founding_memberships.sql` のスケルトンを作成（`founding_memberships` テーブル: id 連番 identity / user_id FK unique / tier check / discount_pct / claimed_at / stripe_price_id、RLS 有効化 + 本人 SELECT のみ、書き込みポリシーなし。RPC `claim_founding_slot` / `count_founding_slots` のシグネチャのみ定義）
- [ ] 1.2 【RED】枠確保ロジックの単体テストを先に作成（Vitest）: 小 cap（例 2/3）での tier 判定・founder_50 上限到達で founder_30 フォールバック・全 cap 到達で none・同一 user の重複 claim が冪等であること
- [ ] 1.3 【RED】並行 claim の競合テストを先に作成: 複数 claim を並行実行し、各 tier の件数が cap を超えない（over-allocation なし）ことを検証
- [ ] 1.4 `claim_founding_slot(p_user_id, p_cap_50, p_cap_30)` RPC のロジックを実装（plpgsql / SECURITY DEFINER / `pg_advisory_xact_lock` で直列化 / COUNT で tier 判定 / founder_50 → founder_30 → none フォールバック / 既存 membership があれば既存 tier を返す冪等設計）。advisory lock キーの予約をコメントで明記
- [ ] 1.5 集計用 `count_founding_slots()` RPC のロジックを実装（tier 別件数のみ返す。個人データ非露出）
- [ ] 1.6 【GREEN】`supabase db push` で dev に適用し、1.2 / 1.3 のテストが GREEN であることを確認

## 2. Webhook 統合（課金成功時のみ枠確保）

- [ ] 2.1 env 設定を追加: `FOUNDING_CAP_50`（既定 50）/ `FOUNDING_CAP_30`（既定 200）を読み込む設定モジュールを実装（テストで上書き可能にする）
- [ ] 2.2 change-A の課金成功 Webhook ハンドラに `claim_founding_slot` 呼び出しを統合（caps を env から引数で渡す。確定 tier を `subscriptions` 連携情報と共に記録）
- [ ] 2.3 Checkout 時の見込み tier と Webhook 確定 tier が異なる場合の補正を実装（Stripe Subscription の Price を確定 tier の Price に更新）
- [ ] 2.4 Webhook 統合テストを作成: 課金成功イベントで枠が確保される / 登録時・トライアル開始時には `founding_memberships` が増えない / Webhook リトライ（同一イベント再送）で二重確保しない / **見込み tier と確定 tier が異なる境界レース時に Stripe Subscription の Price が確定 tier に補正される**

## 3. Stripe 割引適用（tier 別 Price）

- [ ] 3.1 Stripe テストモードに tier 別 Price を定義（monthly/annual × founder_50/founder_30、＋通常年間 20%off）。**全て `tax_behavior: inclusive`（税込総額）で作成する**（change-D の総額表示要件。作成後変更不可）。lookup_key 命名規約で整理し、Price ID を env / 設定モジュールに一元化
- [ ] 3.2 Checkout セッション生成を拡張: その時点の残り枠から tier 候補を判定し、対応する Price ID でセッションを生成。UI 文言「割引は決済完了時点の残り枠で確定」を含める
- [ ] 3.3 テストを作成: tier ごとに正しい Price ID が選択される / 全 cap 消化済みなら通常 Price（年間は 20%off）が選択される / membership 行に `stripe_price_id` が記録される

## 4. 残り枠カウンタ API（公開・短期キャッシュ）

- [ ] 4.1 `src/app/api/founding/slots/route.ts` を作成: 認証不要 GET、`count_founding_slots()` で集計し `{ founder50: { cap, claimed, remaining }, founder30: {...} }` のみ返す（user_id 等の個人データ非露出）
- [ ] 4.2 `Cache-Control: s-maxage=15, stale-while-revalidate=30`（10〜30秒帯）のキャッシュヘッダを設定
- [ ] 4.3 テストを作成: anon リクエストで集計値が返る / レスポンスに個人データが含まれない / 枠消費後に実数が反映される / キャッシュヘッダが 10〜30 秒帯である

## 5. 早期切替フロー + グランドファザリング

- [ ] 5.1 トライアル中ユーザー向けの早期切替導線を実装（アカウント/課金画面に「早期に切替えて割引をロック」CTA、残り枠の透明表示。トライアル中のみ表示）
- [ ] 5.2 早期切替テストを作成: トライアル中に Checkout → 課金成功でその時点の tier がロックされ `founding_memberships` と `subscriptions` が更新される
- [ ] 5.3 グランドファザリングのテストを作成: サブスク更新イベント（invoice.paid / customer.subscription.updated）処理後も tier 別 Price での請求が維持され、`founding_memberships` 行が変更されないこと

## 6. 品質確認

- [ ] 6.1 `npm run test:run` で全テスト GREEN（境界テストは小 cap 設定で実行）
- [ ] 6.2 `npm run lint` でエラーゼロ
- [ ] 6.3 `npm run build` でビルド成功（型チェック含む）
- [ ] 6.4 受け入れ条件 7,8,9,10,11,15 の充足をテスト一覧と突き合わせて確認
