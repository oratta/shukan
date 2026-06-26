import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

// change-A S7: Valid signature is processed
// change-A S8: Invalid signature is rejected
// change-A S10: Duplicate event acknowledged without side effects
// change-A S11: Unhandled event acknowledged
// change-A S13/S14/S15/S16/S17: subscriptions sync
// Tasks: 3.3

const WEBHOOK_SECRET = 'whsec_test_secret_123';

// --- service-role admin module mock (the write surface) ---
const markEventProcessedMock = vi.fn();
const isEventProcessedMock = vi.fn();
const upsertSubscriptionFromEventMock = vi.fn();
const updateSubscriptionByStripeIdMock = vi.fn();

vi.mock('@/lib/supabase/subscriptions-admin', () => ({
  isEventProcessed: (...a: unknown[]) => isEventProcessedMock(...a),
  markEventProcessed: (...a: unknown[]) => markEventProcessedMock(...a),
  upsertSubscriptionFromEvent: (...a: unknown[]) => upsertSubscriptionFromEventMock(...a),
  updateSubscriptionByStripeId: (...a: unknown[]) => updateSubscriptionByStripeIdMock(...a),
}));

// change-B integrates a founding-slot claim into the payment-success branch.
// This change-A test isolates subscription sync; stub the claim as a no-op.
vi.mock('@/lib/founding/webhook', () => ({
  applyFoundingClaim: vi.fn().mockResolvedValue({ tier: 'none', discountPct: 0, confirmedPriceId: null }),
}));

// stripe is constructed inside the provider from env; supply secret + webhook secret
beforeEach(() => {
  isEventProcessedMock.mockReset().mockResolvedValue(false);
  markEventProcessedMock.mockReset().mockResolvedValue(undefined);
  upsertSubscriptionFromEventMock.mockReset().mockResolvedValue(undefined);
  updateSubscriptionByStripeIdMock.mockReset().mockResolvedValue(undefined);
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

// Import after mocks
import { POST } from '@/app/api/stripe/webhook/route';

const stripe = new Stripe('sk_test_dummy');

function signedRequest(payload: object): Request {
  const body = JSON.stringify(payload);
  const header = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: WEBHOOK_SECRET,
  });
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header, 'content-type': 'application/json' },
    body,
  });
}

function event(type: string, dataObject: object, id = 'evt_' + Math.random().toString(36).slice(2)) {
  return {
    id,
    object: 'event',
    type,
    data: { object: dataObject },
  };
}

