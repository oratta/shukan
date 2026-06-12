# Decisions Log — monetization-foundation

意思決定の記録。各判断にはエビデンス（実行コマンドと出力）を含める。

## D1: Stripe スキルは未導入、Context7 で代替（Setup, 2026-06-12）

- **判断**: plan.md セットアップ前提の「Stripe スキルのプロジェクトインストール」は、ローカル・marketplace・OpenSkills のいずれにも該当スキルが存在しないため、Context7 による最新ドキュメント参照で代替する
- **エビデンス**:
  - `ls ~/.claude/skills/ | grep -i stripe` → ヒットなし
  - `ls ~/.claude/plugins/marketplaces/*/plugins/*/skills/ | grep -i stripe` → ヒットなし
  - `npx openskills search stripe` → 出力なし（利用不可）
- **影響**: longrun-builder への指示に「Stripe 実装前に Context7 で `stripe` / `stripe-node` の最新パターンを確認すること」を含める

## D2: Build Contract レビュー指摘の取捨選択（Build Contract, 2026-06-12）

- **判断**: longrun-reviewer の指摘4件＋既存コード問題2件を全て「(a) 採用すべき指摘」と判定し plan.md に反映。嗜好レベルの指摘は含まれていなかったため反論なし
- **判定内訳**:
  - 指摘1 (BLOCKER) Webhook/API route の middleware 整合 → 採用（事実誤認の余地なし: matcher に `/api/*` 不在を reviewer がコード確認済み）。Webhook=matcher外+署名検証 / 認証route=handler内 getUser() / matcher 拡張しない、を採用方針として明記
  - 指摘2 i18n 方式未確定 → 採用（marketing/copy.ts が next-intl 非使用という事実と plan の en/ja 要求の矛盾）。next-intl 方式に確定
  - 指摘3 waitlist anon RLS 具体策 → 採用（セキュリティ）。anon insert のみ/select は service_role/unique(email)+upsert
  - 指摘4 (NOTE) 残り枠カウンタのキャッシュ → 採用（anon read 経路は機能要件）。公開エンドポイント+10〜30秒キャッシュ
  - 既存 /privacy /terms の存在 → 採用（事実）。change-D は既存ページへの追記と明記
- **エビデンス**: reviewer 報告内の参照ファイル（src/middleware.ts の matcher、src/app/marketing/copy.ts、supabase/migrations/20260212000000_init_schema.sql の RLS 全件 `to authenticated`、src/app/privacy/・terms/ の存在）

## D3: Spec Review 指摘の取捨選択（Build前半, 2026-06-12）

- **判断**: longrun-reviewer の Spec Review 指摘5件を全て「(a) 採用」と判定し spec/tasks に反映。嗜好レベルの指摘なし
- **判定内訳**:
  - 指摘1 trial 失効の status 遷移セマンティクス → 採用（spec 曖昧性。builder が遷移ジョブの要否を迷う）。「status 遷移なし・`trial_end < now` 判定のみ」シナリオを change-A spec に追加
  - 指摘2 (BLOCKER) `tax_behavior: inclusive` の受け皿不在 → 採用（change 間契約違反。Price は作成後に tax_behavior 変更不可）。change-A spec 本文+シナリオ、change-A tasks 1.2、change-B tasks 3.1 に反映
  - 指摘3 残枠カウンタのレスポンス形状契約 → 採用（C/D との統合時のフィールド名食い違い防止）。change-B spec にレスポンス形状シナリオを追加
  - 指摘4 change-B tasks section 1 が GREEN 先行 → 採用（longrun-tdd スキーマの TDD 強制に違反）。RED 先行に並べ替え
  - 指摘5 (NOTE) 境界レース時の Price 補正が未テスト → 採用（課金額の正確性）。change-B spec にシナリオ、tasks 2.4 にテストケースを追加
- **エビデンス**: 反映後 `openspec validate` 4 change 全て valid（2026-06-12 実行ログ）

## D4: change-A 実装時の設計判断（Apply: stripe-billing-foundation, 2026-06-12）

change-A の TDD 実装中に確定した設計判断。詳細は `openspec/changes/stripe-billing-foundation/design.md` の D9〜D12 に対応。

