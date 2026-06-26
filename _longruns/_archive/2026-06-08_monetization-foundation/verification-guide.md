# Verification Guide

## 環境
- URL: http://localhost:3000（競合時は 3001+）
- 起動: `npm run dev`
- テスト: `npm run test:run`（Vitest）/ `npx playwright test`（E2E）
- Stripe: テストモードキー。Webhook は `stripe listen --forward-to localhost:3000/api/stripe/webhook`


## change-A: stripe-billing-foundation

### S1: Prices are tax-inclusive
- Requirement: Stripe products and prices are defined in test mode with env-injected IDs
  - **WHEN** any Product Price used by the application (monthly / annual / lifetime) is inspected in Stripe
  - **THEN** its `tax_behavior` MUST be `inclusive`, and the amount charged at Checkout MUST equal the displayed tax-inclusive amount
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S2: Price IDs resolved from environment
- Requirement: Stripe products and prices are defined in test mode with env-injected IDs
  - **WHEN** the billing module resolves the price for plan `monthly`, `annual`, or `lifetime`
  - **THEN** it MUST return the Stripe Price ID from the corresponding environment variable, and MUST throw a descriptive configuration error if the variable is missing
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S3: No hardcoded secrets in source
- Requirement: Stripe products and prices are defined in test mode with env-injected IDs
  - **WHEN** the source tree is scanned for Stripe live/test secret key patterns (`sk_live_`, `sk_test_`, `whsec_`)
  - **THEN** no match MUST exist outside of `.env*` files and documentation examples
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S4: Authenticated user receives Checkout URL
- Requirement: Authenticated Checkout session creation
  - **WHEN** an authenticated user POSTs to `/api/stripe/checkout` with a valid plan (`monthly` / `annual` / `lifetime`)
  - **THEN** the handler MUST create a Checkout session tied to the user's Stripe Customer (with `user_id` carried in metadata or `client_reference_id`) and respond with the session URL
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S5: Unauthenticated request is rejected
- Requirement: Authenticated Checkout session creation
  - **WHEN** a request without a valid Supabase session POSTs to `/api/stripe/checkout`
  - **THEN** the handler MUST respond with HTTP 401 and MUST NOT call the Stripe API
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S6: Invalid plan is rejected
- Requirement: Authenticated Checkout session creation
  - **WHEN** an authenticated user POSTs to `/api/stripe/checkout` with an unknown plan value
  - **THEN** the handler MUST respond with HTTP 400 and MUST NOT create a Checkout session
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S7: Valid signature is processed
- Requirement: Webhook endpoint with mandatory signature verification
  - **WHEN** a webhook request arrives with a signature correctly computed from the raw body and `STRIPE_WEBHOOK_SECRET`
  - **THEN** the handler MUST construct the event, dispatch it to the corresponding event handler, and respond with HTTP 200
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S8: Invalid signature is rejected
- Requirement: Webhook endpoint with mandatory signature verification
  - **WHEN** a webhook request arrives with a missing or invalid `stripe-signature` header
  - **THEN** the handler MUST respond with HTTP 400 and MUST NOT read or write the `subscriptions` table
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S9: Webhook bypasses auth middleware
- Requirement: Webhook endpoint with mandatory signature verification
  - **WHEN** the middleware `config.matcher` in `src/middleware.ts` is inspected
  - **THEN** it MUST NOT include `/api/stripe/:path*` or any pattern matching `/api/stripe/webhook`, so unauthenticated Stripe servers can reach the endpoint
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S10: Duplicate event is acknowledged without side effects
- Requirement: Webhook events are processed idempotently
  - **WHEN** the same `checkout.session.completed` event (same Stripe event ID) is delivered twice
  - **THEN** the second delivery MUST respond with HTTP 200 and the `subscriptions` row MUST be identical to the state after the first delivery
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S11: Unhandled event types are acknowledged
- Requirement: Webhook events are processed idempotently
  - **WHEN** a verified webhook event of a type outside the handled set is delivered
  - **THEN** the handler MUST respond with HTTP 200 without modifying the `subscriptions` table
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S12: RLS restricts reads to own row
- Requirement: Subscriptions table is the source of truth for billing state
  - **WHEN** an authenticated user queries the `subscriptions` table with the anon/authenticated role
  - **THEN** only the row where `user_id` equals the requesting user's ID MUST be returned, and rows of other users MUST NOT be readable
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S13: checkout.session.completed activates subscription
- Requirement: Subscriptions table is the source of truth for billing state
  - **WHEN** a verified `checkout.session.completed` event for a subscription-mode session is processed
  - **THEN** the user's `subscriptions` row MUST be upserted with `status: active`, the resolved `plan`, `stripe_customer_id`, `stripe_subscription_id`, and `current_period_end`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S14: customer.subscription.updated syncs status fields
