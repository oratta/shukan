/**
 * Founding-slot claim + price correction, invoked from the payment-success
 * webhook (change-B, design D1/D5).
 *
 * This is the ONLY place a founding slot is consumed — never at sign-up or trial
 * start (spec: "Slot claim occurs only on payment success"). It runs after the
 * subscription is upserted, inside the same webhook processing, so the resolved
 * tier is recorded before the handler completes.
 *
 * Tier-race correction (D5): Checkout picked a Price from the PREDICTED tier, but
 * the authoritative claim happens here. If the confirmed tier differs (the
 * predicted tier filled up in between), the Stripe Subscription's Price is moved
 * to the confirmed tier's Price so all subsequent billing (grandfathered) uses the
 * correct amount.
 */

import { resolveFoundingPriceId } from './config';
import type { Plan } from '@/lib/billing/config';
import { claimFoundingSlot } from '@/lib/supabase/founding-admin';
import { updateSubscriptionPrice } from '@/lib/billing/provider';

export interface ApplyFoundingClaimInput {
  userId: string;
  plan: Plan;
  /** Stripe Subscription id; null for one-time (lifetime) — no correction possible. */
  stripeSubscriptionId: string | null;
}

export interface ApplyFoundingClaimResult {
  tier: string;
  discountPct: number;
  /** the Price the subscription should be on after correction (null when none/lifetime). */
  confirmedPriceId: string | null;
}

export async function applyFoundingClaim(
  input: ApplyFoundingClaimInput
): Promise<ApplyFoundingClaimResult> {
  // Lifetime is a one-time purchase: it carries no founding tier discount and has
  // no subscription to correct.
  if (input.plan === 'lifetime') {
    return { tier: 'none', discountPct: 0, confirmedPriceId: null };
  }

  const confirmedPriceFor = (tier: 'founder_50' | 'founder_30' | 'none'): string | null =>
    tier === 'none' ? null : resolveFoundingPriceId(tier, input.plan);

  // We don't yet know the confirmed tier, so record the to-be-confirmed price
  // after the RPC resolves. Pass null in; correct the row below if a slot landed.
  const claim = await claimFoundingSlot({ userId: input.userId, stripePriceId: null });

  const confirmedPriceId = confirmedPriceFor(claim.tier as 'founder_50' | 'founder_30' | 'none');

  // Correct the Stripe Subscription's Price to the confirmed tier's Price (D5).
  // Idempotent: moving to the same Price is a no-op on Stripe's side.
  if (confirmedPriceId && input.stripeSubscriptionId) {
    await updateSubscriptionPrice(input.stripeSubscriptionId, confirmedPriceId);
  }

  return { tier: claim.tier, discountPct: claim.discountPct, confirmedPriceId };
}
