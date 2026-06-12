/**
 * Checkout flow state machine (billing-integration, D8).
 *
 * Enforces 改正特商法 / acceptance condition 18: the final confirmation screen is
 * the ONLY path to Stripe Checkout. Selecting a plan can never directly emit a
 * checkout intent — it only moves the flow into the `confirming` phase. The
 * checkout intent (`checkoutPlan`) is produced exclusively by CONFIRM, and only
 * when a plan was previously selected. This pure reducer makes that invariant
 * testable without a DOM.
 */

import type { Plan } from './config';

export type CheckoutPhase = 'idle' | 'confirming' | 'checkout';

export interface CheckoutFlowState {
  phase: CheckoutPhase;
  /** The plan currently under confirmation (null in idle). */
  selectedPlan: Plan | null;
  /** Non-null ONLY once the user has confirmed — the signal to POST checkout. */
  checkoutPlan: Plan | null;
}

export type CheckoutFlowAction =
  | { type: 'SELECT_PLAN'; plan: Plan }
  | { type: 'CONFIRM' }
  | { type: 'BACK' }
  | { type: 'RESET' };

export function initialCheckoutFlow(): CheckoutFlowState {
  return { phase: 'idle', selectedPlan: null, checkoutPlan: null };
}

export function checkoutFlowReducer(
  state: CheckoutFlowState,
  action: CheckoutFlowAction
): CheckoutFlowState {
  switch (action.type) {
    case 'SELECT_PLAN':
      // Move to confirmation — never straight to checkout (condition 18).
      return { phase: 'confirming', selectedPlan: action.plan, checkoutPlan: null };

    case 'CONFIRM':
      // Only valid from the confirming phase, where a plan is already selected.
      if (state.phase !== 'confirming' || !state.selectedPlan) return state;
      return { phase: 'checkout', selectedPlan: state.selectedPlan, checkoutPlan: state.selectedPlan };

    case 'BACK':
    case 'RESET':
      return initialCheckoutFlow();

    default:
      return state;
  }
}
