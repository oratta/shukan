# セキュリティ設計レビュー（早期）— 2026-07-02

GitHub issue [#32](https://github.com/genetta-inc/shukan/issues/32) の早期セキュリティ設計レビュー結果。
issue のチェック観点を4領域（RLS・データアクセス / 認証・ヘッダー / Stripe課金・シークレット / 入力出力・計測PII)に分けて並列調査し、検出候補には偽陽性フィルタリング（確信度8/10未満は除外）を適用した。

## 結論

**HIGH 1件（実DB照合で検出・修正済み）**、閾値未満の設計上の注意点1件、参考メモ3件。

コード上の RLS・Stripe・認証の設計自体は正しいが、**マイグレーションと稼働中DBの照合**（Supabase Management API のセキュリティアドバイザー + `has_function_privilege` 直接照会）で、マイグレーションの意図どおりに権限が適用されていない箇所を1件検出した。これは静的なコード/マイグレーション読解だけでは見つからず、実DBの権限状態を照会して初めて判明したもの。

## HIGH-1: `claim_founding_slot` RPC が anon/authenticated（＝誰でも）実行可能

* Severity: **High** / Confidence: 10/10 / 状態: **dev 適用済み・本番はマイグレーション経由で反映**
* 該当: `supabase/migrations/20260612000200_founding_memberships.sql:136-137`（無効な revoke）、修正 = `supabase/migrations/20260702000000_fix_claim_founding_slot_grant.sql`
* 根本原因: マイグレーションは `revoke execute ... from anon, authenticated` で RPC を service_role 限定にする意図だったが、**Postgres は関数作成時に EXECUTE を `PUBLIC` へ自動付与**する。`anon, authenticated` から revoke しても PUBLIC 経由の付与が残るため revoke が no-op になっていた。実DBの ACL は `=X/postgres`（PUBLIC に EXECUTE）で、`has_function_privilege('anon', ...) = true` を確認。全環境で同じ migration を走らせているため本番も同じ穴を持つ。
* 悪用シナリオ: この関数は SECURITY DEFINER（RLS回避）で `p_user_id` / `p_cap_50` / `p_cap_30` を**呼び出し側パラメータ**として受け取る。本来 webhook から service_role のみが呼ぶ想定だが、anon から `supabase.rpc('claim_founding_slot', { p_user_id:'<任意UUID>', p_cap_50:999999, p_cap_30:999999, p_stripe_price_id:null })` を直接呼べば、**(a) Stripe 決済を完全バイパスして founder_50（生涯50%割引）メンバーシップを作成**、**(b) キャップを詐称して「先着N名」の希少性を無制限突破**、**(c) 任意 user_id 名義のメンバーシップ作成**が可能。
* 修正: `revoke execute ... from public;`（＋ service_role への明示 grant）。dev に適用し anon=false / authenticated=false / service_role=true を確認済み。
* 教訓: 「`revoke from anon, authenticated`」は Postgres では不十分。関数のアクセス制限は必ず `from public` で revoke する。

---

以下は静的レビュー（4領域並列調査 + 偽陽性フィルタ）の結果。

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
4. **Supabase セキュリティアドバイザー（dev）のその他項目**（いずれも非ブロッカー）: `auth_leaked_password_protection`（漏洩パスワード保護 OFF・Google OAuth のみのため影響小）、`function_search_path_mutable: update_habit_sort_orders`（`search_path` 未固定・要 `set search_path`）、`rls_policy_always_true: waitlist`（anon INSERT のみで意図的）、`rls_enabled_no_policy: stripe_events`（service_role 専用で意図的）。`pg_graphql_*_table_exposed` 群は RLS 前提の想定内。

## 検証済みの設計（問題なし）

| 観点 | 確認結果 |
|---|---|
| Supabase RLS | 全テーブル（habits / habit_completions / user_settings / daily_reflections / article_feedbacks / urge_logs / coping_steps / habit_evidences / subscriptions / stripe_events / founding_memberships / waitlist）で RLS 有効。CRUD 全操作に `auth.uid()` ベースのポリシー。課金系テーブルはユーザー書き込みポリシーなし（service_role 限定） |
| SECURITY DEFINER RPC | `update_habit_sort_orders` は `auth.uid()` で自分の habit に限定（anon 呼び出しは no-op）。`count_founding_slots` は集計のみ。`search_path` 固定。※ `claim_founding_slot` の実行権限は上記 HIGH-1 で修正 |
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
