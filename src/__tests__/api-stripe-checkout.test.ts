import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-A S4: Authenticated user receives Checkout URL
// change-A S5: Unauthenticated request is rejected
// change-A S6: Invalid plan is rejected
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

import { POST } from '@/app/api/stripe/checkout/route';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getUserMock.mockReset();
  getSubscriptionForUserMock.mockReset();
  createCheckoutSessionMock.mockReset();
  ensureCustomerMock.mockReset();
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly';
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual';
  process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime';
});

describe('POST /api/stripe/checkout', () => {
  it('S4: returns a Checkout URL for an authenticated user with a valid plan and carries user_id', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@b.c' } } });
    getSubscriptionForUserMock.mockResolvedValue({ stripeCustomerId: 'cus_existing' });
    ensureCustomerMock.mockResolvedValue('cus_existing');
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://checkout.stripe.com/c/sess_1' });

    const res = await POST(makeRequest({ plan: 'monthly' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/c/sess_1');

    // existing customer reused (ensureCustomer given the existing id)
    expect(ensureCustomerMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', existingCustomerId: 'cus_existing' })
    );
    // session created with subscription mode + user_id carried
    const arg = createCheckoutSessionMock.mock.calls[0][0];
    expect(arg.mode).toBe('subscription');
    expect(arg.userId).toBe('user-1');
    expect(arg.priceId).toBe('price_monthly');
  });

  it('S4: lifetime plan uses payment mode', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    getSubscriptionForUserMock.mockResolvedValue(null);
    ensureCustomerMock.mockResolvedValue('cus_new');
    createCheckoutSessionMock.mockResolvedValue({ url: 'https://checkout.stripe.com/c/sess_2' });

    const res = await POST(makeRequest({ plan: 'lifetime' }));
    expect(res.status).toBe(200);
    const arg = createCheckoutSessionMock.mock.calls[0][0];
    expect(arg.mode).toBe('payment');
    expect(arg.priceId).toBe('price_lifetime');
  });

  it('S5: returns 401 and does not call Stripe when unauthenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest({ plan: 'monthly' }));
    expect(res.status).toBe(401);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
    expect(ensureCustomerMock).not.toHaveBeenCalled();
  });

  it('S6: returns 400 for an unknown plan and does not create a session', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await POST(makeRequest({ plan: 'weekly' }));
    expect(res.status).toBe(400);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });

  it('S6: returns 400 when plan is missing', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(createCheckoutSessionMock).not.toHaveBeenCalled();
  });
});
