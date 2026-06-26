import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';

// change-B S7: Sign-up does not consume a slot (webhook is the only claimer)
// change-B S8: Trial start does not consume a slot
// change-B S9: Payment-success webhook claims the slot
// change-B S11: Tier race at payment confirmation corrects the charged Price
// change-B S16: Trial user early switch locks tier (same payment-success path)
// change-B S17: Renewal keeps the discount (no re-claim on renewal events)
// Tasks: 2.2, 2.3, 2.4

const WEBHOOK_SECRET = 'whsec_test_secret_123';

// subscriptions-admin (change-A write surface)
const isEventProcessedMock = vi.fn();
const markEventProcessedMock = vi.fn();
const upsertSubscriptionFromEventMock = vi.fn();
const updateSubscriptionByStripeIdMock = vi.fn();
vi.mock('@/lib/supabase/subscriptions-admin', () => ({
  isEventProcessed: (...a: unknown[]) => isEventProcessedMock(...a),
  markEventProcessed: (...a: unknown[]) => markEventProcessedMock(...a),
  upsertSubscriptionFromEvent: (...a: unknown[]) => upsertSubscriptionFromEventMock(...a),
  updateSubscriptionByStripeId: (...a: unknown[]) => updateSubscriptionByStripeIdMock(...a),
}));

// founding-admin (change-B claim surface)
const claimFoundingSlotMock = vi.fn();
vi.mock('@/lib/supabase/founding-admin', () => ({
  claimFoundingSlot: (...a: unknown[]) => claimFoundingSlotMock(...a),
}));

// billing provider price-correction surface
const updateSubscriptionPriceMock = vi.fn();
vi.mock('@/lib/billing/provider', async () => {
  const actual = await vi.importActual<typeof import('@/lib/billing/provider')>(
    '@/lib/billing/provider'
  );
  return {
    ...actual,
    updateSubscriptionPrice: (...a: unknown[]) => updateSubscriptionPriceMock(...a),
  };
});

const stripe = new Stripe('sk_test_dummy');

function signedRequest(payload: object): Request {
  const body = JSON.stringify(payload);
  const header = stripe.webhooks.generateTestHeaderString({ payload: body, secret: WEBHOOK_SECRET });
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': header, 'content-type': 'application/json' },
    body,
  });
}

function event(type: string, dataObject: object, id = 'evt_' + Math.random().toString(36).slice(2)) {
  return { id, object: 'event', type, data: { object: dataObject } };
}

beforeEach(() => {
  isEventProcessedMock.mockReset().mockResolvedValue(false);
  markEventProcessedMock.mockReset().mockResolvedValue(undefined);
  upsertSubscriptionFromEventMock.mockReset().mockResolvedValue(undefined);
  updateSubscriptionByStripeIdMock.mockReset().mockResolvedValue(undefined);
  claimFoundingSlotMock.mockReset();
  updateSubscriptionPriceMock.mockReset().mockResolvedValue(undefined);
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.STRIPE_PRICE_MONTHLY = 'price_monthly';
  process.env.STRIPE_PRICE_ANNUAL = 'price_annual';
  process.env.STRIPE_PRICE_FOUNDER50_MONTHLY = 'price_f50_m';
  process.env.STRIPE_PRICE_FOUNDER30_MONTHLY = 'price_f30_m';
});

let POST: typeof import('@/app/api/stripe/webhook/route').POST;
beforeEach(async () => {
  ({ POST } = await import('@/app/api/stripe/webhook/route'));
});

const checkoutCompleted = (overrides: object = {}) =>
  event('checkout.session.completed', {
    mode: 'subscription',
    customer: 'cus_1',
    subscription: 'sub_1',
    client_reference_id: 'user-1',
    metadata: { user_id: 'user-1', plan: 'monthly' },
    ...overrides,
  });

describe('payment-success claims a slot (S9)', () => {
  it('S9: invokes claim_founding_slot on checkout.session.completed', async () => {
    claimFoundingSlotMock.mockResolvedValue({ tier: 'founder_50', discountPct: 50, membershipId: 1 });
    const res = await POST(signedRequest(checkoutCompleted()));
    expect(res.status).toBe(200);
    expect(claimFoundingSlotMock).toHaveBeenCalledTimes(1);
    expect(claimFoundingSlotMock.mock.calls[0][0]).toMatchObject({ userId: 'user-1' });
    // subscription is still upserted (change-A behavior preserved)
    expect(upsertSubscriptionFromEventMock).toHaveBeenCalledTimes(1);
  });

  it('S9: when tier resolves to none, no price correction is attempted', async () => {
    claimFoundingSlotMock.mockResolvedValue({ tier: 'none', discountPct: 0, membershipId: null });
    await POST(signedRequest(checkoutCompleted()));
    expect(updateSubscriptionPriceMock).not.toHaveBeenCalled();
  });
});

describe('tier race correction (S11)', () => {
  it('S11: confirmed founder_30 corrects the Stripe Subscription Price to the founder_30 Price', async () => {
    // Checkout predicted founder_50 (price_f50_m), but the cap filled and the
    // claim confirmed founder_30. The webhook must move the subscription's Price.
    claimFoundingSlotMock.mockResolvedValue({ tier: 'founder_30', discountPct: 30, membershipId: 7 });
    await POST(signedRequest(checkoutCompleted()));
    expect(updateSubscriptionPriceMock).toHaveBeenCalledWith('sub_1', 'price_f30_m');
  });
});

describe('slot claim only on payment success (S7/S8)', () => {
  it('S7/S8: subscription status-change events (no payment) never claim a slot', async () => {
    const res = await POST(
      signedRequest(
        event('customer.subscription.updated', {
          id: 'sub_1',
          status: 'trialing',
          current_period_end: 1800000000,
          cancel_at_period_end: false,
        })
      )
    );
    expect(res.status).toBe(200);
    expect(claimFoundingSlotMock).not.toHaveBeenCalled();
  });
});

describe('grandfathering — renewals do not re-claim (S17)', () => {
  it('S17: invoice.paid (renewal) updates the subscription but does NOT claim again', async () => {
    const res = await POST(
      signedRequest(
        event('invoice.paid', {
          subscription: 'sub_1',
          lines: { data: [{ period: { end: 1900000000 } }] },
        })
      )
    );
    expect(res.status).toBe(200);
    expect(claimFoundingSlotMock).not.toHaveBeenCalled();
    expect(updateSubscriptionByStripeIdMock).toHaveBeenCalledTimes(1);
  });
});

describe('idempotent claim on webhook retry (S9 / task 2.4)', () => {
  it('does not double-claim when the same event is redelivered', async () => {
    claimFoundingSlotMock.mockResolvedValue({ tier: 'founder_50', discountPct: 50, membershipId: 1 });
    const ev = checkoutCompleted();

    isEventProcessedMock.mockResolvedValueOnce(false);
    await POST(signedRequest(ev));
    expect(claimFoundingSlotMock).toHaveBeenCalledTimes(1);

    isEventProcessedMock.mockResolvedValueOnce(true);
    await POST(signedRequest(ev));
    // redelivery short-circuits before dispatch -> no second claim
    expect(claimFoundingSlotMock).toHaveBeenCalledTimes(1);
  });
});