- Requirement: Subscriptions table is the source of truth for billing state
  - **WHEN** a verified `customer.subscription.updated` event is processed
  - **THEN** the matching `subscriptions` row (by `stripe_subscription_id`) MUST be updated with the event's `status`, `current_period_end`, and `cancel_at_period_end`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S15: customer.subscription.deleted marks subscription canceled
- Requirement: Subscriptions table is the source of truth for billing state
  - **WHEN** a verified `customer.subscription.deleted` event is processed
  - **THEN** the matching `subscriptions` row MUST be updated to `status: canceled`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S16: invoice.paid refreshes period end
- Requirement: Subscriptions table is the source of truth for billing state
  - **WHEN** a verified `invoice.paid` event for a subscription renewal is processed
  - **THEN** the matching `subscriptions` row MUST reflect `status: active` and the new `current_period_end`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S17: Lifetime checkout completion grants permanent entitlement
- Requirement: Lifetime purchase grants permanent access
  - **WHEN** a verified `checkout.session.completed` event for a payment-mode (lifetime) session is processed
  - **THEN** the user's `subscriptions` row MUST be upserted with `plan: lifetime` and `status: active`, and the paywall MUST treat the user as entitled regardless of `current_period_end` or trial state
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S18: Trial starts without card
- Requirement: Card-free 14-day trial managed in subscriptions
  - **WHEN** a user starts the trial
  - **THEN** a `subscriptions` row MUST be created with `status: trialing` and `trial_end` = start time + configured trial days, without any Stripe API call requiring payment details
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S19: Gated actions available during trial
- Requirement: Card-free 14-day trial managed in subscriptions
  - **WHEN** a user with `status: trialing` and `trial_end` in the future performs a gated action
  - **THEN** the action MUST be allowed without any paywall block
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S20: Trial length is configurable
- Requirement: Card-free 14-day trial managed in subscriptions
  - **WHEN** the trial-days configuration value is set to a non-default value (e.g., 3 for tests)
  - **THEN** newly started trials MUST compute `trial_end` from that value without code changes
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S21: Trial expiry requires no status transition
- Requirement: Card-free 14-day trial managed in subscriptions
  - **WHEN** a trial's `trial_end` passes without the user subscribing
  - **THEN** the `subscriptions` row MUST remain `status: trialing` (no background job or webhook transitions it), and entitlement MUST be evaluated purely from `trial_end < now`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S22: Expired trial blocks gated action
