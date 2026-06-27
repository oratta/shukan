/**
 * Early-switch CTA gating + copy (change-B, task 5.1, spec S16).
 *
 * A trialing user can switch to a paid subscription before the trial ends to lock
 * the founding discount available at payment time. The CTA is shown ONLY during an
 * active trial (not to expired trials or already-paying users). The actual claim +
 * permanent lock happens on payment success in the webhook (design D1/D5); this
 * module only decides whether to surface the invitation and provides honest copy.
 */

import { isEntitled, type SubscriptionState } from '@/lib/billing/entitlement';

/**
 * True only when the user is in an ACTIVE trial. Reuses `isEntitled` so trial
 * expiry is evaluated purely from `trial_end < now` (no status transition needed).
 */
export function shouldOfferEarlySwitch(
  sub: SubscriptionState | null,
  now: Date = new Date()
): boolean {
  if (!sub) return false;
  if (sub.status !== 'trialing') return false;
  return isEntitled(sub, now);
}

/**
 * Confirmation copy for the early-switch action. Honest about WHEN the discount is
 * locked (payment time, per design D5's predicted-vs-confirmed tier model) and free
 * of fake urgency / dark patterns (ブランド「うさんくさくない」/ 景表法).
 */
export function earlySwitchConfirmationCopy(): string {
  return (
    'Your founding discount is locked at the moment your payment completes, ' +
    'based on the slots remaining then. Switch whenever you are ready — there is ' +
    'no countdown.'
  );
}