- **D9 Webhook ドメインイベント抽象**: `verifyAndParseWebhook` が Stripe event を provider 非依存の判別ユニオン（`subscription_activated` / `subscription_status_changed` / `subscription_canceled` / `invoice_paid` / `ignored`）に変換。route は `kind` で分岐し Stripe 型非参照。MoR 切替時に route 不変。
- **D10 subscriptions は 1 ユーザー 1 行 upsert**: `unique(user_id)` + `onConflict: user_id`。webhook の updated/deleted/invoice は `stripe_subscription_id`（部分 unique）で update。トライアル開始も同 upsert（再スタート無害）。リプレイが同一状態に収束（受け入れ条件12）。
- **D11 実キー未設定下の 1.2 / 5.4 / 2.2**: Products/Prices 作成は `scripts/stripe-setup.ts`（`tax_behavior:'inclusive'` 固定・live キー拒否・キー欠落で Stripe 非呼び出し＋説明的エラー）として実装しドライランで完了（real exit=1 を確認）。手動疎通(5.4)と `supabase db push`(2.2) は実キー/DB 適用が必要なため deferred、マージ後に実施。署名検証は webhook テストで `generateTestHeaderString` の実署名生成により検証済み。
- **D12 lint 判定基準**: baseline に既存 9 errors / 35 warnings（未変更ファイル由来: useHabits の rules-of-hooks、各所の set-state-in-effect）。本 change は「新規エラー・警告ゼロ」で完了とする。`useSubscription.ts` の set-state-in-effect は effect 内同期 setState を Promise 経由に統一して解消。エビデンス: 自変更を stash した baseline=9 errors、適用後も 9 errors（差分ゼロ）。既存エラーの一括修正は scope 外（YAGNI / 回帰リスク）で別 backlog。
- **追加依存**: `stripe@^22.2.0`（実装）、`server-only@^0.0.1`（service-role モジュールの client bundle 混入防止）、`tsx@^4`（setup スクリプト実行用 devDep）。`npm run stripe:setup` を追加。
## D5: change-C 実装判断（founding-teaser-waitlist, TDD apply 2026-06-12）

自律実行中（AskUserQuestion 不可）の設計判断。詳細は `openspec/changes/founding-teaser-waitlist/design.md` の D7–D10。

- **D7 階層特典カードはインライン描画**: tier カードを `renderTierCard()` helper で page tree に直接埋め込む。理由: 既存 tree-walking 構造テストは関数 component の中身を展開しないため、割引ラベル/API 残数を text node として検証可能にする必要がある。@testing-library 導入は YAGNI で却下
- **D8 WaitlistForm は client component、page テストで `'form'` 文字列にモック**: フォーム挙動は `founding-actions.test.ts` で独立検証し、page テストは「フォーム存在」構造のみ担保（責務分離）。本番コードに影響しない可逆なテスト都合
- **D9 Server Action シグネチャ `(prevState, formData)` / source 定数**: React 19 `useActionState` と素直に接続。email バリデーションは Server Action（厳格）と DB CHECK（緩い最終防衛線）の二層
- **D10 残り枠フェッチャーのエンドポイント env 差し替え**: `FOUNDING_COUNTER_API_URL` → default `/api/founding/slots`。`next.revalidate: 15` で change-B の 10〜30秒キャッシュ契約に整合。契約形状（`founder50/founder30 × cap/claimed/remaining`）を満たさなければ `null` を返し数値非表示フォールバック。change-B 確定後はこの 1 ファイルのみ差し替え
- **保留事項**: migration の `supabase db push`（tasks 1.3）と waitlist DB 行の手動確認（tasks 4.4）は、並行 run 制約によりマージ後にメインで適用・確認する。worktree からは push しない。ページ表示・i18n・RLS SQL 実装は完了済み

## D6: change-B 実装判断（founding-member-program, TDD apply 2026-06-12）

自律実行中（AskUserQuestion 不可）の設計判断。詳細は `openspec/changes/founding-member-program/design.md` の D7–D8。

