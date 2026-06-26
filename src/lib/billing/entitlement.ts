/**
 * Entitlement evaluation (change-A).
 *
 * The `subscriptions` table is the source of truth (design D4). Entitlement is a
 * pure function of the row, computed identically wherever it is needed (UI gate,
 * and a future server-side enforcement). Trial expiry requires NO status
 * transition: it is evaluated purely from `trial_end < now` (spec S21).
 */

import { DEFAULT_GATED_ACTIONS, type Plan } from './config';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'incomplete';

export interface SubscriptionState {
  status: SubscriptionStatus;
  plan: Plan | null;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
}

/**
 * Entitled when:
 * - plan is `lifetime` and status active (permanent, ignores period end), OR
 * - status is `active` (any subscription plan), OR
 * - status is `trialing` and `trial_end` is in the future.
 */
export function isEntitled(sub: SubscriptionState | null, now: Date = new Date()): boolean {
  if (!sub) return false;

  // Lifetime grants permanent access regardless of current_period_end / trial.
  if (sub.plan === 'lifetime' && sub.status === 'active') return true;

  if (sub.status === 'active') return true;

  if (sub.status === 'trialing') {
    if (!sub.trialEnd) return false;
    return new Date(sub.trialEnd).getTime() > now.getTime();
  }

  // canceled / past_due / incomplete are not entitled.
  return false;
}

export interface GateConfig {
  gatedActions: readonly string[];
}

/** Whether an action is gated, driven by configuration rather than hardcoded logic. */
export function isGatedAction(
  action: string,
  config: GateConfig = { gatedActions: DEFAULT_GATED_ACTIONS }
): boolean {
  return config.gatedActions.includes(action);
}
