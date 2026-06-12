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
