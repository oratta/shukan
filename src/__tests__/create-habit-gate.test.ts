import { describe, it, expect } from 'vitest';
import { shouldBlockCreateHabit } from '@/lib/billing/create-habit-gate';
import { DEFAULT_GATED_ACTIONS } from '@/lib/billing/config';
import type { SubscriptionState } from '@/lib/billing/entitlement';

/**
 * billing-integration D8: gating the `create_habit` action on the home screen.
 *
 * The home "add habit" flow is protected by the same entitlement + gated-action
 * policy as PaywallGate (`create_habit` ∈ DEFAULT_GATED_ACTIONS). Entitled users
 * and active-trial users keep the original UX (form opens); only when the gate
 * applies is creation blocked and the user routed to the paywall/account flow.
 *
 * This pure decision is unit-tested; the dashboard wiring uses it to decide
 * whether to open the habit form or route to /account?upgrade=1.
 */

const NOW = new Date('2026-06-12T00:00:00Z');
const FUTURE = new Date('2026-06-20T00:00:00Z').toISOString();
const PAST = new Date('2026-06-01T00:00:00Z').toISOString();

function sub(overrides: Partial<SubscriptionState>): SubscriptionState {
  return {
    status: 'trialing',
    plan: null,
    trialEnd: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

describe('create_habit is a gated action by policy', () => {
  it('is part of the default gated-action set', () => {
    expect(DEFAULT_GATED_ACTIONS).toContain('create_habit');
  });
});

describe('shouldBlockCreateHabit', () => {
  it('does NOT block during an active trial (original UX preserved)', () => {
    expect(shouldBlockCreateHabit(sub({ status: 'trialing', trialEnd: FUTURE }), NOW)).toBe(false);
  });

  it('does NOT block an active subscriber', () => {
    expect(
      shouldBlockCreateHabit(sub({ status: 'active', plan: 'monthly', trialEnd: null }), NOW)
    ).toBe(false);
  });

  it('does NOT block a lifetime member regardless of period end', () => {
    expect(
      shouldBlockCreateHabit(
        sub({ status: 'active', plan: 'lifetime', currentPeriodEnd: PAST }),
        NOW
      )
    ).toBe(false);
  });

  it('blocks once the trial has expired', () => {
    expect(shouldBlockCreateHabit(sub({ status: 'trialing', trialEnd: PAST }), NOW)).toBe(true);
  });

  it('blocks when there is no subscription at all', () => {
    expect(shouldBlockCreateHabit(null, NOW)).toBe(true);
  });

  it('blocks a canceled subscription', () => {
    expect(shouldBlockCreateHabit(sub({ status: 'canceled', plan: 'monthly' }), NOW)).toBe(true);
  });

  it('honors a config where create_habit is NOT gated (never blocks)', () => {
    expect(
      shouldBlockCreateHabit(sub({ status: 'trialing', trialEnd: PAST }), NOW, { gatedActions: [] })
    ).toBe(false);
  });
});
