/**
 * Stripe implementation of the billing abstraction (change-A).
 *
 * This is the ONLY module that instantiates the Stripe SDK. All secrets are read
 * from env via config.ts and never hardcoded.
 */

import Stripe from 'stripe';
import {
  getStripeSecretKey,
  getWebhookSecret,
  getAppUrl,
  isValidPlan,
  type Plan,
} from './config';
import type { SubscriptionStatus } from './entitlement';
import type {
  BillingDomainEvent,
  CheckoutSessionResult,
  CreateCheckoutParams,
  CreatePortalParams,
  EnsureCustomerParams,
  PortalSessionResult,
} from './provider';

let cachedClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!cachedClient) {
    cachedClient = new Stripe(getStripeSecretKey());
  }
  return cachedClient;
}

export async function ensureCustomer(params: EnsureCustomerParams): Promise<string> {
  if (params.existingCustomerId) return params.existingCustomerId;
  const customer = await getStripe().customers.create({
    email: params.email,
    metadata: { user_id: params.userId },
  });
  return customer.id;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutSessionResult> {
  const appUrl = getAppUrl();
  const session = await getStripe().checkout.sessions.create({
    mode: params.mode,
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    // Carry the Supabase user id in BOTH places so the webhook can recover it
    // regardless of event shape.
    client_reference_id: params.userId,
    metadata: { user_id: params.userId, plan: params.plan },
    success_url: `${appUrl}/account?checkout=success`,
    cancel_url: `${appUrl}/account?checkout=cancel`,
  });
  return { url: session.url };
}

/**
 * Move a subscription onto a different Price (change-B, design D5 tier-race
 * correction). Swaps the single subscription item's Price. Idempotent: if the
 * subscription is already on `newPriceId`, this is a no-op. Subsequent renewals
 * bill the new Price (Stripe-native grandfathering).
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  newPriceId: string
): Promise<void> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  if (!item) return;
  if (item.price?.id === newPriceId) return; // already correct — no-op
  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: item.id, price: newPriceId }],
    // Tier correction at activation should not generate proration line items.
    proration_behavior: 'none',
  });
}

export async function createPortalSession(
  params: CreatePortalParams
): Promise<PortalSessionResult> {
  const appUrl = getAppUrl();
  const session = await getStripe().billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${appUrl}/account`,
  });
  return { url: session.url };
}

function unixToIso(seconds: unknown): string | null {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

const HANDLED_TYPES = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
]);

/**
 * Verifies the Stripe signature against the raw body, then maps the Stripe event
 * to a provider-agnostic domain event. Throws if the signature is invalid.
 */
export function verifyAndParseWebhook(
  rawBody: string,
  signature: string | null
): BillingDomainEvent {
  if (!signature) {
    throw new Error('Missing stripe-signature header');
  }
  // constructEvent throws on signature mismatch — callers map that to HTTP 400.
  const event = getStripe().webhooks.constructEvent(rawBody, signature, getWebhookSecret());

  const base = { eventId: event.id, eventType: event.type };

  if (!HANDLED_TYPES.has(event.type)) {
    return { kind: 'ignored', ...base };
  }

  const obj = (event.data.object ?? {}) as unknown as Record<string, unknown>;

  if (event.type === 'checkout.session.completed') {
    const metadata = (obj.metadata ?? {}) as Record<string, unknown>;
    const userId =
      (typeof obj.client_reference_id === 'string' && obj.client_reference_id) ||
      (typeof metadata.user_id === 'string' && metadata.user_id) ||
      null;
    const planRaw = metadata.plan;
    const plan: Plan = isValidPlan(planRaw) ? planRaw : 'monthly';
    if (!userId) {
      // Cannot attribute the session to a user — treat as ignored rather than throw.
      return { kind: 'ignored', ...base };
    }
    return {
      kind: 'subscription_activated',
      ...base,
      userId,
      plan,
      stripeCustomerId: typeof obj.customer === 'string' ? obj.customer : '',
      stripeSubscriptionId: typeof obj.subscription === 'string' ? obj.subscription : null,
      status: 'active',
      currentPeriodEnd: unixToIso(obj.current_period_end),
    };
  }

  if (event.type === 'customer.subscription.updated') {
    return {
      kind: 'subscription_status_changed',
      ...base,
      stripeSubscriptionId: String(obj.id),
      status: (obj.status as SubscriptionStatus) ?? 'active',
      currentPeriodEnd: unixToIso(obj.current_period_end),
      cancelAtPeriodEnd: Boolean(obj.cancel_at_period_end),
    };
  }

  if (event.type === 'customer.subscription.deleted') {
    return {
      kind: 'subscription_canceled',
      ...base,
      stripeSubscriptionId: String(obj.id),
    };
  }

  // invoice.paid
  const lines = (obj.lines ?? {}) as { data?: Array<{ period?: { end?: number } }> };
  const periodEnd = lines.data?.[0]?.period?.end;
  return {
    kind: 'invoice_paid',
    ...base,
    stripeSubscriptionId: String(obj.subscription),
    currentPeriodEnd: unixToIso(periodEnd),
  };
}