- Requirement: Paywall gate blocks gated actions after trial expiry
  - **WHEN** a user whose `trial_end` is in the past and who has no active or lifetime subscription attempts a gated action
  - **THEN** the paywall gate MUST block the action and display the upgrade prompt (with a CTA leading toward Checkout)
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S23: Active subscriber is never gated
- Requirement: Paywall gate blocks gated actions after trial expiry
  - **WHEN** a user with `status: active` (any plan) performs a gated action
  - **THEN** the action MUST proceed without the paywall appearing
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S24: Gate configuration is adjustable
- Requirement: Paywall gate blocks gated actions after trial expiry
  - **WHEN** the gated-action configuration (gated action set / limits) is changed via settings or environment values
  - **THEN** the paywall gate MUST honor the new configuration without modification to the gate component logic
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S25: Subscriber receives portal URL
- Requirement: Authenticated Customer Portal access
  - **WHEN** an authenticated user with a `stripe_customer_id` POSTs to `/api/stripe/portal`
  - **THEN** the handler MUST create a Customer Portal session for that customer and respond with the portal URL
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S26: Unauthenticated portal request is rejected
- Requirement: Authenticated Customer Portal access
  - **WHEN** a request without a valid Supabase session POSTs to `/api/stripe/portal`
  - **THEN** the handler MUST respond with HTTP 401 and MUST NOT call the Stripe API
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S27: User without billing history gets clear error
- Requirement: Authenticated Customer Portal access
  - **WHEN** an authenticated user with no `stripe_customer_id` POSTs to `/api/stripe/portal`
  - **THEN** the handler MUST respond with HTTP 400 (or equivalent client error) explaining no billing profile exists, instead of throwing an unhandled error
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S28: Callers do not import Stripe SDK directly
- Requirement: Payment provider access goes through a thin abstraction
  - **WHEN** application code outside `src/lib/billing/` (routes excluded only for raw-body signature plumbing) needs a checkout or portal session
  - **THEN** it MUST call the billing abstraction module rather than instantiating the Stripe SDK directly
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了


## change-B: founding-member-program

### S1: Membership row recorded on successful claim
- Requirement: Founding membership data model
  - **WHEN** a founding slot is successfully claimed for a user
  - **THEN** a `founding_memberships` row MUST exist with the user's `user_id`, the claimed `tier`, the matching `discount_pct`, the applied `stripe_price_id`, and a `claimed_at` timestamp, with `id` reflecting claim order
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S2: Duplicate claim by same user is rejected
- Requirement: Founding membership data model
  - **WHEN** a slot claim is attempted for a user who already has a `founding_memberships` row
  - **THEN** the claim MUST NOT create a second row, and the existing membership MUST remain unchanged
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S3: Slot claimed in founder_50 while capacity remains
- Requirement: Atomic tier allocation with fallback
  - **WHEN** a payment succeeds and the number of `founder_50` memberships is below the `founder_50` cap
  - **THEN** the claim MUST allocate a `founder_50` membership with `discount_pct = 50`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S4: Fallback to founder_30 when founder_50 cap reached
- Requirement: Atomic tier allocation with fallback
  - **WHEN** a payment succeeds and the `founder_50` cap is already reached but `founder_30` capacity remains
  - **THEN** the claim MUST allocate a `founder_30` membership with `discount_pct = 30`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S5: Fallback to regular pricing when all caps reached