describe('POST /api/stripe/webhook signature (S7/S8)', () => {
  it('S8: rejects a request with a missing signature header without touching subscriptions', async () => {
    const req = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify(event('checkout.session.completed', {})),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(upsertSubscriptionFromEventMock).not.toHaveBeenCalled();
    expect(updateSubscriptionByStripeIdMock).not.toHaveBeenCalled();
  });

  it('S8: rejects a request with an invalid signature without side effects', async () => {
    const body = JSON.stringify(event('checkout.session.completed', {}));
    const req = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'stripe-signature': 't=1,v1=deadbeef' },
      body,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(upsertSubscriptionFromEventMock).not.toHaveBeenCalled();
  });

  it('S7: processes a validly-signed event and returns 200', async () => {
    const req = signedRequest(
      event('checkout.session.completed', {
        mode: 'subscription',
        customer: 'cus_1',
        subscription: 'sub_1',
        client_reference_id: 'user-1',
        metadata: { user_id: 'user-1', plan: 'monthly' },
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe('subscriptions sync (S13/S17)', () => {
  it('S13: checkout.session.completed (subscription mode) upserts active subscription', async () => {
    const req = signedRequest(
      event('checkout.session.completed', {
        mode: 'subscription',
        customer: 'cus_1',
        subscription: 'sub_1',
        client_reference_id: 'user-1',
        metadata: { user_id: 'user-1', plan: 'monthly' },
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(upsertSubscriptionFromEventMock).toHaveBeenCalledTimes(1);
    const arg = upsertSubscriptionFromEventMock.mock.calls[0][0];
    expect(arg.userId).toBe('user-1');
    expect(arg.status).toBe('active');
    expect(arg.plan).toBe('monthly');
    expect(arg.stripeCustomerId).toBe('cus_1');
    expect(arg.stripeSubscriptionId).toBe('sub_1');
  });

  it('S17: checkout.session.completed (payment mode) grants lifetime active', async () => {
    const req = signedRequest(
      event('checkout.session.completed', {
        mode: 'payment',
        customer: 'cus_2',
        client_reference_id: 'user-2',
        metadata: { user_id: 'user-2', plan: 'lifetime' },
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const arg = upsertSubscriptionFromEventMock.mock.calls[0][0];
    expect(arg.userId).toBe('user-2');
    expect(arg.plan).toBe('lifetime');
    expect(arg.status).toBe('active');
  });
});

describe('subscriptions sync (S14/S15/S16)', () => {
  it('S14: customer.subscription.updated syncs status/period/cancel flag by stripe id', async () => {
    const periodEnd = 1800000000;
    const req = signedRequest(
      event('customer.subscription.updated', {
        id: 'sub_1',
        status: 'past_due',
        current_period_end: periodEnd,
        cancel_at_period_end: true,
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(updateSubscriptionByStripeIdMock).toHaveBeenCalledTimes(1);
    const [stripeSubId, patch] = updateSubscriptionByStripeIdMock.mock.calls[0];
    expect(stripeSubId).toBe('sub_1');
    expect(patch.status).toBe('past_due');
    expect(patch.cancelAtPeriodEnd).toBe(true);
    expect(new Date(patch.currentPeriodEnd).getTime()).toBe(periodEnd * 1000);
  });

  it('S15: customer.subscription.deleted marks the row canceled', async () => {
    const req = signedRequest(
      event('customer.subscription.deleted', { id: 'sub_1', status: 'canceled' })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const [stripeSubId, patch] = updateSubscriptionByStripeIdMock.mock.calls[0];
    expect(stripeSubId).toBe('sub_1');
    expect(patch.status).toBe('canceled');
  });

  it('S16: invoice.paid refreshes status active and current_period_end', async () => {
    const periodEnd = 1900000000;
    const req = signedRequest(
      event('invoice.paid', {
        subscription: 'sub_1',
        lines: { data: [{ period: { end: periodEnd } }] },
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const [stripeSubId, patch] = updateSubscriptionByStripeIdMock.mock.calls[0];
    expect(stripeSubId).toBe('sub_1');
    expect(patch.status).toBe('active');
    expect(new Date(patch.currentPeriodEnd).getTime()).toBe(periodEnd * 1000);
  });
});

describe('idempotency (S10/S11)', () => {
  it('S10: duplicate event id is acknowledged 200 with no repeated side effects', async () => {
    const ev = event(
      'checkout.session.completed',
      {
        mode: 'subscription',
        customer: 'cus_1',
        subscription: 'sub_1',
        client_reference_id: 'user-1',
        metadata: { user_id: 'user-1', plan: 'monthly' },
      },
      'evt_dup_1'
    );

    // First delivery
    isEventProcessedMock.mockResolvedValueOnce(false);
    const res1 = await POST(signedRequest(ev));
    expect(res1.status).toBe(200);
    expect(upsertSubscriptionFromEventMock).toHaveBeenCalledTimes(1);
    expect(markEventProcessedMock).toHaveBeenCalledWith('evt_dup_1', 'checkout.session.completed');

    // Second delivery: already processed
    isEventProcessedMock.mockResolvedValueOnce(true);
    const res2 = await POST(signedRequest(ev));
    expect(res2.status).toBe(200);
    // No additional upsert from the duplicate
    expect(upsertSubscriptionFromEventMock).toHaveBeenCalledTimes(1);
  });

  it('S11: unhandled event types return 200 without modifying subscriptions', async () => {
    const req = signedRequest(event('payment_intent.created', { id: 'pi_1' }));
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(upsertSubscriptionFromEventMock).not.toHaveBeenCalled();
    expect(updateSubscriptionByStripeIdMock).not.toHaveBeenCalled();
  });
});
