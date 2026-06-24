# Summary: monetization-foundation

## 概要
- **開始**: 2026-06-12 08:58（exec 開始）
- **Verify完了**: 2026-06-12 12:15
- **ゴール**: Smitch に Stripe 課金基盤 + Founding Member プログラム（ティザー/割引/waitlist）+ 日本法準拠を実装

## Changes（全て main ブランチにマージ済み）
| Change | 内容 | 主要成果物 |
|--------|------|-----------|
| change-A stripe-billing-foundation | Stripe課金基盤 | `src/lib/billing/`（薄いプロバイダ抽象）、`/api/stripe/{checkout,webhook,portal}`、`subscriptions` テーブル、14日カード不要トライアル、PaywallGate、`scripts/stripe-setup.ts` |
| change-B founding-member-program | Founding割引 | `founding_memberships` + `claim_founding_slot` RPC（advisory lock でアトミック枠確保）、tier別Price、公開カウンタ `/api/founding/slots`、早期切替ロジック |
| change-C founding-teaser-waitlist | ティザーLP+waitlist | `/founding` ページ（next-intl en/ja、ダークパターンなし）、`waitlist` テーブル（anon insert-only RLS） |
| change-D jp-legal-compliance | 日本法準拠 | `/tokushoho` 特商法表記、FinalConfirmation（必須4項目）、税込総額表示 `pricing.ts`、privacy/terms 追記 |
| 統合結線 billing-integration | UI統合 | `/account` ページ（プラン選択→確認画面→Checkout、早期切替CTA）、PaywallGate を習慣作成導線に結線 |

## テスト結果
- **386 passed / 43 files**（ベースライン 197 → +189。実DB統合テスト1本含む）
- build 成功 / lint ベースライン維持（既存 9 errors / 36 warnings）

## 4軸評価
| 軸 | スコア | しきい値 | 判定 |
|----|-------|---------|------|
| 品質 | 100% | 100% | ✅ |
| 完成度 | 100% | 80% | ✅ |
| 機能性 | 100%（検証可能 26/26） | 100% | ✅ |
| UX | 100% | 70% | ✅ |

## 意思決定（decisions.md、D1〜D10）
- D1: Stripe スキル不在 → Context7 代替
- D2/D3: レビュー指摘の全採用（middleware整合・tax_behavior inclusive・RLS設計ほか）
- D4〜D8: 各 change の実装判断（Webhook ドメインイベント抽象、1user1行upsert、plpgsql↔TSリファレンス実装、insert+23505 等）
- D9: past_due は即ブロックで仕様確定
- D10: waitlist の upsert→insert+23505（RLS×ON CONFLICT の実バグ修正）

## Verify中に検出・修正したバグ
1. portal route の POST シグネチャ不一致（tsc TS2554）→ b70055c
2. **waitlist 登録が全件失敗**（upsert の ON CONFLICT が anon SELECT 権限を要求）→ c444fcc。ブラウザ実操作で解消確認

## リリース前に必要な人間/実環境ゲート（残課題）
1. **Stripe テストキー投入** → `.env.local` に `STRIPE_SECRET_KEY` 等 → `npm run stripe:setup` で Products/Prices 実作成（tax_behavior: inclusive）→ Price ID を env へ
2. **Vercel/本番 env 設定**: `SUPABASE_SERVICE_ROLE_KEY`（未設定だと slots API 503）、`NEXT_PUBLIC_APP_URL`（未設定だと枠数ライブ表示が出ない）
3. **`LEGAL_*` 事業者実値**（未設定だと特商法ページに [要記入] が公開される。リリースブロッカー）
4. 法定文言の弁護士レビュー
5. 実 Stripe での E2E（Checkout 完走・Webhook 実疎通・枠確保境界の実DB検証）
