-- ============================================================================
-- change-B: founding-member-program
-- Table: founding_memberships  +  RPCs: claim_founding_slot, count_founding_slots
-- ============================================================================
-- Founding members get a permanent tier discount (founder_50 = 50% off up to its
-- cap, then founder_30 = 30% off up to its cap, then regular pricing). A slot is
-- consumed ONLY on payment success (inside the Stripe webhook handler), never on
-- sign-up or trial start (plan.md / spec: "Slot claim occurs only on payment
-- success").
--
-- Caps are NOT stored in the DB: the webhook passes FOUNDING_CAP_50 /
-- FOUNDING_CAP_30 (env) as RPC arguments so tests can verify boundary behavior
-- with small caps (design D2).

create table if not exists public.founding_memberships (
  -- `id` records claim ORDER only. Tier is decided by COUNT, not by id, so a
  -- failed transaction's gap in the identity sequence never closes a tier early
  -- (design D1, rejected alternative B).
  id bigint generated always as identity primary key,
  -- unique(user_id) is the last line of defense against double-claim on webhook
  -- retries (design D1 / spec: duplicate claim rejected).
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tier text not null check (tier in ('founder_50', 'founder_30')),
  discount_pct int not null,
  claimed_at timestamptz not null default now(),
  stripe_price_id text
);

create index if not exists idx_founding_memberships_tier
  on public.founding_memberships(tier);

alter table public.founding_memberships enable row level security;

-- SELECT: a user may read only their own membership (account screen shows the
-- user's own tier). No INSERT/UPDATE/DELETE policies exist: all writes go through
-- the SECURITY DEFINER RPC below, invoked by the service role from the webhook
-- handler. A client can therefore never claim a slot directly (design D6).
create policy "Users can view own founding membership"
  on public.founding_memberships for select
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- claim_founding_slot — atomic, serialized, idempotent tier allocation
-- ============================================================================
-- Advisory lock key reservation: this function reserves the transaction-level
-- advisory lock key 718203 (an arbitrary project-unique constant) to serialize
-- all founding-slot claims. No other migration/function may reuse this key.
-- Serialization is what prevents over-allocation under concurrent webhook
-- delivery (design D1: app-side check-then-insert cannot guarantee this).
--
-- Returns the resolved tier ('founder_50' | 'founder_30' | 'none'), the applied
-- discount_pct, and the membership id (null when 'none'). For a user who already
-- holds a membership it returns the EXISTING row unchanged (idempotent — webhook
-- retries and duplicate deliveries are no-ops).
create or replace function public.claim_founding_slot(
  p_user_id uuid,
  p_cap_50 int,
  p_cap_30 int,
  p_stripe_price_id text default null
)
returns table (tier text, discount_pct int, membership_id bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.founding_memberships%rowtype;
  v_count_50 int;
  v_count_30 int;
  v_tier text;
  v_discount int;
  v_id bigint;
begin
  -- Serialize all claims for the duration of the transaction (design D1).
  perform pg_advisory_xact_lock(718203);

  -- Idempotency: a user who already has a membership keeps it unchanged.
  select * into v_existing
  from public.founding_memberships
  where user_id = p_user_id;

  if found then
    return query select v_existing.tier, v_existing.discount_pct, v_existing.id;
    return;
  end if;

  select count(*) into v_count_50
  from public.founding_memberships m where m.tier = 'founder_50';
  select count(*) into v_count_30
  from public.founding_memberships m where m.tier = 'founder_30';

  if v_count_50 < p_cap_50 then
    v_tier := 'founder_50';
    v_discount := 50;
  elsif v_count_30 < p_cap_30 then
    v_tier := 'founder_30';
    v_discount := 30;
  else
    -- Both caps reached: regular pricing, no membership row created.
    return query select 'none'::text, 0, null::bigint;
    return;
  end if;

  insert into public.founding_memberships (user_id, tier, discount_pct, stripe_price_id)
  values (p_user_id, v_tier, v_discount, p_stripe_price_id)
  returning id into v_id;

  return query select v_tier, v_discount, v_id;
end;
$$;

-- ============================================================================
-- count_founding_slots — aggregate counts only (no personal data)
-- ============================================================================
-- Backs the public GET /api/founding/slots counter. Returns per-tier claimed
-- counts ONLY — never user_id / claimed_at / row data — so the public endpoint
-- structurally cannot leak personal data (design D4).
create or replace function public.count_founding_slots()
returns table (tier text, claimed bigint)
language sql
security definer
set search_path = public
stable
as $$
  select t.tier, count(m.id) as claimed
  from (values ('founder_50'), ('founder_30')) as t(tier)
  left join public.founding_memberships m on m.tier = t.tier
  group by t.tier;
$$;

-- The aggregate RPC is safe to expose to anon; the per-row table is not.
grant execute on function public.count_founding_slots() to anon, authenticated;
-- claim_founding_slot is invoked only by the service role from the webhook
-- handler; do NOT grant it to anon/authenticated.
revoke execute on function public.claim_founding_slot(uuid, int, int, text)
  from anon, authenticated;
