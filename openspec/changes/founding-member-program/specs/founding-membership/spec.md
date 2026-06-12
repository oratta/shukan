# founding-membership

## ADDED Requirements

### Requirement: Founding membership data model

The system SHALL persist founding memberships in a Supabase table `founding_memberships` with columns `id` (sequential integer, claim order), `user_id` (FK to auth users, unique), `tier` (`founder_50` | `founder_30`), `discount_pct`, `claimed_at`, and `stripe_price_id`. A user MUST NOT hold more than one founding membership.

#### Scenario: Membership row recorded on successful claim

- **WHEN** a founding slot is successfully claimed for a user
- **THEN** a `founding_memberships` row MUST exist with the user's `user_id`, the claimed `tier`, the matching `discount_pct`, the applied `stripe_price_id`, and a `claimed_at` timestamp, with `id` reflecting claim order

#### Scenario: Duplicate claim by same user is rejected

- **WHEN** a slot claim is attempted for a user who already has a `founding_memberships` row
- **THEN** the claim MUST NOT create a second row, and the existing membership MUST remain unchanged

### Requirement: Atomic tier allocation with fallback

The system SHALL allocate founding slots atomically at the database level (transaction or RPC) in tier order: `founder_50` (50% off) up to its cap, then `founder_30` (30% off) up to its cap, then no founding slot (regular pricing; annual plans get the standard 20% off). Concurrent claims MUST NOT cause over-allocation beyond either cap.

#### Scenario: Slot claimed in founder_50 while capacity remains

- **WHEN** a payment succeeds and the number of `founder_50` memberships is below the `founder_50` cap
- **THEN** the claim MUST allocate a `founder_50` membership with `discount_pct = 50`

#### Scenario: Fallback to founder_30 when founder_50 cap reached

- **WHEN** a payment succeeds and the `founder_50` cap is already reached but `founder_30` capacity remains
- **THEN** the claim MUST allocate a `founder_30` membership with `discount_pct = 30`

#### Scenario: Fallback to regular pricing when all caps reached

- **WHEN** a payment succeeds and both the `founder_50` and `founder_30` caps are reached
- **THEN** no `founding_memberships` row MUST be created and the subscription MUST proceed at regular pricing (annual plan at the standard 20% off)

#### Scenario: Concurrent claims do not over-allocate

- **WHEN** multiple payment-success claims execute concurrently around a tier boundary
- **THEN** the database MUST serialize the claims so the number of memberships in each tier never exceeds that tier's cap, with excess claims falling back to the next tier or regular pricing

### Requirement: Slot claim occurs only on payment success

The system SHALL claim founding slots exclusively inside the payment-success webhook processing. Sign-up and trial start MUST NOT consume slots.

#### Scenario: Sign-up does not consume a slot

- **WHEN** a new user signs up
- **THEN** no `founding_memberships` row MUST be created and remaining-slot counts MUST be unchanged

#### Scenario: Trial start does not consume a slot

- **WHEN** a user starts the 14-day card-free trial
- **THEN** no `founding_memberships` row MUST be created and remaining-slot counts MUST be unchanged

#### Scenario: Payment-success webhook claims the slot

- **WHEN** the Stripe webhook confirms a successful payment for a user without an existing membership
- **THEN** the webhook handler MUST invoke the atomic slot-claim and record the resulting tier (if any) before completing webhook processing

### Requirement: Stripe discount applied per tier

The system SHALL apply the founding discount on the Stripe side via tier-specific Price IDs (or Coupons), so that the amount actually charged matches the claimed tier, and SHALL record the applied `stripe_price_id` on the membership.

#### Scenario: Checkout charges tier-discounted price

- **WHEN** a user with an available founding tier completes Checkout
- **THEN** the Stripe subscription MUST use the Price (or Coupon) corresponding to that tier's discount percentage, and the membership row MUST store that `stripe_price_id`

#### Scenario: Tier race at payment confirmation corrects the charged Price

- **WHEN** a user starts Checkout while a tier (e.g., founder_50) appears available, but that tier's cap is exhausted by the time the payment-success webhook confirms the claim
- **THEN** the claim MUST resolve to the actually-available tier (e.g., founder_30), the Stripe Subscription's Price MUST be updated to the confirmed tier's Price, and subsequent billing MUST use the corrected Price

### Requirement: Public remaining-slot counter API

The system SHALL expose a public endpoint readable by anonymous (unauthenticated) clients that returns the remaining slot counts per tier as aggregate values only, with no personal data (no `user_id`, email, or row-level data). Responses SHALL be served with short-lived caching (10–30 seconds revalidate) and MUST reflect actual database counts (no fabricated scarcity).

#### Scenario: Anonymous client fetches aggregate counts

- **WHEN** an unauthenticated GET request is made to the remaining-slot counter endpoint
- **THEN** the response MUST return aggregate remaining counts per tier derived from actual `founding_memberships` counts and the configured caps, and MUST NOT include any personal data

#### Scenario: Counter response shape is the cross-change contract

- **WHEN** any consumer (founding-teaser-waitlist's live slot display, jp-legal-compliance's 景表法 verification) reads the counter endpoint
- **THEN** the response body MUST be a JSON object containing `founder50: { cap, claimed, remaining }` and `founder30: { cap, claimed, remaining }`, and consumers MUST read remaining counts from `founder50.remaining` / `founder30.remaining`

#### Scenario: Counter response is short-cached

- **WHEN** the counter endpoint is requested repeatedly
- **THEN** responses MUST be cached with a revalidation window between 10 and 30 seconds, after which a fresh count MUST be served

#### Scenario: Counter reflects a consumed slot

- **WHEN** a founding slot is claimed and the cache window has elapsed
- **THEN** the counter endpoint MUST return a remaining count reduced accordingly

### Requirement: Early switch during trial locks the discount

The system SHALL allow a trialing user to switch to a paid subscription before the trial ends, and on payment success the founding tier available at that moment SHALL be claimed and its discount permanently locked for that user.

#### Scenario: Trial user switches early and locks current tier

- **WHEN** a user in an active trial completes the early-switch Checkout and the payment succeeds
- **THEN** the slot-claim MUST run with the tier availability at payment time, and the resulting discount MUST be recorded as the user's permanent founding discount

### Requirement: Founding discount is grandfathered across renewals

The system SHALL maintain the claimed founding discount on every subsequent subscription renewal (grandfathering). Renewal events MUST NOT remove, reduce, or re-evaluate the discount.

#### Scenario: Renewal keeps the permanent discount

- **WHEN** a founding member's subscription renews and the renewal webhook event is processed
- **THEN** the subscription MUST continue to be billed at the tier-discounted price and the `founding_memberships` row MUST remain unchanged

### Requirement: Tier caps are configurable

The system SHALL treat the tier caps (default 50 for `founder_50`, 200 for `founder_30`) as configuration values rather than hard-coded constants, so that tests can verify boundary behavior with small cap values.

#### Scenario: Boundary behavior verified with small caps

- **WHEN** the caps are configured to small test values (e.g., 2 and 3) and claims are executed past each boundary
- **THEN** the allocation MUST fall back exactly at the configured caps, demonstrating the same boundary behavior as the production values (50 / 200)
