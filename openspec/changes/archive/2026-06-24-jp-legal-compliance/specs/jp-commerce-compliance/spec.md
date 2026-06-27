# jp-commerce-compliance

## ADDED Requirements

### Requirement: Tokushoho disclosure page exists with all mandatory items

The system SHALL serve a 特定商取引法に基づく表記 page that lists all items required by the Specified Commercial Transactions Act: 事業者名（販売業者）、所在地、連絡先（メールアドレス等）、販売価格（税込）、商品代金以外の必要料金、支払方法、支払時期、役務（サービス）の提供時期、返品・解約に関する事項。

#### Scenario: Tokushoho page renders mandatory items

- **WHEN** the 特定商取引法に基づく表記 page is rendered
- **THEN** the page MUST contain section labels and values for: 事業者名（販売業者）、所在地、連絡先、販売価格、支払方法、支払時期、役務の提供時期、返品・解約に関する事項
- **AND** a Vitest structural test MUST assert the presence of each mandatory section label

#### Scenario: Tokushoho page is reachable from pages that display prices

- **WHEN** a page that displays subscription or Lifetime prices (LP footer, teaser, paywall, account/billing screen) is rendered
- **THEN** the page MUST contain a link to the 特定商取引法に基づく表記 page

### Requirement: Final confirmation screen displays the four mandatory items before Checkout

The system SHALL display a final confirmation screen immediately before redirecting the user to Stripe Checkout. The screen MUST clearly present, in a position visible at a glance without scrolling (改正特商法 第12条の6): ① 定期購入（自動更新）である旨 ② 各回の代金および一定期間（例: 年間）の支払総額 ③ トライアルから有料への移行時期とその時点で請求される金額 ④ 解約の方法・期限・違約金の有無。The presence of all four items SHALL be verified by automated tests.

#### Scenario: Four mandatory items are present and test-verified

- **WHEN** the final confirmation screen is rendered for a subscription plan (monthly or annual)
- **THEN** the screen MUST contain text stating that the purchase is a 定期購入 with 自動更新
- **AND** the screen MUST contain the per-billing-cycle price and the total amount payable over the stated period (税込)
- **AND** the screen MUST contain the date (or rule) when the free trial converts to a paid plan and the amount charged at that point
- **AND** the screen MUST contain the cancellation method, deadline, and a statement that no cancellation penalty (違約金) applies
- **AND** a Vitest test MUST assert the existence of all four items

#### Scenario: Mandatory items are visible without scrolling

- **WHEN** the final confirmation screen is rendered
- **THEN** the four mandatory items MUST be placed above (or adjacent to) the purchase confirmation button, not behind accordions, modals, tabs, or below-the-fold placement that requires scrolling on a standard viewport

#### Scenario: Lifetime (one-time) purchase shows non-recurring terms

- **WHEN** the final confirmation screen is rendered for the Lifetime plan
- **THEN** the screen MUST state that the purchase is a one-time payment (定期購入ではない旨) with the total tax-inclusive price

### Requirement: All consumer-facing prices are displayed as tax-inclusive totals

The system SHALL display all prices shown to consumers (LP, teaser, paywall, final confirmation screen, account/billing screen, 特商法表記ページ) as tax-inclusive total amounts (総額表示) in accordance with the Consumption Tax Act. Stripe Prices SHALL be configured as tax-inclusive (or processed as tax-inclusive via Stripe Tax) so that the displayed amount equals the charged amount.

#### Scenario: Displayed price is tax-inclusive and matches the charged amount

- **WHEN** a price is displayed on any consumer-facing surface
- **THEN** the displayed amount MUST be the tax-inclusive total with a 税込 indication
- **AND** the amount charged at Stripe Checkout MUST equal the displayed tax-inclusive amount

### Requirement: Cancellation path matches the "cancel anytime" claim

The system SHALL provide an easy cancellation path via the Stripe Customer Portal, reachable from the account/billing screen, such that the「いつでも解約できます」claim matches reality (no retention walls, no required contact with support to cancel).

#### Scenario: User can reach cancellation from the billing screen

- **WHEN** a subscribed user opens the account/billing screen
- **THEN** the screen MUST contain a link/button to the Stripe Customer Portal where the subscription can be canceled
- **AND** any「いつでも解約」表示 MUST NOT be accompanied by extra conditions that contradict it

### Requirement: Scarcity and discount claims are based on real data

The system SHALL ensure that「残り枠 N」displays use the real remaining-slot count from the change-B counter API, and that「○%OFF」displays reference the real regular price actually charged to non-discounted users (景品表示法: 有利誤認・おとり広告の排除). Fabricated countdowns, fake stock counts, and fictitious reference prices are prohibited.

#### Scenario: Remaining slots reflect the real counter

- **WHEN** a remaining-slots figure（残り枠 N）is rendered on the teaser or paywall
- **THEN** the figure MUST originate from the change-B counter API (real DB count), not a hardcoded or fabricated value
- **AND** a test MUST verify the rendered figure is sourced from the counter, not a literal

#### Scenario: Discount percentage references the real regular price

- **WHEN** a「○%OFF」label is rendered
- **THEN** the referenced regular price MUST be the actual price charged to non-discounted users (月額 / 年額 / Lifetime の実販売価格)
- **AND** no expired or never-used reference price may be shown

### Requirement: Privacy policy and terms cover payment data and waitlist email collection

The system SHALL update the existing `/privacy` page (`src/app/privacy/page.tsx`) to add clauses covering: waitlist でのメールアドレス取得と利用目的、課金に伴う Stripe への決済情報送信（第三者提供/委託）、Stripe のプライバシーポリシーへの参照. The system SHALL update the existing `/terms` page (`src/app/terms/page.tsx`) so that statements about the service being free of charge are replaced with the paid-plan reality (料金・トライアル・解約条件への言及). New pages SHALL NOT be created for this purpose.

#### Scenario: Privacy page mentions waitlist email and Stripe payment data

- **WHEN** the `/privacy` page is rendered
- **THEN** the page MUST contain a clause about collecting email addresses via the waitlist and its purpose
- **AND** the page MUST contain a clause stating that payment processing is delegated to Stripe and what data is sent to Stripe
- **AND** the existing privacy page structure (sections 1-12) MUST be preserved with clauses added, not replaced by a new page

#### Scenario: Terms page no longer claims the service is free

- **WHEN** the `/terms` page is rendered after this change
- **THEN** the page MUST NOT state that the service is provided 無償 as its only mode
- **AND** the page MUST reference the existence of paid plans and point to the 特定商取引法に基づく表記 page for transaction terms