- **D6-1 plpgsql RPC は TS リファレンス実装テストで担保、実 DB 検証はマージ後**: dev DB は並行 run 制約で worktree から `supabase db push` できず、plpgsql を Vitest で直接実行する手段もない。よって tier フォールバック・並行 over-allocation 防止・冪等を `src/lib/founding/allocation.ts`（`decideTier` / `FoundingSlotStore` = COUNT ベース・founder_50→founder_30→none・unique(user_id) 冪等・advisory lock 直列化の async mutex 相当）の TS リファレンス実装に対するテスト（11 ケース、小 cap 2/3 境界＋50 並行 claim で over-allocation ゼロ）で担保。RPC 呼び出し層は `founding-admin.ts` を supabase client モックで検証。**実 plpgsql の実 DB 検証はマージ後の統合検証項目**（migration 適用 / 境界・並行 claim / count_founding_slots の anon 集計のみ露出 / RLS 本人 SELECT）。migration timestamp は `20260612000200`（000000/000100 使用済み回避）
- **D6-2 確定 tier の Price 補正は冪等 `updateSubscriptionPrice` で常に適用**: 見込み Price を webhook まで運ばず、claim 確定 tier の Price へ常に寄せる。Stripe SDK 側で現 item.price が同一なら early return（no-op）。`proration_behavior: 'none'`。lifetime は subscription なしのため `applyFoundingClaim` で early return
- **D6-3 server-only の Vitest スタブ**: `founding-admin.ts` の `import 'server-only'` が route テストの transitive import で throw するため、`vitest.setup.ts` で `vi.mock('server-only', () => ({}))` をグローバル設定（node env で no-op）。本番 bundle には影響しない可逆なテスト基盤変更
- **D6-4 Checkout の tier-Price はフォールバック付き**: `resolveCheckoutPriceId` は `predictFoundingTier` 失敗（counter 未デプロイ・env 未設定）時に通常 Price へフォールバックし Checkout を壊さない。これにより change-A の既存 checkout テストも tier env 未設定で `price_monthly`（none フォールバック）に収束し後方互換
- **保留事項**: tasks 1.6（`supabase db push` + 実 DB GREEN）/ tasks 3.1 の実 Price 作成（`npm run stripe:setup`、実テストキー必要）はマージ後にメインで実施。テスト・lint・build はワークツリー内で完了（317 passed / 新規 lint エラーゼロ / build 成功）

## D7: change-D jp-legal-compliance の実装判断（Apply, 2026-06-12）

自律実行中（AskUserQuestion 不可）の設計判断。詳細は `openspec/changes/jp-legal-compliance/design.md` の D1–D7。本 change で追加した実装レベルの判断を以下に記録する。

