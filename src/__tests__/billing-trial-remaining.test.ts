import { describe, it, expect } from 'vitest';
import { trialDaysRemaining } from '@/lib/billing/trial-status';
import type { SubscriptionState } from '@/lib/billing/entitlement';

/**
 * billing-integration: /account trial-remaining display.
 *
 * The account page shows "trial days remaining" derived purely from the
 * subscriptions row (no Stripe call). Rounds UP partial days so a user mid-day
 * still sees the day they are currently in. Returns null for non-trial states.
 */

const NOW = new Date('2026-06-12T00:00:00Z');

function sub(overrides: Partial<SubscriptionState>): SubscriptionState {
  return {
    status: 'trialing',
    plan: null,
    trialEnd: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

describe('trialDaysRemaining', () => {
  it('returns whole days remaining, rounding up partial days', () => {
    const trialEnd = new Date('2026-06-19T00:00:00Z').toISOString();
    expect(trialDaysRemaining(sub({ status: 'trialing', trialEnd }), NOW)).toBe(7);
  });

  it('rounds a partial day up to the next whole day', () => {
    // 6.5 days away → 7
    const trialEnd = new Date('2026-06-18T12:00:00Z').toISOString();
    expect(trialDaysRemaining(sub({ status: 'trialing', trialEnd }), NOW)).toBe(7);
  });

  it('returns 0 when the trial has already ended', () => {
    const trialEnd = new Date('2026-06-01T00:00:00Z').toISOString();
    expect(trialDaysRemaining(sub({ status: 'trialing', trialEnd }), NOW)).toBe(0);
  });

  it('returns null for a non-trialing subscription', () => {
    expect(
      trialDaysRemaining(sub({ status: 'active', plan: 'monthly', trialEnd: null }), NOW)
    ).toBeNull();
  });

  it('returns null when there is no subscription', () => {
    expect(trialDaysRemaining(null, NOW)).toBeNull();
  });

  it('returns null when trialing but trial_end is missing', () => {
    expect(trialDaysRemaining(sub({ status: 'trialing', trialEnd: null }), NOW)).toBeNull();
  });
});