- Requirement: Atomic tier allocation with fallback
  - **WHEN** a payment succeeds and both the `founder_50` and `founder_30` caps are reached
  - **THEN** no `founding_memberships` row MUST be created and the subscription MUST proceed at regular pricing (annual plan at the standard 20% off)
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S6: Concurrent claims do not over-allocate
- Requirement: Atomic tier allocation with fallback
  - **WHEN** multiple payment-success claims execute concurrently around a tier boundary
  - **THEN** the database MUST serialize the claims so the number of memberships in each tier never exceeds that tier's cap, with excess claims falling back to the next tier or regular pricing
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S7: Sign-up does not consume a slot
- Requirement: Slot claim occurs only on payment success
  - **WHEN** a new user signs up
  - **THEN** no `founding_memberships` row MUST be created and remaining-slot counts MUST be unchanged
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S8: Trial start does not consume a slot
- Requirement: Slot claim occurs only on payment success
  - **WHEN** a user starts the 14-day card-free trial
  - **THEN** no `founding_memberships` row MUST be created and remaining-slot counts MUST be unchanged
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S9: Payment-success webhook claims the slot
- Requirement: Slot claim occurs only on payment success
  - **WHEN** the Stripe webhook confirms a successful payment for a user without an existing membership
  - **THEN** the webhook handler MUST invoke the atomic slot-claim and record the resulting tier (if any) before completing webhook processing
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S10: Checkout charges tier-discounted price
- Requirement: Stripe discount applied per tier
  - **WHEN** a user with an available founding tier completes Checkout
  - **THEN** the Stripe subscription MUST use the Price (or Coupon) corresponding to that tier's discount percentage, and the membership row MUST store that `stripe_price_id`
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S11: Tier race at payment confirmation corrects the charged Price
- Requirement: Stripe discount applied per tier
  - **WHEN** a user starts Checkout while a tier (e.g., founder_50) appears available, but that tier's cap is exhausted by the time the payment-success webhook confirms the claim
  - **THEN** the claim MUST resolve to the actually-available tier (e.g., founder_30), the Stripe Subscription's Price MUST be updated to the confirmed tier's Price, and subsequent billing MUST use the corrected Price
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S12: Anonymous client fetches aggregate counts
- Requirement: Public remaining-slot counter API
  - **WHEN** an unauthenticated GET request is made to the remaining-slot counter endpoint
  - **THEN** the response MUST return aggregate remaining counts per tier derived from actual `founding_memberships` counts and the configured caps, and MUST NOT include any personal data
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S13: Counter response shape is the cross-change contract
- Requirement: Public remaining-slot counter API
  - **WHEN** any consumer (founding-teaser-waitlist's live slot display, jp-legal-compliance's 景表法 verification) reads the counter endpoint
  - **THEN** the response body MUST be a JSON object containing `founder50: { cap, claimed, remaining }` and `founder30: { cap, claimed, remaining }`, and consumers MUST read remaining counts from `founder50.remaining` / `founder30.remaining`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S14: Counter response is short-cached
- Requirement: Public remaining-slot counter API
  - **WHEN** the counter endpoint is requested repeatedly
  - **THEN** responses MUST be cached with a revalidation window between 10 and 30 seconds, after which a fresh count MUST be served
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S15: Counter reflects a consumed slot
- Requirement: Public remaining-slot counter API
  - **WHEN** a founding slot is claimed and the cache window has elapsed
  - **THEN** the counter endpoint MUST return a remaining count reduced accordingly
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S16: Trial user switches early and locks current tier
- Requirement: Early switch during trial locks the discount
  - **WHEN** a user in an active trial completes the early-switch Checkout and the payment succeeds
  - **THEN** the slot-claim MUST run with the tier availability at payment time, and the resulting discount MUST be recorded as the user's permanent founding discount
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S17: Renewal keeps the permanent discount
- Requirement: Founding discount is grandfathered across renewals
  - **WHEN** a founding member's subscription renews and the renewal webhook event is processed
  - **THEN** the subscription MUST continue to be billed at the tier-discounted price and the `founding_memberships` row MUST remain unchanged
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S18: Boundary behavior verified with small caps
- Requirement: Tier caps are configurable
  - **WHEN** the caps are configured to small test values (e.g., 2 and 3) and claims are executed past each boundary
  - **THEN** the allocation MUST fall back exactly at the configured caps, demonstrating the same boundary behavior as the production values (50 / 200)
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了


## change-C: founding-teaser-waitlist

