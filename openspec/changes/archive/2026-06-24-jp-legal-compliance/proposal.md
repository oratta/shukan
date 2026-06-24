# Proposal: jp-legal-compliance

## Why

Smitch に Stripe 課金（サブスク + Lifetime、change-A）と Founding Member プログラム（change-B/C）を導入するにあたり、日本の消費者向けに決済機能を提供するには改正特定商取引法・消費税法（総額表示義務）・景品表示法・個人情報保護法への準拠が法令上必須となる。Stripe はこれらの日本法対応を自動では行わないため、表記ページ・最終確認画面・税込表示・解約導線・広告表示の各要件を自前で実装する必要がある。ブランドの「うさんくさくない」とも完全に一致する変更であり、課金公開前に揃っていなければならない。

## What Changes

- **新規追加**: 特定商取引法に基づく表記ページ（事業者名・所在地・連絡先・販売価格・支払方法/時期・役務提供時期・返品/解約に関する事項等を網羅）
- **新規追加**: 改正特商法準拠の最終確認画面（Stripe Checkout へのリダイレクト直前）。①定期購入（自動更新）である旨 ②各回代金＋一定期間の支払総額 ③トライアル→有料移行の時期と金額 ④解約方法・期限・違約金の有無、の必須4項目をスクロール不要で一目で見える位置に明確表示。**必須4項目はテストで存在を検証する**
- **新規追加**: 総額表示（税込）対応。消費税法に基づき、ユーザー向け価格表示はすべて税込総額とする（Stripe Price は税込設定 or Stripe Tax の内税処理）
- **新規追加**: 解約導線の整備。Customer Portal で簡単に解約でき、「いつでも解約」の表示と実態を一致させる
- **新規追加**: 景表法準拠の表示検証。「残り枠 N」「○%OFF」が change-B の実数・実参照価格に基づくこと（有利誤認・おとり広告の排除）をテストで担保
- **更新**: 既存 `/privacy`（`src/app/privacy/page.tsx`）に waitlist メール取得・課金（Stripe への決済情報送信）に関する条項を追記（新規ページは作らない）
- **更新**: 既存 `/terms`（`src/app/terms/page.tsx`）の「本サービスは現在、無償で提供されています」等の記述を有料プラン導入後の実態に合わせて更新

## Capabilities

### New Capabilities
- `jp-commerce-compliance`: 日本の消費者向け決済に必要な法令準拠表示能力（特商法表記・最終確認画面・税込総額表示・解約導線・景表法準拠表示・プライバシーポリシー/利用規約の課金対応追記）

### Modified Capabilities
- なし（`/privacy` `/terms` はページとしては既存だが、既存 spec が存在しないため本 change の新 capability 内で要件化する）

## Impact

- **影響コード（新規）**: 特商法表記ページ（`src/app/tokushoho/page.tsx` 想定）、最終確認画面コンポーネント（change-A の Checkout フロー直前に挿入）、対応する Vitest テスト
- **影響コード（更新）**: `src/app/privacy/page.tsx`（収集情報・第三者提供に Stripe 決済情報と waitlist メールを追記）、`src/app/terms/page.tsx`（有料プラン・解約条件の記述更新）、LP/ティザー/paywall の価格表示箇所（税込表記）
- **依存関係**: 最終確認画面は change-A `stripe-billing-foundation`（Checkout フロー）に、残り枠/割引表示の検証は change-B `founding-member-program`（実数カウンタ）に表示面で依存。特商法表記ページと privacy/terms 追記は独立して着手可
- **外部システム**: Stripe Price 設定（税込 `tax_behavior` or Stripe Tax）、Stripe Customer Portal 設定（解約有効化）