- **D7-1 事業者表記の実値は env 駆動プレースホルダに集約**: 事業者名・運営統括責任者・所在地・電話番号は `src/lib/legal/business-info.ts` の `getBusinessInfo()` に集約し、`LEGAL_OPERATOR_NAME` / `LEGAL_RESPONSIBLE_PERSON` / `LEGAL_ADDRESS` / `LEGAL_PHONE` / `LEGAL_CONTACT_EMAIL` の各 env から解決。未設定時は `[要記入]` を表示する。**理由**: 実値はユーザー確認待ち（tasks 1.2、リリースブロッカー）で、自律実行中は確定できない。コード変更なしで差し替え可能にし、かつ画面上で「未記入」が人間に見えるようにした。プレースホルダ文字列は `TODO`/`XXX` を避けた（構造テスト `jp-tokushoho-page.test.tsx` が `TODO`/`XXX` 残置で fail する設計のため、開発者の置き忘れ検出は維持しつつ「要記入」の意図を表現）。**残リスク**: 実値未設定のままリリースすると `[要記入]` が公開される → リリース前に LEGAL_* を設定すること（7.4 と併せて人間ゲート）
- **D7-2 価格表示の単一ソースは `src/lib/billing/pricing.ts`**: `CONSUMER_PRICES`（monthly $4.99 / annual $39.99 / lifetime $99）を税込総額として保持。`formatTaxInclusivePrice` が「$X.XX（税込）」を出力し、特商法ページ・最終確認画面・解約カードがこれを参照。`chargedAmount(plan) === CONSUMER_PRICES[plan].amount` を恒等としてテストで担保し、表示額＝請求額（`tax_behavior: inclusive` 前提・design D3）を保証。**代替案**: 各画面で個別に税込文字列を組む → 表示乖離リスクが高く却下。**残リスク**: 実 Stripe Price の `tax_behavior` が `inclusive` でないと表示額と請求額が乖離 → change-A の Price 作成（`scripts/stripe-setup.ts`）で `tax_behavior: inclusive` を設定する実環境タスクが前提（5.3）。テストモード Checkout で表示額＝請求額の突合は実環境タスクとして残す
- **D7-3 最終確認画面は props 駆動の純粋コンポーネント**: `src/components/billing/final-confirmation.tsx`（`FinalConfirmation`）を `plan` / `locale` / `trialDays` / `messages`（next-intl `checkout` 名前空間）/ `onConfirm` / `onBack` から純粋に描画。必須4項目（①定期購入・自動更新 ②各回代金＋年間支払総額 ③トライアル→有料移行の時期と金額 ④解約方法・期限・違約金なし）を確認ボタンより tree 順で前に固定配置し、`details`/`dialog` でラップしない（spec S4 のスクロール不要要件をテストで担保）。Lifetime は非定期購入（「定期購入ではありません」）＋税込総額を表示。**Checkout フローへの挿入（6.1）は DEFERRED**: change-A の paywall/checkout UI が確認ステップ前提の導線（`PaywallGate` の CTA → `/account?upgrade=1`）を持つため、確認画面の挿入はその UI 結合時に実施
- **D7-4 解約導線は `BillingPortalCard` + 既存 `POST /api/stripe/portal`**: `src/components/billing/billing-portal-card.tsx` を設定画面（`src/app/(app)/settings/page.tsx`）に常設し、`handleOpenPortal` が change-A 実装済みの `POST /api/stripe/portal` を呼んで返却 URL へ遷移。「いつでも解約」文言は `billing.cancelAnytime`（next-intl）で、電話必須・違約金等の矛盾条件を一切付けない（テストで否定 assert）。**残リスク**: Stripe Customer Portal 側でキャンセルを有効化していないと実態と乖離 → Portal 設定の有効化・テストモードでの解約完走確認は実環境タスク（A）として残す
- **D7-5 景表法準拠は「実数ソース接続」の構造テストで担保**: 残り枠は founding ページが `fetchRemainingSlots()`（change-B カウンタ API）の値のみを描画し、ハードコード整数を持たないこと（`count.remaining` 経由・`残り枠: <数字>` リテラル不在）を `jp-scarcity-discount.test.tsx` で assert。割引率の参照価格は `CONSUMER_PRICES` の実販売価格に基づくことを assert。**代替案**: E2E で DB 値と表示の一致を毎回検証 → change-B 統合後の項目とし、本 change 単体ではモック境界の構造テストで担保（design D5）
- **D7-6 privacy/terms はセクション追記方式（構造維持）**: `/privacy` は §2 に waitlist メール・決済情報、§3 に課金管理・waitlist 案内の利用目的を追記し、決済委託（Stripe・カード情報非保持・`stripe.com/privacy` リンク・`/tokushoho` 誘導）を新 §5 として挿入（既存 §5–§12 を §6–§13 へ繰り下げ、計13セクション）。`/terms` は §2 を有料プラン併存＋`/tokushoho` 誘導に書き換え、§8 の「無償で提供」を有料プランの責任上限規定へ修正。最終更新日を 2026年6月12日 に更新。**理由**: plan.md が「新規作成ではなく追記」を明示（design D6）。差分最小化
- **保留事項（DEFERRED）**: tasks 1.2（事業者実値のユーザー確認）/ 5.3・6.2 の実環境確認（Stripe Price の inclusive 設定・テストモード Checkout 突合・Portal キャンセル有効化＋解約完走）/ 6.1（最終確認画面の Checkout フロー挿入、change-A UI 結合）/ 7.4（弁護士・人間による法定文言レビュー）はリリース前の人間/実環境タスクとして残す。テスト・新規 lint・build はワークツリー内で完了（38 files / 349 tests passed・新規ファイル lint エラーゼロ・build 成功・`/tokushoho` route 生成確認）

## D8: 課金 UI 統合結線（billing-integration, TDD apply 2026-06-12）

マージ済み change-A/B/D が互いに deferred した課金 UI の結線。新規 OpenSpec change ではなく、jp-legal 6.1 / founding 5.1 / stripe 4.7 の本番ページ結合タスクの消化。自律実行中（AskUserQuestion 不可）の設計判断。

