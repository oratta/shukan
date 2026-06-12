import 'server-only';

/**
 * Service-role access to founding-membership slot claims and aggregate counts
 * (change-B, design D1/D4/D6).
 *
 * Server-only. Slot claims go through the SECURITY DEFINER `claim_founding_slot`
 * RPC (the ONLY write path for `founding_memberships`); the webhook handler is the
 * only caller. Aggregate counts come from `count_founding_slots`, which returns
 * per-tier counts only (no personal data) and backs the public counter API.
 *
 * The real plpgsql RPC is verified post-merge against the dev DB (see decisions
 * D6); here the call layer is unit-tested against a mocked supabase client, and
 * the tier-fallback rule the RPC enforces is independently tested in
 * `src/lib/founding/allocation.ts` (FoundingSlotStore / decideTier).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getFoundingCaps, type ResolvedTier } from '@/lib/founding/config';
import { decideTier } from '@/lib/founding/allocation';

let cached: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for service-role founding writes.'
    );
  }
  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export interface ClaimSlotInput {
  userId: string;
  /** Price the Checkout session used (the predicted-tier price), recorded on the row. */
  stripePriceId: string | null;
}

export interface ClaimSlotResult {
  tier: ResolvedTier;
  discountPct: number;
  membershipId: number | null;
}

/**
 * Atomically claim a founding slot for a paying user. Caps come from env so tests
 * can exercise boundaries with small values. Idempotent: a user who already holds
 * a membership keeps it unchanged.
 */
export async function claimFoundingSlot(input: ClaimSlotInput): Promise<ClaimSlotResult> {
  const { cap50, cap30 } = getFoundingCaps();
  const { data, error } = await admin().rpc('claim_founding_slot', {
    p_user_id: input.userId,
    p_cap_50: cap50,
    p_cap_30: cap30,
    p_stripe_price_id: input.stripePriceId,
  });
  if (error) throw new Error(`claim_founding_slot failed: ${error.message}`);

  const row = Array.isArray(data) ? data[0] : data;
  return {
    tier: (row?.tier ?? 'none') as ResolvedTier,
    discountPct: Number(row?.discount_pct ?? 0),
    membershipId: row?.membership_id == null ? null : Number(row.membership_id),
  };
}

export interface TierCount {
  cap: number;
  claimed: number;
  remaining: number;
}

export interface FoundingCounts {
  founder50: TierCount;
  founder30: TierCount;
}

/**
 * Aggregate per-tier counts for the public counter API. Returns the cross-change
 * contract shape (`founder50` / `founder30`, each `{ cap, claimed, remaining }`).
 * `remaining` is clamped at zero so a lowered cap never reports negative.
 */
export async function getFoundingCounts(): Promise<FoundingCounts> {
  const { cap50, cap30 } = getFoundingCaps();
  const { data, error } = await admin().rpc('count_founding_slots');
  if (error) throw new Error(`count_founding_slots failed: ${error.message}`);

  const claimedByTier = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ tier: string; claimed: number | string }>) {
    claimedByTier.set(row.tier, Number(row.claimed));
  }

  const tier = (cap: number, claimed: number): TierCount => ({
    cap,
    claimed,
    remaining: Math.max(0, cap - claimed),
  });

  return {
    founder50: tier(cap50, claimedByTier.get('founder_50') ?? 0),
    founder30: tier(cap30, claimedByTier.get('founder_30') ?? 0),
  };
}

/**
 * Predict the tier a claim would land in RIGHT NOW, for choosing the Checkout
 * Price. This is only a hint: the authoritative claim happens later in the
 * payment-success webhook RPC (design D5), which corrects the Stripe Price if the
 * tier changed in the meantime. Falls back to `none` if counts cannot be read so
 * Checkout always proceeds at regular pricing rather than failing.
 */
export async function predictFoundingTier(): Promise<ResolvedTier> {
  const { cap50, cap30 } = getFoundingCaps();
  try {
    const counts = await getFoundingCounts();
    return decideTier(
      { founder_50: counts.founder50.claimed, founder_30: counts.founder30.claimed },
      { cap50, cap30 }
    ).tier;
  } catch {
    return 'none';
  }
}
