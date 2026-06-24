# Design: founding-member-program

## Context

Smitch のマネタイズ基盤 run（_longruns/2026-06-08_monetization-foundation/plan.md）の change-B。change-A `stripe-billing-foundation` が提供する `subscriptions` テーブル・Stripe Webhook 受信基盤（`/api/stripe/webhook`、署名検証・冪等処理）・Checkout セッション生成の上に、Founding Member 階層割引プログラムを実装する。

ビジネス制約:

- 「払う」こと自体が需要シグナル。枠は課金成功時にのみ消費される（登録・トライアル開始では消費しない）
- 永久割引は小コホート限定（50%off×50人 / 30%off×200人）でハードクローズ。以降は通常価格（年間は通常 20%off）
- ブランド「うさんくさくない」: 残り枠は実数の透明表示のみ。偽カウントダウン・架空の在庫煽りは禁止（change-D 景表法準拠とも整合）

技術制約:

- Next.js 16.1.6 App Router / Supabase (RLS, RPC) / Vitest
- 既存 RPC 前例: `supabase/migrations/20260401000000_sort_order_rpc.sql`（plpgsql, SECURITY DEFINER）
- migrations 命名: `YYYYMMDDHHmmss_desc.sql`

**依存: change-A `stripe-billing-foundation` に依存する。** Webhook ハンドラと Checkout セッション生成は change-A の成果物を拡張する形で実装し、本 change 単独ではマージ・デプロイしない。

## Goals / Non-Goals

**Goals:**

- `founding_memberships` テーブルと、over-allocation を DB レベルで防ぐアトミックな枠確保 RPC
- 課金成功 Webhook 内でのみ枠を確保するフロー（tier フォールバック付き）
- Stripe 側の tier 別割引適用と、更新時も割引が維持されるグランドファザリング
- anon が取得できる残り枠カウンタ API（集計値のみ・10〜30秒キャッシュ・実数）
- トライアル中の早期切替で、その時点の tier の割引を永久ロック
- 枠上限の設定値化（テストで小さい値による境界検証）

**Non-Goals:**

- ティザーページ / waitlist UI（change-C）
- 特商法表記・最終確認画面・税込表示（change-D。本 change は実数カウンタを提供するのみ）
- Checkout / Webhook 基盤そのものの実装（change-A）
- CS 優先度の機能実装・可視化されたロイヤルティ tier UI（plan.md スコープ外）

## Decisions

### D1: 枠確保は単一の Postgres RPC `claim_founding_slot` でアトミックに行う

- **判断**: `claim_founding_slot(p_user_id uuid, p_cap_50 int, p_cap_30 int)` を plpgsql / SECURITY DEFINER で実装。関数内で `pg_advisory_xact_lock`（固定キー）を取得してから tier 別件数を数え、空きのある最上位 tier に INSERT し、確保した tier（または `none`）を返す。トランザクション終了でロック解放
- **代替案 A**: アプリ側（Next.js route handler）で SELECT → 判定 → INSERT
- **却下理由**: Webhook の並行実行（Stripe はリトライ・並行配送あり）で check-then-insert の競合が起き、over-allocation を防げない。DB 内で直列化するのが唯一確実
- **代替案 B**: `id`（連番）と cap の比較だけで判定（`id <= 50` なら founder_50）
- **却下理由**: シーケンスは失敗トランザクションで欠番が出るため、cap 判定に使うと実際より早く枠が閉じる。連番 `id` は「確保順の記録」としてのみ使い、tier 判定は COUNT で行う
- **補足**: `user_id` の UNIQUE 制約が二重確保（Webhook 冪等性の最後の砦）を防ぐ。既存 membership がある場合は既存 tier を返すだけで何もしない（冪等）

### D2: 枠上限は env から RPC 引数として渡す

- **判断**: `FOUNDING_CAP_50`（既定 50）/ `FOUNDING_CAP_30`（既定 200）を env で持ち、Webhook ハンドラが RPC 呼び出し時に引数で渡す。DB 側に上限をハードコードしない
- **代替案 A**: RPC 内に定数として埋め込む
- **却下理由**: テストで小さい値（2/3 等）による境界検証ができない。plan.md の config rule「枠上限は設定値」に反する
- **代替案 B**: 設定テーブル（`app_settings`）を新設
- **却下理由**: 設定値 2 つのためにテーブルを増やすのは過剰。将来必要になれば移行可能

### D3: Stripe 割引は tier 別 Price ID で表現する（Coupon ではなく）

