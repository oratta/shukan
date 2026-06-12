/**
 * Slot-allocation reference logic (change-B: founding-member-program).
 *
 * This is a TypeScript reference implementation of the tier-fallback rule that the
 * `claim_founding_slot` plpgsql RPC enforces in the database. It exists so the
 * boundary, fallback, idempotency, and over-allocation behavior can be tested in
 * Vitest without a live Postgres (the migration cannot run in CI before
 * `supabase db push`). The SQL RPC is the production authority; this module
 * encodes the SAME decision rule (COUNT-based, founder_50 → founder_30 → none).
 *
 * Design D1: tier is decided by COUNT (not by the sequential `id`), so a failed
 * transaction's gap in the identity sequence never closes a tier early.
 */

import {
  DISCOUNT_PCT_BY_TIER,
  type FoundingCaps,
  type FoundingTier,
  type ResolvedTier,
} from './config';

export interface TierCounts {
  founder_50: number;
  founder_30: number;
}

export interface AllocationResult {
  tier: ResolvedTier;
  /** discount percent for the tier; 0 when `none` (regular pricing). */
  discountPct: number;
}

/**
 * Pure decision: given the current per-tier counts and the caps, which tier does
 * the next claim land in? founder_50 while below its cap, else founder_30 while
 * below its cap, else `none` (regular pricing; annual gets the standard 20% off).
 */
export function decideTier(counts: TierCounts, caps: FoundingCaps): AllocationResult {
  if (counts.founder_50 < caps.cap50) {
    return { tier: 'founder_50', discountPct: DISCOUNT_PCT_BY_TIER.founder_50 };
  }
  if (counts.founder_30 < caps.cap30) {
    return { tier: 'founder_30', discountPct: DISCOUNT_PCT_BY_TIER.founder_30 };
  }
  return { tier: 'none', discountPct: 0 };
}

export interface Membership {
  userId: string;
  tier: FoundingTier;
  discountPct: number;
  /** claim order (1-based), mirrors the identity `id` column. */
  id: number;
}

export interface ClaimOutcome {
  tier: ResolvedTier;
  discountPct: number;
  /** membership row if a founding slot was claimed (or already held), else null. */
  membership: Membership | null;
}

/**
 * In-memory reference store mirroring `founding_memberships` + the serialized
 * `claim_founding_slot` RPC. The RPC uses `pg_advisory_xact_lock` to serialize
 * concurrent claims; this store serializes via a single-threaded async mutex so
 * the same invariants (no over-allocation, idempotent per user) can be asserted
 * under simulated concurrency in Vitest.
 */
export class FoundingSlotStore {
  private readonly byUser = new Map<string, Membership>();
  private nextId = 1;
  private lock: Promise<void> = Promise.resolve();

  constructor(private readonly caps: FoundingCaps) {}

  counts(): TierCounts {
    let founder_50 = 0;
    let founder_30 = 0;
    for (const m of this.byUser.values()) {
      if (m.tier === 'founder_50') founder_50 += 1;
      else founder_30 += 1;
    }
    return { founder_50, founder_30 };
  }

  membershipFor(userId: string): Membership | null {
    return this.byUser.get(userId) ?? null;
  }

  /**
   * Atomic, idempotent claim. Serialized via the mutex (RPC advisory lock
   * analog). Returns the existing membership unchanged for a user who already
   * holds one (Webhook idempotency / unique(user_id) last line of defense).
   */
  async claim(userId: string): Promise<ClaimOutcome> {
    return this.runExclusive(() => {
      const existing = this.byUser.get(userId);
      if (existing) {
        return { tier: existing.tier, discountPct: existing.discountPct, membership: existing };
      }
      const decision = decideTier(this.counts(), this.caps);
      if (decision.tier === 'none') {
        return { tier: 'none', discountPct: 0, membership: null };
      }
      const membership: Membership = {
        userId,
        tier: decision.tier,
        discountPct: decision.discountPct,
        id: this.nextId++,
      };
      this.byUser.set(userId, membership);
      return { tier: decision.tier, discountPct: decision.discountPct, membership };
    });
  }

  private runExclusive<T>(fn: () => T): Promise<T> {
    const run = this.lock.then(() => fn());
    // Keep the chain alive even if fn throws so the mutex never deadlocks.
    this.lock = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}
