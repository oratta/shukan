/**
 * create_habit action gate (billing-integration, D8).
 *
 * The home "add habit" flow is gated behind entitlement using the SAME policy as
 * PaywallGate: an action is gated when it is in the configured gated-action set
 * (default includes `create_habit`), and blocked only when the user is not
 * entitled. Entitled users and active-trial users see no change — the habit form
 * opens exactly as before. This keeps the gate logic in one place (spec S24) and
 * the existing UX intact.
 */

import {
  isEntitled,
  isGatedAction,
  type GateConfig,
  type SubscriptionState,
} from './entitlement';
import { DEFAULT_GATED_ACTIONS } from './config';

const CREATE_HABIT_ACTION = 'create_habit';

export function shouldBlockCreateHabit(
  subscription: SubscriptionState | null,
  now: Date = new Date(),
  config: GateConfig = { gatedActions: DEFAULT_GATED_ACTIONS }
): boolean {
  if (!isGatedAction(CREATE_HABIT_ACTION, config)) return false;
  return !isEntitled(subscription, now);
}