### S1: All five sections are present
- Requirement: Founding teaser page renders the program sections in order
  - **WHEN** the `/founding` page is rendered
  - **THEN** the page MUST contain a Hero section with a single `<h1>` describing the Founding Member program
  - **AND** the page MUST contain a tier benefits section referencing both the 50% off tier and the 30% off tier
  - **AND** the page MUST contain the CS-priority promise message
  - **AND** the page MUST contain a waitlist email form
  - **AND** the page MUST contain a FAQ section with at least 3 question/answer pairs
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S2: No dark-pattern urgency devices
- Requirement: Founding teaser page renders the program sections in order
  - **WHEN** the `/founding` page is rendered
  - **THEN** the page MUST NOT contain a countdown timer component
  - **AND** any scarcity numbers shown (remaining slots) MUST originate from live API data, never from literals in copy or components
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S3: Unauthenticated visitor sees the teaser
- Requirement: Founding teaser page is publicly accessible without authentication
  - **WHEN** a visitor without a Supabase session requests `/founding` (on the apex host or on a host listed in `NEXT_PUBLIC_MARKETING_HOSTS`)
  - **THEN** the teaser page MUST render with HTTP 200
  - **AND** the visitor MUST NOT be redirected to `/login`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S4: Middleware matcher is unchanged
- Requirement: Founding teaser page is publicly accessible without authentication
  - **WHEN** `src/middleware.ts` is inspected after this change
  - **THEN** the exported `config.matcher` MUST NOT include `/founding`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S5: Locale switches the rendered copy
- Requirement: Founding teaser copy is localized via next-intl founding namespace
  - **WHEN** the `/founding` page is rendered with the `locale` cookie set to `ja`
  - **THEN** the page MUST render the Japanese copy from the `founding` namespace in `src/messages/ja.json`
  - **AND** when the `locale` cookie is `en` or absent, the page MUST render the English copy from `src/messages/en.json`
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S6: founding namespace keys exist in both locales
- Requirement: Founding teaser copy is localized via next-intl founding namespace
  - **WHEN** `src/messages/en.json` and `src/messages/ja.json` are parsed
  - **THEN** both files MUST contain a `founding` namespace with an identical key set covering at minimum: hero, tier benefits, CS-priority promise, waitlist form labels/messages, and FAQ entries
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S7: Valid email is saved with locale and source
- Requirement: Waitlist signup persists email to Supabase
  - **WHEN** a visitor submits a syntactically valid email through the waitlist form while the locale cookie is `ja`
  - **THEN** a row MUST exist in `waitlist` with that email, `locale = 'ja'`, a non-empty `source`, and a `created_at` timestamp
  - **AND** the form MUST show a success message in the visitor's locale
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S8: Invalid email is rejected before insert
- Requirement: Waitlist signup persists email to Supabase
  - **WHEN** a visitor submits a value that does not match the email format
  - **THEN** no row MUST be inserted into `waitlist`
  - **AND** the form MUST show a localized validation error
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S9: Duplicate email is neutralized
- Requirement: Waitlist signup persists email to Supabase
  - **WHEN** a visitor submits an email that already exists in `waitlist`
  - **THEN** the operation MUST complete without raising a visible error (upsert / ignore-duplicates semantics)
  - **AND** the table MUST still contain exactly one row for that email
  - **AND** the form MUST show the same success message as a first-time signup
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S10: Anon can insert but cannot read
- Requirement: Waitlist table enforces anon-insert-only RLS
  - **WHEN** a client using the anon key inserts a valid waitlist row
  - **THEN** the insert MUST succeed
  - **AND** a subsequent SELECT on `waitlist` by the same anon client MUST return zero rows (or be denied)
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S11: Database-level constraints reject bad data
- Requirement: Waitlist table enforces anon-insert-only RLS
  - **WHEN** an insert is attempted with a malformed email or with an email that already exists
  - **THEN** the database MUST reject the malformed email via the CHECK constraint
  - **AND** the duplicate email MUST violate the `unique(email)` constraint unless the caller used upsert semantics
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S12: Migration documents the anon-insert precedent
- Requirement: Waitlist table enforces anon-insert-only RLS
  - **WHEN** the waitlist migration file is inspected
  - **THEN** it MUST contain SQL comments explaining why anon INSERT is allowed, why SELECT is restricted to service_role, and the abuse mitigations (unique email, format CHECK, upsert neutralization)
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S13: Live counts are rendered from the API
- Requirement: Remaining slot display shows live counts from the founding counter API
  - **WHEN** the counter API responds with remaining counts for both tiers
  - **THEN** the tier benefits section MUST display those exact numbers as the remaining slots for the 50% off and 30% off tiers
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S14: Counter API unavailable falls back without fake numbers
- Requirement: Remaining slot display shows live counts from the founding counter API
  - **WHEN** the counter API is unreachable or returns an error
  - **THEN** the page MUST still render the tier benefits section without numeric remaining counts
  - **AND** the page MUST NOT display any hardcoded or cached-stale slot number
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S15: No hardcoded slot numbers in source
- Requirement: Remaining slot display shows live counts from the founding counter API
  - **WHEN** the founding teaser components and the `founding` message namespace are inspected
  - **THEN** they MUST NOT contain literal remaining-slot numbers; tier capacity wording may describe the program (e.g., "first 50 members") only as static program description sourced from configuration-backed copy, while the "remaining" figures MUST come exclusively from the API response
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了


