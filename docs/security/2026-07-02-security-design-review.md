# セキュリティ設計レビュー（早期）— 2026-07-02

GitHub issue [#32](https://github.com/oratta/shukan/issues/32) の早期セキュリティ設計レビュー結果。
issue のチェック観点を4領域（RLS・データアクセス / 認証・ヘッダー / Stripe課金・シークレット / 入力出力・計測PII)に分けて並列調査し、検出候補には偽陽性フィルタリング（確信度8/10未満は除外）を適用した。

## 結論

**高確信度（confidence ≥ 8/10）の HIGH / MEDIUM 脆弱性: 0件。**

Supabase のセキュリティ境界（RLS + service_role 分離 + SECURITY DEFINER RPC）、Stripe webhook の署名検証、middleware の認証ゲートはいずれも正しく設計されている。ローンチブロッカーとなる設計欠陥は検出されなかった。

閾値未満の設計上の注意点が1件（実在するが影響は限定的）と、参考メモが3件ある（下記）。

## 設計上の注意点（閾値未満・LOW）

### 1. create_habit のペイウォールがクライアント側でしか強制されない

* 判定: REAL / Severity: **Low** / Confidence: 6/10（閾値8未満のため正式報告からは除外）
* 該当: `src/lib/billing/create-habit-gate.ts:22`（ゲート）、`src/app/(app)/page.tsx:142`（唯一の呼び出し元・'use client'）、`src/lib/supabase/habits.ts:170`（ブラウザから habits へ直接 INSERT）、`supabase/migrations/20260212000000_init_schema.sql:24-27`（RLS は `auth.uid() = user_id` のみ）
* 内容: `shouldBlockCreateHabit()` はクライアントコンポーネントでのみ呼ばれ、DB 書き込み経路（RLS）は entitlement（トライアル期限・課金状態）を検証しない。`src/lib/billing/entitlement.ts:7` のコメント自身が「サーバー側強制は将来実装」と明記。
* シナリオ: トライアル期限切れユーザーが自分の正当な JWT で `supabase.from('habits').insert(...)` を直接実行すると、ペイウォール UI を迂回して有料機能を継続利用できる。影響は自アカウントでの収益逸失のみで、他ユーザーのデータには一切影響しない。
* 対応方針: habits INSERT の RLS `with check` に有効な entitlement の存在チェックを追加するか、習慣作成をサーバールート / RPC 経由にして `isEntitled()` をサーバー側で強制する。**課金導線を本格化する前（ローンチ直前レビューまで）に対応するのが望ましい。**
* 補強材料: `subscriptions` テーブルは authenticated 向け書き込みポリシーを持たず service_role 限定なので、ユーザーが課金状態自体を偽装することはできない。未実装なのは habits 側のゲートのみ。

## 参考メモ（脆弱性ではない）

1. **`article_feedback_stats` ビューが security_invoker 未設定**（`supabase/migrations/20260304000000_article_feedbacks.sql:36`）— ビュー所有者権限で実行され下層テーブルの RLS を回避しうるが、公開されるのは記事単位の集計カウントのみで個人データは構造的に含まれない。気になるなら `with (security_invoker = true)` 化、または anon/authenticated から revoke select。
2. **`auth/callback` の `x-forwarded-host` リダイレクト**（`src/app/auth/callback/route.ts:13-17`）— Supabase 公式テンプレートのままで、Vercel 上ではこのヘッダーはプラットフォームが設定するため攻撃者制御不可。悪用可能性 <0.2。強化するならホストを allowlist 検証。
3. **将来の配線時の注意**: `startTrial`（`src/lib/billing/trial.ts`）は現状未使用。API/Server Action として公開する際は userId を `auth.getUser()` 由来に限定すること。`getFoundingMembershipForUser`（service_role 使用）も同様に、呼び出し元が渡す ID の出所検証が前提。

## 検証済みの設計（問題なし）

| 観点 | 確認結果 |
|---|---|
| Supabase RLS | 全テーブル（habits / habit_completions / user_settings / daily_reflections / article_feedbacks / urge_logs / coping_steps / habit_evidences / subscriptions / stripe_events / founding_memberships / waitlist）で RLS 有効。CRUD 全操作に `auth.uid()` ベースのポリシー。課金系テーブルはユーザー書き込みポリシーなし（service_role 限定） |
| SECURITY DEFINER RPC | `update_habit_sort_orders` は `auth.uid()` で自分の habit に限定。`claim_founding_slot` は anon/authenticated から revoke execute 済み。`search_path` 固定 |
| service_role 分離 | `subscriptions-admin.ts` / `founding-admin.ts` は `import 'server-only'` でクライアントバンドル除外。渡る userId は署名検証済み Stripe イベントまたはハンドラ内 `auth.getUser()` 由来のみ |
| 認証・middleware | `src/middleware.ts` は `getUser()`（サーバー検証済み JWT）でゲート。matcher が全認証ページをカバーし、prefix バイパスの余地なし。API ルートは各ハンドラ内で認可（未認証 401） |
| Stripe | webhook は生ボディ + `constructEvent` で署名検証後に DB 書き込み。`stripe_events` で冪等。価格はサーバーが env から解決（クライアントは plan の列挙値のみ送信可）。checkout は `client_reference_id` / `metadata.user_id` に認証ユーザーを束縛 |
| シークレット | `NEXT_PUBLIC_*` は URL / anon key / ホスト設定のみ（設計上公開可）。ソース中にハードコードされたシークレットなし |
| XSS / 入力 | `dangerouslySetInnerHTML` 等の危険シンク 0件。markdown レンダラ不使用。RPC は全て名前付きパラメータ。checkout の plan は allowlist 検証、waitlist の email は正規表現 + DB CHECK |
| エラー漏洩 | 全 API ルートが固定メッセージ返却。スタックトレース / DB エラー詳細のクライアント露出なし |
| セキュリティヘッダー | X-Frame-Options: DENY、X-Content-Type-Options: nosniff、Referrer-Policy、Permissions-Policy 設定済み（`next.config.ts:11-14`）。CSP は未設定（後述） |
| 計測 PII | サードパーティ計測スタックが未導入のため PII 送信経路なし |

## ローンチ直前レビュー（2回目）への引き継ぎ事項

issue #32 の想定どおり、実装完了後にもう1回レビューする。その際の重点:

1. **create_habit の entitlement サーバー側強制**が実装されたことの確認（上記 Low の解消）
2. **CSP の導入検討**（現状ヘッダーは妥当だが CSP 未設定。Stripe.js 等の外部スクリプトを踏まえた policy 設計）
3. **アナリティクス導入後の PII 棚卸し**（現在は計測スタック自体が未導入。導入時に匿名計測の担保を再確認）
4. オンボーディングで追加される `user_profiles` テーブルの RLS 確認
5. `startTrial` 等、現在未配線のコードが公開された際の認可確認