- **判断**: 各プラン（monthly/annual）× tier（founder_50/founder_30）の割引済み Price を Stripe に定義し、Checkout セッションは tier に対応する Price ID を使う。`founding_memberships.stripe_price_id` に適用 Price を記録
- **代替案 A**: `duration: forever` の Coupon を通常 Price に適用
- **却下理由**: Price ID 方式は (1) 更新時の請求額がサブスクの Price そのものなのでグランドファザリングが Stripe ネイティブに保証される (2) change-D の最終確認画面で「各回代金・支払総額」を Price から直接計算でき税込総額表示と整合しやすい (3) Coupon は Customer Portal でのプラン変更時に外れる事故パターンが知られている
- **トレードオフ**: Price 数が増える（2 プラン × 2 tier + 通常 + 年間 20%off）。Products/Prices 定義は change-A のセットアップスクリプト/手順に追記して管理する

### D4: 残り枠カウンタは公開 route handler + 短期キャッシュ

- **判断**: `GET /api/founding/slots` を認証不要の route handler として実装。サーバー側で service_role（または専用の集計 RPC）を使って tier 別 COUNT を取得し、`{ founder50: { cap, claimed, remaining }, founder30: { ... } }` の集計値のみ返す。`Cache-Control: s-maxage=15, stale-while-revalidate=30`（10〜30秒帯）で CDN キャッシュし実数を返す
- **代替案 A**: anon キーで `founding_memberships` を直接 SELECT（RLS で公開）
- **却下理由**: 行レベルのデータ（user_id, claimed_at）が anon に露出する。集計値のみ返す API に閉じることで個人データ非露出を構造的に保証する
- **代替案 B**: キャッシュなしで毎回 COUNT
- **却下理由**: ティザー（未ログイン・change-C）から高頻度参照されるため DB 負荷が無駄。10〜30秒の鮮度で「実数表示」（景表法・ブランド要件）には十分
- **補足**: middleware matcher は拡張しない（change-A の方針と同じ。`/api/founding/*` は matcher 外で動く公開 API）

### D5: tier はチェックアウト時に「見込み」、Webhook の課金成功時に「確定」

- **判断**: Checkout セッション生成時はその時点の残り枠から tier 候補の Price ID を選ぶが、枠の確保（INSERT）は課金成功 Webhook 内の RPC のみが行う。Webhook で RPC が返した確定 tier がセッション生成時の見込み tier と異なる場合（直前に枠が埋まった場合）は、Stripe Subscription の Price を確定 tier の Price に更新し、`founding_memberships`（または通常価格）を確定値で記録する
- **代替案 A**: Checkout 生成時に枠を仮確保（reservation）し TTL で解放
- **却下理由**: 仮確保は「未課金ユーザーが枠を消費しない」という plan.md の必須ルール（受け入れ条件 8）に反する。離脱セッションの掃除（TTL 管理）も複雑
- **トレードオフ**: 境界タイミングで「50%off で Checkout したが確定は 30%off」が起こり得る。発生確率は低く（枠境界の数秒間のみ）、UI に「割引は決済完了時点の残り枠で確定します」と明記して誠実に扱う（ブランド整合）。Risks 参照

### D6: RLS — 本人は自分の membership を SELECT 可、書き込みは RPC 経由のみ

- **判断**: `founding_memberships` は RLS 有効。SELECT は `auth.uid() = user_id` の本人のみ（アカウント画面で自分の tier を表示するため）。INSERT/UPDATE/DELETE のポリシーは作らず、書き込みは SECURITY DEFINER の RPC（service_role から呼ぶ）のみが行える
- **代替案 A**: authenticated に INSERT を許可
- **却下理由**: クライアントから直接枠確保できると「課金成功 Webhook 内でのみ確保」の不変条件が破れる

### D7: plpgsql RPC は TS リファレンス実装テストで担保し、実 DB 検証はマージ後（Apply, 2026-06-12）