## change-D: jp-legal-compliance

### S1: Tokushoho page renders mandatory items
- Requirement: Tokushoho disclosure page exists with all mandatory items
  - **WHEN** the 特定商取引法に基づく表記 page is rendered
  - **THEN** the page MUST contain section labels and values for: 事業者名（販売業者）、所在地、連絡先、販売価格、支払方法、支払時期、役務の提供時期、返品・解約に関する事項
  - **AND** a Vitest structural test MUST assert the presence of each mandatory section label
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S2: Tokushoho page is reachable from pages that display prices
- Requirement: Tokushoho disclosure page exists with all mandatory items
  - **WHEN** a page that displays subscription or Lifetime prices (LP footer, teaser, paywall, account/billing screen) is rendered
  - **THEN** the page MUST contain a link to the 特定商取引法に基づく表記 page
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S3: Four mandatory items are present and test-verified
- Requirement: Final confirmation screen displays the four mandatory items before Checkout
  - **WHEN** the final confirmation screen is rendered for a subscription plan (monthly or annual)
  - **THEN** the screen MUST contain text stating that the purchase is a 定期購入 with 自動更新
  - **AND** the screen MUST contain the per-billing-cycle price and the total amount payable over the stated period (税込)
  - **AND** the screen MUST contain the date (or rule) when the free trial converts to a paid plan and the amount charged at that point
  - **AND** the screen MUST contain the cancellation method, deadline, and a statement that no cancellation penalty (違約金) applies
  - **AND** a Vitest test MUST assert the existence of all four items
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S4: Mandatory items are visible without scrolling
- Requirement: Final confirmation screen displays the four mandatory items before Checkout
  - **WHEN** the final confirmation screen is rendered
  - **THEN** the four mandatory items MUST be placed above (or adjacent to) the purchase confirmation button, not behind accordions, modals, tabs, or below-the-fold placement that requires scrolling on a standard viewport
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S5: Lifetime (one-time) purchase shows non-recurring terms
- Requirement: Final confirmation screen displays the four mandatory items before Checkout
  - **WHEN** the final confirmation screen is rendered for the Lifetime plan
  - **THEN** the screen MUST state that the purchase is a one-time payment (定期購入ではない旨) with the total tax-inclusive price
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S6: Displayed price is tax-inclusive and matches the charged amount
- Requirement: All consumer-facing prices are displayed as tax-inclusive totals
  - **WHEN** a price is displayed on any consumer-facing surface
  - **THEN** the displayed amount MUST be the tax-inclusive total with a 税込 indication
  - **AND** the amount charged at Stripe Checkout MUST equal the displayed tax-inclusive amount
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S7: User can reach cancellation from the billing screen
- Requirement: Cancellation path matches the "cancel anytime" claim
  - **WHEN** a subscribed user opens the account/billing screen
  - **THEN** the screen MUST contain a link/button to the Stripe Customer Portal where the subscription can be canceled
  - **AND** any「いつでも解約」表示 MUST NOT be accompanied by extra conditions that contradict it
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S8: Remaining slots reflect the real counter
- Requirement: Scarcity and discount claims are based on real data
  - **WHEN** a remaining-slots figure（残り枠 N）is rendered on the teaser or paywall
  - **THEN** the figure MUST originate from the change-B counter API (real DB count), not a hardcoded or fabricated value
  - **AND** a test MUST verify the rendered figure is sourced from the counter, not a literal
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S9: Discount percentage references the real regular price
- Requirement: Scarcity and discount claims are based on real data
  - **WHEN** a「○%OFF」label is rendered
  - **THEN** the referenced regular price MUST be the actual price charged to non-discounted users (月額 / 年額 / Lifetime の実販売価格)
  - **AND** no expired or never-used reference price may be shown
