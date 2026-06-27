'use client';

import { type ReactNode } from 'react';
import {
  isEntitled,
  isGatedAction,
  type SubscriptionState,
} from '@/lib/billing/entitlement';
import { DEFAULT_GATED_ACTIONS } from '@/lib/billing/config';

interface PaywallGateProps {
  /** The action being protected (e.g. 'create_habit'). */
  action: string;
  /** Current subscription state (source of truth). */
  subscription: SubscriptionState | null;
  /** Children rendered when the user is entitled or the action is not gated. */
  children: ReactNode;
  /** Configurable set of gated actions; defaults to the policy in config. */
  gatedActions?: readonly string[];
  /** Injectable clock for testing. */
  now?: Date;
  /** Optional override for what happens when the upgrade CTA is clicked. */
  onUpgrade?: () => void;
}

/**
 * Paywall gate (change-A, design D6/D4).
 *
 * Blocks a gated action when the user is not entitled and presents an upgrade
 * prompt with a CTA leading toward Checkout. Which actions are gated is driven by
 * configuration (`gatedActions`), not hardcoded — so the gate logic never changes
 * when policy changes (spec S24). Entitlement reads only from `subscriptions`.
 *
 * The actual Checkout call goes through an explicit confirmation step (the CTA),
 * so change-D can insert the legally-required final confirmation screen before
 * POSTing to /api/stripe/checkout.
 */
export function PaywallGate({
  action,
  subscription,
  children,
  gatedActions = DEFAULT_GATED_ACTIONS,
  now,
  onUpgrade,
}: PaywallGateProps) {
  const gated = isGatedAction(action, { gatedActions });

  // Not a gated action, or user is entitled → render protected content.
  if (!gated || isEntitled(subscription, now)) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    // Default: route the user toward the billing / checkout confirmation flow.
    if (typeof window !== 'undefined') {
      window.location.href = '/account?upgrade=1';
    }
  };

  return (
    <div role="dialog" aria-label="Upgrade required" data-paywall-gate="blocked">
      <p>Your trial has ended. Continue with a Smitch plan to keep going.</p>
      <button type="button" onClick={handleUpgrade}>
        Choose a plan
      </button>
    </div>
  );
}