- **コンテキスト**: dev DB は並行 run 制約により worktree から `supabase db push` できない（plan.md 制約。20260612000000/000100 は使用済みのため本 migration は 20260612000200）。plpgsql を Vitest で直接実行する手段もない
- **選択肢**: A: RPC 検証を全て deferred にしてテストなし / B: TS リファレンス実装（`decideTier` / `FoundingSlotStore`）で tier フォールバック・並行 over-allocation 防止・冪等の同一不変条件をテストし、RPC 呼び出し層は supabase client モックで検証、実 plpgsql 実行はマージ後の統合検証項目 / C: pglite 等で plpgsql をエミュレート
- **決定**: B
- **理由**: A は TDD の RED 先行（tasks 1.2/1.3）を満たせず境界・並行ロジックが無検証になる。C は pglite が `pg_advisory_xact_lock` / `generated always as identity` の完全サポートを保証せず、エミュレータ固有の挙動差で偽陽性/偽陰性のリスク。B は「同じ決定規則（COUNT ベース・founder_50→founder_30→none・unique(user_id) 冪等・advisory lock 直列化の async mutex 相当）」を TS で encode し、境界（小 cap 2/3）・50 並行 claim での over-allocation ゼロ・同一 user 重複 claim 単一 membership を実テストできる。RPC SQL は production authority、TS は同一不変条件のテスト対象、という責務で明示
- **マージ後の統合検証項目**（必須）: (1) `supabase db push` で migration 適用 (2) 実 DB で小 cap による境界 claim と並行 claim を実行し over-allocation がないこと (3) `count_founding_slots()` が anon に集計値のみ返すこと (4) RLS で本人のみ自 membership を SELECT 可
- **リスク**: TS リファレンスと plpgsql の実装乖離 → 同一の決定規則をコメントで相互参照（`allocation.ts` ヘッダ / migration コメント）し、マージ後検証で実 DB 挙動を確認して閉じる

### D8: 確定 tier の Price 補正は冪等な `updateSubscriptionPrice` で常に適用（Apply, 2026-06-12）

- **コンテキスト**: D5 の見込み/確定 tier 不一致補正。Webhook は checkout 時の見込み Price を知らない（ドメインイベントに含まれない）
- **決定**: 見込み Price と比較せず、claim が確定した tier の Price へ「常に」`subscriptions.update` で寄せる。Stripe SDK 側で現 item.price が同一なら no-op（`updateSubscriptionPrice` 内で early return）
- **理由**: 見込み Price を webhook まで運ぶ配管を増やさず、確定 tier の Price に収束させれば結果は同じ（グランドファザリングは Stripe ネイティブ Price で保証）。`proration_behavior: 'none'`（activation 時補正で日割り line を出さない）
- **リスク**: lifetime（payment mode・subscription なし）は補正対象外 → `applyFoundingClaim` で plan==='lifetime' を early return

- [Checkout 見込み tier と Webhook 確定 tier の不一致（境界レース）] → D5 の通り Webhook 側で Subscription Price を確定 tier に補正し、UI に確定タイミングを明記。境界テスト（小 cap）でこのパスを検証する
- [advisory lock キーの衝突（他機能が同キーを使う）] → プロジェクト固有の定数キー（例: `hashtext('founding_memberships')`）を使い、マイグレーションにコメントで予約を明記
- [Webhook リトライによる二重確保] → `user_id` UNIQUE 制約 + RPC の冪等設計（既存行があれば既存 tier を返す）で防止。change-A の Webhook 冪等基盤とも二重に守る
- [カウンタ API のキャッシュにより一瞬古い残数が表示される] → 10〜30秒の鮮度は景表法上の実数表示として許容範囲（架空の数字ではなく実カウントの遅延）。確定は常に DB 側で行われるため over-allocation には繋がらない
- [Stripe の Price 増殖による管理コスト] → Price ID は env / 設定モジュールに一元化し、命名規約（`founder50_monthly` 等の lookup_key）で機械的に対応付ける
- [cap を後から下げた場合、確保済みが cap を超える状態になる] → RPC は「残り = cap - claimed が正のときのみ確保」なので新規確保が止まるだけで、既存 membership は維持（グランドファザリングの不変条件を優先）

## Migration Plan

1. マイグレーション `YYYYMMDDHHmmss_founding_memberships.sql` を追加:
   - `founding_memberships` テーブル（`id bigint generated always as identity`, `user_id uuid unique references auth.users`, `tier text check (tier in ('founder_50','founder_30'))`, `discount_pct int`, `claimed_at timestamptz default now()`, `stripe_price_id text`）
   - RLS 有効化 + 本人 SELECT ポリシー
   - `claim_founding_slot(p_user_id, p_cap_50, p_cap_30)` RPC（SECURITY DEFINER、advisory lock、冪等）
   - 集計用 `count_founding_slots()` RPC（tier 別件数のみ返す）
2. `supabase db push` で dev に適用 → テスト（小 cap で境界・並行）→ prod へは change-A と同時にデプロイ
3. Stripe（テストモード）に tier 別 Price を作成し、env に Price ID / cap を設定
4. ロールバック: 枠確保前なら `drop function` + `drop table` のダウンマイグレーションで安全に戻せる。課金成功者が出た後は membership データが請求実態と紐づくためテーブルは温存し、Webhook 内の RPC 呼び出しを feature flag（env）で無効化する

## Open Questions

- なし（tier 不一致時の補正方針は D5 で決定済み。価格の最終値は plan.md の既定値を使用し、ユーザー最終確認で変更可能）
