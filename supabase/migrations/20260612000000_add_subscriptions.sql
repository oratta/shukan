-- ============================================
-- change-A: stripe-billing-foundation
-- Tables: subscriptions, stripe_events
-- ============================================
-- subscriptions is the source of truth for billing state (design D4).
-- - Trial state lives here with no Stripe object (design D3): status='trialing'.
-- - Billing writes come exclusively from the webhook handler using the service role.
-- - RLS lets each user read only their own row. There are intentionally NO
--   anon/authenticated insert/update/delete policies: all writes use the service
--   role (which bypasses RLS) from server-only modules. The single exception is
--   the card-free trial start, which is performed server-side via service role too.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null check (
    status in ('trialing', 'active', 'canceled', 'past_due', 'incomplete')
  ),
  plan text check (plan in ('monthly', 'annual', 'lifetime')),
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One billing row per user is the expected shape. Upserts in the webhook handler
-- key on user_id, so uniqueness keeps replays converging to a single row.
create unique index if not exists idx_subscriptions_user_id
  on public.subscriptions(user_id);
-- Webhook event handlers resolve the row by stripe_subscription_id.
create unique index if not exists idx_subscriptions_stripe_subscription_id
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;
create index if not exists idx_subscriptions_stripe_customer_id
  on public.subscriptions(stripe_customer_id);

alter table public.subscriptions enable row level security;

-- SELECT: a user can read only their own subscription row.
create policy "Users can view own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update/delete policies for authenticated/anon on purpose:
-- billing state is written only by the service role (webhook + trial start).

-- ============================================
-- stripe_events: idempotency / audit log (design D2)
-- ============================================
-- Records every processed Stripe event id so duplicate deliveries are no-ops.
-- Only the service role touches this table; no public RLS policies are added.
create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies: only the service role (which bypasses RLS) reads/writes this table.
