/**
 * Trial-remaining derivation (billing-integration, D8).
 *
 * The /account page shows "N days left in your trial" computed purely from the
 * `subscriptions` row (design D4 — never queries Stripe). Partial days round UP
 * so a user who is part-way through a calendar day still sees that day counted.
 * Returns `null` whenever there is no meaningful trial countdown to show
 * (no subscription, not trialing, or trial_end absent).
 *
 * Kept separate from trial.ts (which starts a trial via the server-only admin
 * client) so this pure helper can be imported into client components safely.
 */

import type { SubscriptionState } from './entitlement';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function trialDaysRemaining(
  sub: SubscriptionState | null,
  now: Date = new Date()
): number | null {
  if (!sub) return null;
  if (sub.status !== 'trialing') return null;
  if (!sub.trialEnd) return null;

  const end = new Date(sub.trialEnd).getTime();
  const diffMs = end - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / MS_PER_DAY);
}
