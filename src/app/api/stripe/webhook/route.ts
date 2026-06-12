import { NextResponse } from 'next/server';
import { verifyAndParseWebhook, type BillingDomainEvent } from '@/lib/billing/provider';
import {
  isEventProcessed,
  markEventProcessed,
  upsertSubscriptionFromEvent,
  updateSubscriptionByStripeId,
} from '@/lib/supabase/subscriptions-admin';

/**
 * POST /api/stripe/webhook (change-A, design D1/D2/D7).
 *
 * Placed OUTSIDE the middleware matcher so unauthenticated Stripe servers reach
 * it. Reads the RAW body for signature verification, then dispatches a
 * provider-agnostic domain event. Idempotent: duplicate event IDs are no-ops.
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: BillingDomainEvent;
  try {
    event = verifyAndParseWebhook(rawBody, signature);
  } catch {
    // Signature missing/invalid — reject with no side effects.
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.kind === 'ignored') {
    return NextResponse.json({ received: true });
  }

  // Idempotency: skip events already processed (design D2).
  if (await isEventProcessed(event.eventId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await dispatch(event);
  await markEventProcessed(event.eventId, event.eventType);

  return NextResponse.json({ received: true });
}

async function dispatch(event: BillingDomainEvent): Promise<void> {
  switch (event.kind) {
    case 'subscription_activated':
      await upsertSubscriptionFromEvent({
        userId: event.userId,
        status: event.status,
        plan: event.plan,
        stripeCustomerId: event.stripeCustomerId,
        stripeSubscriptionId: event.stripeSubscriptionId,
        currentPeriodEnd: event.currentPeriodEnd,
      });
      return;
    case 'subscription_status_changed':
      await updateSubscriptionByStripeId(event.stripeSubscriptionId, {
        status: event.status,
        currentPeriodEnd: event.currentPeriodEnd,
        cancelAtPeriodEnd: event.cancelAtPeriodEnd,
      });
      return;
    case 'subscription_canceled':
      await updateSubscriptionByStripeId(event.stripeSubscriptionId, { status: 'canceled' });
      return;
    case 'invoice_paid':
      await updateSubscriptionByStripeId(event.stripeSubscriptionId, {
        status: 'active',
        currentPeriodEnd: event.currentPeriodEnd,
      });
      return;
    case 'ignored':
      return;
  }
}
