# stripe-billing

## ADDED Requirements

### Requirement: Stripe products and prices are defined in test mode with env-injected IDs

The system SHALL define Stripe Products / Prices for monthly ($4.99), annual ($39.99), and lifetime ($99) plans in Stripe test mode, and the application SHALL reference them only via environment variables (`STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` / `STRIPE_PRICE_LIFETIME`). All Prices MUST be created with `tax_behavior: inclusive` (tax-inclusive total pricing) so that the amount charged at Checkout equals the displayed tax-inclusive amount, per the jp-legal-compliance (change-D) 総額表示 requirement — `tax_behavior` cannot be changed after Price creation. Stripe secret key and webhook secret MUST be read from environment variables and MUST NOT be hardcoded.

#### Scenario: Prices are tax-inclusive

- **WHEN** any Product Price used by the application (monthly / annual / lifetime) is inspected in Stripe
- **THEN** its `tax_behavior` MUST be `inclusive`, and the amount charged at Checkout MUST equal the displayed tax-inclusive amount

#### Scenario: Price IDs resolved from environment

- **WHEN** the billing module resolves the price for plan `monthly`, `annual`, or `lifetime`
- **THEN** it MUST return the Stripe Price ID from the corresponding environment variable, and MUST throw a descriptive configuration error if the variable is missing

#### Scenario: No hardcoded secrets in source

- **WHEN** the source tree is scanned for Stripe live/test secret key patterns (`sk_live_`, `sk_test_`, `whsec_`)
- **THEN** no match MUST exist outside of `.env*` files and documentation examples

### Requirement: Authenticated Checkout session creation

The system SHALL provide a route handler at `/api/stripe/checkout` that creates a Stripe Checkout session for the authenticated user. The handler MUST authorize via `supabase.auth.getUser()` inside the handler (the middleware matcher is NOT extended). Subscription plans (monthly/annual) MUST use Checkout `mode: subscription`; lifetime MUST use `mode: payment`. The handler MUST reuse the user's existing `stripe_customer_id` when present in `subscriptions`, creating a Stripe Customer only when absent.

#### Scenario: Authenticated user receives Checkout URL

- **WHEN** an authenticated user POSTs to `/api/stripe/checkout` with a valid plan (`monthly` / `annual` / `lifetime`)
- **THEN** the handler MUST create a Checkout session tied to the user's Stripe Customer (with `user_id` carried in metadata or `client_reference_id`) and respond with the session URL

#### Scenario: Unauthenticated request is rejected

- **WHEN** a request without a valid Supabase session POSTs to `/api/stripe/checkout`
- **THEN** the handler MUST respond with HTTP 401 and MUST NOT call the Stripe API

#### Scenario: Invalid plan is rejected

- **WHEN** an authenticated user POSTs to `/api/stripe/checkout` with an unknown plan value
- **THEN** the handler MUST respond with HTTP 400 and MUST NOT create a Checkout session

### Requirement: Webhook endpoint with mandatory signature verification