- [x] テスト実装完了
- [x] ロジック実装完了
- [ ] 動作確認完了
- [ ] ユーザー確認完了

### S10: Privacy page mentions waitlist email and Stripe payment data
- Requirement: Privacy policy and terms cover payment data and waitlist email collection
  - **WHEN** the `/privacy` page is rendered
  - **THEN** the page MUST contain a clause about collecting email addresses via the waitlist and its purpose
  - **AND** the page MUST contain a clause stating that payment processing is delegated to Stripe and what data is sent to Stripe
  - **AND** the existing privacy page structure (sections 1-12) MUST be preserved with clauses added, not replaced by a new page
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

### S11: Terms page no longer claims the service is free
- Requirement: Privacy policy and terms cover payment data and waitlist email collection
  - **WHEN** the `/terms` page is rendered after this change
  - **THEN** the page MUST NOT state that the service is provided 無償 as its only mode
  - **AND** the page MUST reference the existence of paid plans and point to the 特定商取引法に基づく表記 page for transaction terms
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了
- [ ] ユーザー確認完了

## Feedback: /account「あなたのtier」明示 (D14)

### F-D14-1: 未課金ユーザーに予測tierを表示
- Requirement: account のファウンディング枠で自分が今どのtierに該当するか分かる（未課金時は残り枠から予測）
  - **WHEN** ユーザーが founding 枠を確保しておらず（membership 無し）、`slots.founder50.remaining > 0`
  - **THEN** 「今申し込むと【最初のメンバー｜50%オフ・永久】が適用されます」を表示し、50%オフ行をハイライトする
  - **AND** founder50 満杯・founder30 に空き → 「次のメンバー｜30%オフ・永久」を予測表示
  - **AND** 両方満杯 → 「Founding 枠は終了しました（通常価格）」
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了 (tree-walk テスト account-your-tier.test.tsx: 残枠50%→予測50%行ハイライト / 50満杯→予測30% / 両満杯→終了文言、全 GREEN)
- [ ] ユーザー確認完了

### F-D14-2: 確保済みユーザーに確定tierを表示（認証付きエンドポイント）
- Requirement: 既に founding 枠を確保済みなら確定 tier を予測より優先して表示
  - **WHEN** 認証ユーザーが `founding_memberships` 行を持つ
  - **THEN** `GET /api/founding/membership` が `{ tier }` を返し、「あなたは【最初のメンバー｜50%オフ・永久】です」等の確定文言を表示し該当行をハイライトする
  - **AND** 未認証で `GET /api/founding/membership` を叩くと 401
  - **AND** membership 無しなら `{ tier: null }` を返す
- [x] テスト実装完了
- [x] ロジック実装完了
- [x] 動作確認完了 (dev 3000: `curl /api/founding/membership` 未認証→401 `{"error":"Unauthorized"}` ハンドラ認可・middleware リダイレクトでない / `/api/founding/slots` は public 200 維持)
- [ ] ユーザー確認完了
