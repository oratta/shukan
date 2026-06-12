import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-B S10: Checkout charges tier-discounted price (predicted tier)
// change-B S5: all caps reached -> regular Price (annual carries 20% off)
// Tasks: 3.2

const getUserMock = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: getUserMock } }),
}));

const getSubscriptionForUserMock = vi.fn();
vi.mock('@/lib/supabase/subscriptions', () => ({
  getSubscriptionForUser: (...a: unknown[]) => getSubscriptionForUserMock(...a),
}));

const createCheckoutSessionMock = vi.fn();
const ensureCustomerMock = vi.fn();
vi.mock('@/lib/billing/provider', () => ({
  createCheckoutSession: (...a: unknown[]) => createCheckoutSessionMock(...a),
  ensureCustomer: (...a: unknown[]) => ensureCustomerMock(...a),
}));

const predictFoundingTierMock = vi.fn();
vi.mock('@/lib/supabase/founding-admin', () => ({
  predictFoundingTier: (...a: unknown[]) => predictFoundingTierMock(...a),
}));

import { POST } from '@/app/api/stripe/checkout/route';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getUserMock.mockReset().mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.c' } } });
  getSubscriptionForUserMock.mockReset().mockResolvedValue(null);
  ensureCustomerMock.mockReset().mockResolvedValue('cus_1');
  createCheckoutSessionMock.mockReset().mockResolvedValue({ url: 'https://stripe/sess' });
  predictFoundingTierMock.mockReset();
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly';
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual';
  process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime';
  process.env.STRIPE_PRICE_FOUNDER50_MONTHLY = 'price_f50_m';
  process.env.STRIPE_PRICE_FOUNDER50_ANNUAL = 'price_f50_a';
  process.env.STRIPE_PRICE_FOUNDER30_MONTHLY = 'price_f30_m';
  process.env.STRIPE_PRICE_FOUNDER30_ANNUAL = 'price_f30_a';
});

describe('Checkout tier-Price selection (S10/S5/task 3.2)', () => {
  it('S10: founder_50 predicted -> monthly uses the founder_50 monthly Price', async () => {
    predictFoundingTierMock.mockResolvedValue('founder_50');
    await POST(makeRequest({ plan: 'monthly' }));
    expect(createCheckoutSessionMock.mock.calls[0][0].priceId).toBe('price_f50_m');
  });

  it('S10: founder_30 predicted -> annual uses the founder_30 annual Price', async () => {
    predictFoundingTierMock.mockResolvedValue('founder_30');
    await POST(makeRequest({ plan: 'annual' }));
    expect(createCheckoutSessionMock.mock.calls[0][0].priceId).toBe('price_f30_a');
  });

  it('S5: all caps reached (none) -> annual uses the regular annual Price (20% off)', async () => {
    predictFoundingTierMock.mockResolvedValue('none');
    await POST(makeRequest({ plan: 'annual' }));
    expect(createCheckoutSessionMock.mock.calls[0][0].priceId).toBe('price_annual');
  });

  it('lifetime never consults founding tier and uses the lifetime Price', async () => {
    await POST(makeRequest({ plan: 'lifetime' }));
    expect(predictFoundingTierMock).not.toHaveBeenCalled();
    expect(createCheckoutSessionMock.mock.calls[0][0].priceId).toBe('price_lifetime');
  });

  it('falls back to the regular Price if tier prediction throws', async () => {
    predictFoundingTierMock.mockRejectedValue(new Error('counter down'));
    await POST(makeRequest({ plan: 'monthly' }));
    expect(createCheckoutSessionMock.mock.calls[0][0].priceId).toBe('price_monthly');
  });
});