The system SHALL provide a route handler at `/api/stripe/webhook` placed outside the middleware matcher, which verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` using the raw request body before any processing. Requests failing verification MUST be rejected without side effects.

#### Scenario: Valid signature is processed

- **WHEN** a webhook request arrives with a signature correctly computed from the raw body and `STRIPE_WEBHOOK_SECRET`
- **THEN** the handler MUST construct the event, dispatch it to the corresponding event handler, and respond with HTTP 200

#### Scenario: Invalid signature is rejected

- **WHEN** a webhook request arrives with a missing or invalid `stripe-signature` header
- **THEN** the handler MUST respond with HTTP 400 and MUST NOT read or write the `subscriptions` table

#### Scenario: Webhook bypasses auth middleware

- **WHEN** the middleware `config.matcher` in `src/middleware.ts` is inspected
- **THEN** it MUST NOT include `/api/stripe/:path*` or any pattern matching `/api/stripe/webhook`, so unauthenticated Stripe servers can reach the endpoint

### Requirement: Webhook events are processed idempotently

The system SHALL process webhook events idempotently, assuming Stripe may deliver the same event multiple times. Processed Stripe event IDs MUST be recorded (in a `stripe_events` table), and a duplicate event MUST be acknowledged with HTTP 200 without re-applying side effects. State updates MUST additionally be written as upserts keyed on stable identifiers so replays converge to the same state.

#### Scenario: Duplicate event is acknowledged without side effects

- **WHEN** the same `checkout.session.completed` event (same Stripe event ID) is delivered twice
- **THEN** the second delivery MUST respond with HTTP 200 and the `subscriptions` row MUST be identical to the state after the first delivery

#### Scenario: Unhandled event types are acknowledged

- **WHEN** a verified webhook event of a type outside the handled set is delivered
- **THEN** the handler MUST respond with HTTP 200 without modifying the `subscriptions` table

### Requirement: Subscriptions table is the source of truth for billing state

The system SHALL maintain a Supabase `subscriptions` table with columns `user_id` (FK to auth.users), `stripe_customer_id`, `stripe_subscription_id`, `status` (`trialing` / `active` / `canceled` / `past_due` / `incomplete`), `plan` (`monthly` / `annual` / `lifetime`), `trial_end`, `current_period_end`, `cancel_at_period_end`, protected by RLS so each user can read only their own row. Writes from webhooks MUST use the service role. UI and paywall decisions MUST read entitlement from this table, never directly from the Stripe API.

#### Scenario: RLS restricts reads to own row

- **WHEN** an authenticated user queries the `subscriptions` table with the anon/authenticated role
- **THEN** only the row where `user_id` equals the requesting user's ID MUST be returned, and rows of other users MUST NOT be readable

#### Scenario: checkout.session.completed activates subscription

- **WHEN** a verified `checkout.session.completed` event for a subscription-mode session is processed
- **THEN** the user's `subscriptions` row MUST be upserted with `status: active`, the resolved `plan`, `stripe_customer_id`, `stripe_subscription_id`, and `current_period_end`

#### Scenario: customer.subscription.updated syncs status fields

- **WHEN** a verified `customer.subscription.updated` event is processed
- **THEN** the matching `subscriptions` row (by `stripe_subscription_id`) MUST be updated with the event's `status`, `current_period_end`, and `cancel_at_period_end`

#### Scenario: customer.subscription.deleted marks subscription canceled

- **WHEN** a verified `customer.subscription.deleted` event is processed
- **THEN** the matching `subscriptions` row MUST be updated to `status: canceled`

#### Scenario: invoice.paid refreshes period end

- **WHEN** a verified `invoice.paid` event for a subscription renewal is processed
- **THEN** the matching `subscriptions` row MUST reflect `status: active` and the new `current_period_end`

### Requirement: Lifetime purchase grants permanent access

The system SHALL treat a completed lifetime (one-time payment) Checkout as granting permanent entitlement: `plan: lifetime`, `status: active`, with no expiring `current_period_end` constraint applied by the paywall.

#### Scenario: Lifetime checkout completion grants permanent entitlement

- **WHEN** a verified `checkout.session.completed` event for a payment-mode (lifetime) session is processed
- **THEN** the user's `subscriptions` row MUST be upserted with `plan: lifetime` and `status: active`, and the paywall MUST treat the user as entitled regardless of `current_period_end` or trial state

### Requirement: Card-free 14-day trial managed in subscriptions

The system SHALL allow a user to start a trial without entering card details. Trial start creates a `subscriptions` row with `status: trialing` and `trial_end` set to now plus the configured trial length (default 14 days, configurable via environment/setting). During the trial, gated actions are available. Trial state lives in `subscriptions` (no Stripe object is required for the trial).

#### Scenario: Trial starts without card

- **WHEN** a user starts the trial
- **THEN** a `subscriptions` row MUST be created with `status: trialing` and `trial_end` = start time + configured trial days, without any Stripe API call requiring payment details

#### Scenario: Gated actions available during trial

- **WHEN** a user with `status: trialing` and `trial_end` in the future performs a gated action
- **THEN** the action MUST be allowed without any paywall block

#### Scenario: Trial length is configurable

- **WHEN** the trial-days configuration value is set to a non-default value (e.g., 3 for tests)
- **THEN** newly started trials MUST compute `trial_end` from that value without code changes

#### Scenario: Trial expiry requires no status transition

- **WHEN** a trial's `trial_end` passes without the user subscribing
- **THEN** the `subscriptions` row MUST remain `status: trialing` (no background job or webhook transitions it), and entitlement MUST be evaluated purely from `trial_end < now`

### Requirement: Paywall gate blocks gated actions after trial expiry

The system SHALL provide a paywall gate component/hook that evaluates entitlement from the `subscriptions` state: entitled when `status` is `active`, or `plan` is `lifetime`, or `status` is `trialing` with `trial_end` in the future. When a non-entitled user attempts a gated action, the gate MUST block the action and present an upgrade prompt. Which actions are gated, limits, and trial days MUST be driven by configuration values, not hardcoded.

#### Scenario: Expired trial blocks gated action

- **WHEN** a user whose `trial_end` is in the past and who has no active or lifetime subscription attempts a gated action
- **THEN** the paywall gate MUST block the action and display the upgrade prompt (with a CTA leading toward Checkout)

#### Scenario: Active subscriber is never gated

- **WHEN** a user with `status: active` (any plan) performs a gated action
- **THEN** the action MUST proceed without the paywall appearing

#### Scenario: Gate configuration is adjustable

- **WHEN** the gated-action configuration (gated action set / limits) is changed via settings or environment values
- **THEN** the paywall gate MUST honor the new configuration without modification to the gate component logic

### Requirement: Authenticated Customer Portal access

The system SHALL provide a route handler at `/api/stripe/portal` that creates a Stripe Customer Portal session for the authenticated user (authorized via `supabase.auth.getUser()` inside the handler) and returns the portal URL, enabling self-service management and cancellation.

#### Scenario: Subscriber receives portal URL

- **WHEN** an authenticated user with a `stripe_customer_id` POSTs to `/api/stripe/portal`
- **THEN** the handler MUST create a Customer Portal session for that customer and respond with the portal URL

#### Scenario: Unauthenticated portal request is rejected

- **WHEN** a request without a valid Supabase session POSTs to `/api/stripe/portal`
- **THEN** the handler MUST respond with HTTP 401 and MUST NOT call the Stripe API

#### Scenario: User without billing history gets clear error

- **WHEN** an authenticated user with no `stripe_customer_id` POSTs to `/api/stripe/portal`
- **THEN** the handler MUST respond with HTTP 400 (or equivalent client error) explaining no billing profile exists, instead of throwing an unhandled error

### Requirement: Payment provider access goes through a thin abstraction

The system SHALL route application-level billing operations (create checkout, create portal session, map webhook events to domain events) through a thin provider-agnostic module so a future Merchant-of-Record provider (Paddle, Lemon Squeezy, Polar) can replace Stripe without rewriting callers. The abstraction MUST stay minimal (interface + Stripe implementation), without speculative multi-provider machinery.

#### Scenario: Callers do not import Stripe SDK directly

- **WHEN** application code outside `src/lib/billing/` (routes excluded only for raw-body signature plumbing) needs a checkout or portal session
- **THEN** it MUST call the billing abstraction module rather than instantiating the Stripe SDK directly
