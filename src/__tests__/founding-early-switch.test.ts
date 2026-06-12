import { describe, it, expect } from 'vitest';
import {
  shouldOfferEarlySwitch,
  earlySwitchConfirmationCopy,
} from '@/lib/founding/early-switch';
import type { SubscriptionState } from '@/lib/billing/entitlement';

// change-B S16: Early switch during trial locks the discount (CTA gating + honest copy)
// Tasks: 5.1

const future = new Date(Date.now() + 7 * 86400_000).toISOString();
const past = new Date(Date.now() - 86400_000).toISOString();

const trialing = (trialEnd: string): SubscriptionState => ({
  status: 'trialing',
  plan: null,
  trialEnd,
  currentPeriodEnd: null,
});

describe('shouldOfferEarlySwitch (S16 / task 5.1)', () => {
  it('offers the early-switch CTA to a user in an active trial', () => {
    expect(shouldOfferEarlySwitch(trialing(future))).toBe(true);
  });

  it('does not offer it once the trial has expired', () => {
    expect(shouldOfferEarlySwitch(trialing(past))).toBe(false);
  });

  it('does not offer it to an already-active subscriber', () => {
    expect(
      shouldOfferEarlySwitch({ status: 'active', plan: 'monthly', trialEnd: null, currentPeriodEnd: future })
    ).toBe(false);
  });

  it('does not offer it when there is no subscription row', () => {
    expect(shouldOfferEarlySwitch(null)).toBe(false);
  });
});

describe('earlySwitchConfirmationCopy (honest, no fake urgency)', () => {
  it('states the discount locks at payment time, not before (design D5)', () => {
    const copy = earlySwitchConfirmationCopy();
    expect(copy.toLowerCase()).toContain('payment');
    // No fake countdown / scarcity language (ブランド: うさんくさくない / 景表法)
    expect(copy.toLowerCase()).not.toMatch(/hurry|act now|expires in|last chance/);
  });
});
