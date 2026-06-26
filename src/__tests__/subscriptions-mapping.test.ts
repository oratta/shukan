import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-A S12: RLS restricts reads to own row (read path uses authenticated client)
// Tasks: 2.3 (snake<->camel mapping)

// Mock the browser supabase client used by the read helpers
const maybeSingleMock = vi.fn();
const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: fromMock }),
}));

import { getSubscriptionForUser, rowToSubscription } from '@/lib/supabase/subscriptions';

beforeEach(() => {
  maybeSingleMock.mockReset();
  eqMock.mockClear();
  selectMock.mockClear();
  fromMock.mockClear();
});

describe('subscriptions snake<->camel mapping', () => {
  it('maps a DB row to a camelCase SubscriptionState', () => {
    const row = {
      id: 'row-1',
      user_id: 'user-1',
      stripe_customer_id: 'cus_1',
      stripe_subscription_id: 'sub_1',
      status: 'active',
      plan: 'monthly',
      trial_end: '2026-06-26T00:00:00Z',
      current_period_end: '2026-07-12T00:00:00Z',
      cancel_at_period_end: false,
    };
    const s = rowToSubscription(row);
    expect(s.userId).toBe('user-1');
    expect(s.stripeCustomerId).toBe('cus_1');
    expect(s.stripeSubscriptionId).toBe('sub_1');
    expect(s.status).toBe('active');
    expect(s.plan).toBe('monthly');
    expect(s.trialEnd).toBe('2026-06-26T00:00:00Z');
    expect(s.currentPeriodEnd).toBe('2026-07-12T00:00:00Z');
    expect(s.cancelAtPeriodEnd).toBe(false);
  });
});

describe('getSubscriptionForUser (S12 read path)', () => {
  it('queries subscriptions filtered by user_id and returns the mapped row', async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        id: 'row-1',
        user_id: 'user-1',
        stripe_customer_id: 'cus_1',
        stripe_subscription_id: null,
        status: 'trialing',
        plan: null,
        trial_end: '2026-06-26T00:00:00Z',
        current_period_end: null,
        cancel_at_period_end: false,
      },
      error: null,
    });

    const sub = await getSubscriptionForUser('user-1');
    expect(fromMock).toHaveBeenCalledWith('subscriptions');
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1');
    expect(sub?.status).toBe('trialing');
    expect(sub?.stripeCustomerId).toBe('cus_1');
  });

  it('returns null when no row exists', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const sub = await getSubscriptionForUser('user-x');
    expect(sub).toBeNull();
  });

  it('throws when the query errors', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(getSubscriptionForUser('user-1')).rejects.toBeTruthy();
  });
});
