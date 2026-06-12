import { describe, it, expect, vi, beforeEach } from 'vitest';

// change-A S25: Subscriber receives portal URL
// change-A S26: Unauthenticated portal request is rejected
// change-A S27: User without billing history gets clear error
// Tasks: 3.4

const getUserMock = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: getUserMock } }),
}));

const getSubscriptionForUserMock = vi.fn();
vi.mock('@/lib/supabase/subscriptions', () => ({
  getSubscriptionForUser: (...a: unknown[]) => getSubscriptionForUserMock(...a),
}));

const createPortalSessionMock = vi.fn();
vi.mock('@/lib/billing/provider', () => ({
  createPortalSession: (...a: unknown[]) => createPortalSessionMock(...a),
}));

import { POST } from '@/app/api/stripe/portal/route';

function makeRequest(): Request {
  return new Request('http://localhost:3000/api/stripe/portal', { method: 'POST' });
}

beforeEach(() => {
  getUserMock.mockReset();
  getSubscriptionForUserMock.mockReset();
  createPortalSessionMock.mockReset();
});

describe('POST /api/stripe/portal', () => {
  it('S25: returns a portal URL for a subscriber with a stripe_customer_id', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    getSubscriptionForUserMock.mockResolvedValue({ stripeCustomerId: 'cus_123' });
    createPortalSessionMock.mockResolvedValue({ url: 'https://billing.stripe.com/p/sess_1' });

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://billing.stripe.com/p/sess_1');
    expect(createPortalSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cus_123' })
    );
  });

  it('S26: returns 401 and does not call Stripe when unauthenticated', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(createPortalSessionMock).not.toHaveBeenCalled();
  });

  it('S27: returns 400 with a clear message when the user has no billing profile', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    getSubscriptionForUserMock.mockResolvedValue(null);

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.error)).toMatch(/billing/i);
    expect(createPortalSessionMock).not.toHaveBeenCalled();
  });

  it('S27: returns 400 when subscription exists but has no stripe_customer_id', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    getSubscriptionForUserMock.mockResolvedValue({ stripeCustomerId: null });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect(createPortalSessionMock).not.toHaveBeenCalled();
  });
});
