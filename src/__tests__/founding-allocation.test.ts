import { describe, it, expect } from 'vitest';
import {
  decideTier,
  FoundingSlotStore,
  type TierCounts,
} from '@/lib/founding/allocation';
import type { FoundingCaps } from '@/lib/founding/config';

// change-B S3: Slot claimed in founder_50 while capacity remains
// change-B S4: Fallback to founder_30 when founder_50 cap reached
// change-B S5: Fallback to regular pricing when all caps reached
// change-B S6: Concurrent claims do not over-allocate
// change-B S2: Duplicate claim by same user is rejected (idempotent)
// change-B S18: Boundary behavior verified with small caps
// Tasks: 1.2, 1.3

const SMALL_CAPS: FoundingCaps = { cap50: 2, cap30: 3 };

describe('decideTier — tier fallback boundary (S3/S4/S5/S18)', () => {
  it('S3: allocates founder_50 with 50% off while founder_50 capacity remains', () => {
    const counts: TierCounts = { founder_50: 0, founder_30: 0 };
    expect(decideTier(counts, SMALL_CAPS)).toEqual({ tier: 'founder_50', discountPct: 50 });
  });

  it('S3: still founder_50 at the last available slot (count == cap-1)', () => {
    const counts: TierCounts = { founder_50: 1, founder_30: 0 };
    expect(decideTier(counts, SMALL_CAPS)).toEqual({ tier: 'founder_50', discountPct: 50 });
  });

  it('S4: falls back to founder_30 with 30% off exactly at the founder_50 cap', () => {
    const counts: TierCounts = { founder_50: 2, founder_30: 0 };
    expect(decideTier(counts, SMALL_CAPS)).toEqual({ tier: 'founder_30', discountPct: 30 });
  });

  it('S5: falls back to none (regular pricing) when both caps are reached', () => {
    const counts: TierCounts = { founder_50: 2, founder_30: 3 };
    expect(decideTier(counts, SMALL_CAPS)).toEqual({ tier: 'none', discountPct: 0 });
  });

  it('S18: production-shaped caps (50/200) keep the same boundary rule', () => {
    const caps: FoundingCaps = { cap50: 50, cap30: 200 };
    expect(decideTier({ founder_50: 49, founder_30: 0 }, caps).tier).toBe('founder_50');
    expect(decideTier({ founder_50: 50, founder_30: 199 }, caps).tier).toBe('founder_30');
    expect(decideTier({ founder_50: 50, founder_30: 200 }, caps).tier).toBe('none');
  });
});

describe('FoundingSlotStore.claim — sequential boundary (S3/S4/S5/S18)', () => {
  it('S18: fills founder_50 then founder_30 then none exactly at small caps', async () => {
    const store = new FoundingSlotStore(SMALL_CAPS); // 2 / 3
    const outcomes = [];
    for (let i = 0; i < 6; i++) {
      outcomes.push(await store.claim(`user-${i}`));
    }
    expect(outcomes.map((o) => o.tier)).toEqual([
      'founder_50',
      'founder_50',
      'founder_30',
      'founder_30',
      'founder_30',
      'none',
    ]);
    const counts = store.counts();
    expect(counts.founder_50).toBe(2);
    expect(counts.founder_30).toBe(3);
  });

  it('S1: a claimed membership records tier, discount, and claim-order id', async () => {
    const store = new FoundingSlotStore(SMALL_CAPS);
    const first = await store.claim('user-a');
    const second = await store.claim('user-b');
    expect(first.membership).toMatchObject({ userId: 'user-a', tier: 'founder_50', discountPct: 50, id: 1 });
    expect(second.membership).toMatchObject({ userId: 'user-b', id: 2 });
  });

  it('S5: a none outcome creates no membership row', async () => {
    const store = new FoundingSlotStore({ cap50: 0, cap30: 0 });
    const outcome = await store.claim('user-x');
    expect(outcome.tier).toBe('none');
    expect(outcome.membership).toBeNull();
    expect(store.membershipFor('user-x')).toBeNull();
  });
});

describe('FoundingSlotStore.claim — idempotency (S2)', () => {
  it('S2: a repeat claim by the same user does not create a second row and is unchanged', async () => {
    const store = new FoundingSlotStore(SMALL_CAPS);
    const first = await store.claim('user-a');
    const repeat = await store.claim('user-a');
    expect(repeat.tier).toBe(first.tier);
    expect(repeat.membership).toEqual(first.membership);
    expect(store.counts().founder_50).toBe(1);
  });
});

describe('FoundingSlotStore.claim — concurrency / no over-allocation (S6)', () => {
  it('S6: 50 concurrent claims around the boundary never exceed either cap', async () => {
    const store = new FoundingSlotStore(SMALL_CAPS); // 2 / 3, total 5 slots
    const claims = Array.from({ length: 50 }, (_, i) => store.claim(`user-${i}`));
    const outcomes = await Promise.all(claims);

    const counts = store.counts();
    expect(counts.founder_50).toBe(2);
    expect(counts.founder_30).toBe(3);
    expect(counts.founder_50).toBeLessThanOrEqual(SMALL_CAPS.cap50);
    expect(counts.founder_30).toBeLessThanOrEqual(SMALL_CAPS.cap30);

    const founders = outcomes.filter((o) => o.membership !== null);
    expect(founders).toHaveLength(5); // exactly cap50 + cap30
    const nones = outcomes.filter((o) => o.tier === 'none');
    expect(nones).toHaveLength(45);
  });

  it('S6: concurrent duplicate claims by the same user yield a single membership', async () => {
    const store = new FoundingSlotStore(SMALL_CAPS);
    const claims = Array.from({ length: 10 }, () => store.claim('same-user'));
    const outcomes = await Promise.all(claims);
    const ids = new Set(outcomes.map((o) => o.membership?.id));
    expect(ids.size).toBe(1);
    expect(store.counts().founder_50).toBe(1);
  });
});
