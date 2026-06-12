import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-B S1: membership row recorded on successful claim (RPC call layer)
// change-B S12/S13: aggregate counts shape from count_founding_slots RPC
// Tasks: 1.4, 1.5, 2.2 (RPC call layer mock test — real plpgsql verified post-merge)

// server-only guards the bundle; harmless no-op under Vitest.
vi.mock('server-only', () => ({}));

// --- supabase-js admin client mock (the RPC surface) ---
const rpcMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ rpc: (...a: unknown[]) => rpcMock(...a) }),
}));

beforeEach(() => {
  rpcMock.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key';
  process.env.FOUNDING_CAP_50 = '2';
  process.env.FOUNDING_CAP_30 = '3';
});

import {
  claimFoundingSlot,
  getFoundingCounts,
} from '@/lib/supabase/founding-admin';

describe('claimFoundingSlot (S1 / task 1.4 — RPC call layer)', () => {
  it('S1: calls claim_founding_slot with user id, env caps, and price id', async () => {
    rpcMock.mockResolvedValue({
      data: [{ tier: 'founder_50', discount_pct: 50, membership_id: 1 }],
      error: null,
    });

    const result = await claimFoundingSlot({
      userId: 'user-1',
      stripePriceId: 'price_f50_m',
    });

    expect(rpcMock).toHaveBeenCalledWith('claim_founding_slot', {
      p_user_id: 'user-1',
      p_cap_50: 2,
      p_cap_30: 3,
      p_stripe_price_id: 'price_f50_m',
    });
    expect(result).toEqual({ tier: 'founder_50', discountPct: 50, membershipId: 1 });
  });

  it('S5: maps a none result (caps reached) with null membership id', async () => {
    rpcMock.mockResolvedValue({
      data: [{ tier: 'none', discount_pct: 0, membership_id: null }],
      error: null,
    });
    const result = await claimFoundingSlot({ userId: 'user-9', stripePriceId: null });
    expect(result).toEqual({ tier: 'none', discountPct: 0, membershipId: null });
  });

  it('throws when the RPC returns an error', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(
      claimFoundingSlot({ userId: 'user-1', stripePriceId: null })
    ).rejects.toThrow();
  });
});

describe('getFoundingCounts (S12/S13 / task 1.5)', () => {
  it('S13: returns the cross-change contract shape with cap/claimed/remaining', async () => {
    rpcMock.mockResolvedValue({
      data: [
        { tier: 'founder_50', claimed: 2 },
        { tier: 'founder_30', claimed: 1 },
      ],
      error: null,
    });

    const counts = await getFoundingCounts();

    expect(rpcMock).toHaveBeenCalledWith('count_founding_slots');
    expect(counts).toEqual({
      founder50: { cap: 2, claimed: 2, remaining: 0 },
      founder30: { cap: 3, claimed: 1, remaining: 2 },
    });
  });

  it('S12: defaults missing tiers to zero claimed and full remaining', async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    const counts = await getFoundingCounts();
    expect(counts).toEqual({
      founder50: { cap: 2, claimed: 0, remaining: 2 },
      founder30: { cap: 3, claimed: 0, remaining: 3 },
    });
  });

  it('clamps remaining at zero when claimed exceeds a lowered cap', async () => {
    process.env.FOUNDING_CAP_50 = '1';
    rpcMock.mockResolvedValue({
      data: [{ tier: 'founder_50', claimed: 5 }],
      error: null,
    });
    const counts = await getFoundingCounts();
    expect(counts.founder50.remaining).toBe(0);
  });
});