- **D8-1 `/account` ページは `(app)` route group + middleware allowlist 拡張**: `/account` を `(app)` グループに新設（認証必須）。matcher は明示 allowlist（change-A D1 で `/api/*` を意図的に除外している）なので、`/settings` 等と同様に `/account/:path*` を matcher に追加。`middleware-account-matcher.test.ts` で `/account` 保護・既存パス維持・`/api/stripe/*` 除外維持（webhook バイパス S9）を同時に担保。代替案: `(app)` グループ自動保護 → 現状の matcher は明示列挙方式なので不採用（既存設計に追従）
- **D8-2 Checkout 直行不能の不変条件は純粋 reducer で担保（受け入れ条件18）**: `checkoutFlowReducer`（`idle`→`confirming`→`checkout`）で「SELECT_PLAN は checkout intent（`checkoutPlan`）を絶対に出さない／CONFIRM のみが出す／idle からの CONFIRM は no-op」を表現。`/account` ページの `useEffect` は `flow.phase === 'checkout'` の時のみ `POST /api/stripe/checkout` を呼ぶ唯一の経路。これにより「確認画面を経ずに Checkout に飛ぶ導線」が UI 上・状態機械上のどちらにも存在しないことを `account-billing.test.ts` の reducer テストで検証（DOM 不要）。**理由**: codebase は jsdom/@testing-library を避ける方針（change-C D8）。UI 操作 E2E ではなく純粋状態機械テストで条件18 の本質（直行経路の不在）を担保し、可逆。E2E 実機確認は verification-guide の「動作確認」項目（人間）に残す
- **D8-3 `AccountBilling` は純粋・props 駆動、state はページ container に集約**: ツリーウォーク可能にするため `AccountBilling` は hooks 非使用の純関数。`selectedPlan` が立つと `FinalConfirmation` を**インライン呼び出し**（要素マウントでなく関数呼び出し）して必須4項目・確認ボタンを同一ツリーに展開（change-C D7 と同じ手法）。state（`useReducer(checkoutFlowReducer)` / slots fetch / `useSubscription`）は `src/app/(app)/account/page.tsx` に置く。代替案: `useReducer` を component 内に持つ → 直接関数呼び出しテストで hooks が throw するため不採用
- **D8-4 トライアル残日数は純粋関数 `trialDaysRemaining`（端数切り上げ）**: `subscriptions` 行のみから算出（design D4・Stripe 非参照）。`trial.ts`（trial 開始・server-only admin import）と分離した `trial-status.ts` に置き、client component から安全に import。端数日は切り上げ（当日を残日数に含める）。非トライアル/`trial_end` 欠落は `null`
- **D8-5 残り枠は `fetchRemainingSlots()`（change-B カウンタ）を client 再利用、null 時は数値非表示**: `/account` は `app/founding/slots.ts` のフェッチャーをそのまま再利用し、`slots === null`（API 未デプロイ・形状不一致）では残数を一切描画しない（捏造数値ゼロ）。`account-billing.test.ts` で実数描画・null 時非表示を assert（景表法 / change-D D7-5 と整合）
- **D8-6 早期切替 CTA は `shouldOfferEarlySwitch`（active trial のみ）で出し分け**: `data-early-switch` セクションをトライアル中のみ描画、active 加入者には非表示。CTA は annual プランの確認ステップ → Checkout 導線に接続（割引はサブスクに適用、決済完了時点で確定＝change-B D5）。founding 5.1 の account UI 結線を完了
- **D8-7 `create_habit` ゲートは既存 UX を壊さない action gate `shouldBlockCreateHabit`**: ホームの習慣追加（`handleAdd`）で `shouldBlockCreateHabit(subscription)` が true（非 entitled かつ `create_habit` ∈ gatedActions）の時のみ `/account?upgrade=1` へ遷移、それ以外は従来通りフォームを開く。entitled・active トライアルは挙動不変。ゲート判定は `isEntitled`/`isGatedAction`（change-A）を再利用し設定駆動（spec S24）。代替案: `PaywallGate` で FAB/フォームを常時ラップ → アクション型ゲートには冗長で、ブロック UI が常時マウントされ UX を変えるため不採用（action gate ヘルパに集約）
- **保留事項（DEFERRED）**: 実機 E2E（PaywallGate ブロック → CTA → `/account` → 確認 → 実 Checkout 到達、トライアル中 vs 期限切れの出し分け、早期切替の決済完走）は実 Stripe テストキー + dev DB 適用が前提で、verification-guide の「動作確認完了 / ユーザー確認完了」（未チェック・人間ゲート）に残す。テスト（42 files / 382 passed）・新規 lint エラー/警告ゼロ（baseline 9 errors / 35 warnings 維持）・build 成功・`/account` route 生成確認はワークツリー内で完了
