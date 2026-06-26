import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// change-A S2: Price IDs resolved from environment
// change-A S20: Trial length is configurable
// Tasks: 3.1

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function loadConfig() {
  // config functions read process.env at call time, so a single import is fine.
  return import('@/lib/billing/config');
}

describe('billing config: price ID resolution (S2)', () => {
  it('resolves the monthly/annual/lifetime price IDs from env', async () => {
    process.env.STRIPE_PRICE_MONTHLY = 'price_monthly_123';
    process.env.STRIPE_PRICE_ANNUAL = 'price_annual_456';
    process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime_789';

    const { resolvePriceId } = await loadConfig();

    expect(resolvePriceId('monthly')).toBe('price_monthly_123');
    expect(resolvePriceId('annual')).toBe('price_annual_456');
    expect(resolvePriceId('lifetime')).toBe('price_lifetime_789');
  });

  it('throws a descriptive configuration error when a price env var is missing', async () => {
    delete process.env.STRIPE_PRICE_MONTHLY;
    process.env.STRIPE_PRICE_ANNUAL = 'price_annual_456';
    process.env.STRIPE_PRICE_LIFETIME = 'price_lifetime_789';

    const { resolvePriceId } = await loadConfig();

    expect(() => resolvePriceId('monthly')).toThrow(/STRIPE_PRICE_MONTHLY/);
  });

  it('maps subscription plans to subscription mode and lifetime to payment mode', async () => {
    const { checkoutModeForPlan } = await loadConfig();
    expect(checkoutModeForPlan('monthly')).toBe('subscription');
    expect(checkoutModeForPlan('annual')).toBe('subscription');
    expect(checkoutModeForPlan('lifetime')).toBe('payment');
  });

  it('rejects unknown plan values', async () => {
    const { isValidPlan } = await loadConfig();
    expect(isValidPlan('monthly')).toBe(true);
    expect(isValidPlan('annual')).toBe(true);
    expect(isValidPlan('lifetime')).toBe(true);
    expect(isValidPlan('weekly')).toBe(false);
    expect(isValidPlan('')).toBe(false);
    expect(isValidPlan(undefined)).toBe(false);
  });
});

describe('billing config: trial days (S20)', () => {
  it('defaults to 14 days when NEXT_PUBLIC_TRIAL_DAYS is unset or empty', async () => {
    delete process.env.NEXT_PUBLIC_TRIAL_DAYS;
    const { getTrialDays } = await loadConfig();
    expect(getTrialDays()).toBe(14);
  });

  it('reads a non-default trial-days value from configuration without code changes', async () => {
    process.env.NEXT_PUBLIC_TRIAL_DAYS = '3';
    const { getTrialDays } = await loadConfig();
    expect(getTrialDays()).toBe(3);
  });

  it('falls back to default when the value is non-numeric', async () => {
    process.env.NEXT_PUBLIC_TRIAL_DAYS = 'abc';
    const { getTrialDays } = await loadConfig();
    expect(getTrialDays()).toBe(14);
  });
});

describe('billing config: secret resolution', () => {
  it('throws a descriptive error when STRIPE_SECRET_KEY is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { getStripeSecretKey } = await loadConfig();
    expect(() => getStripeSecretKey()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it('throws a descriptive error when STRIPE_WEBHOOK_SECRET is missing', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { getWebhookSecret } = await loadConfig();
    expect(() => getWebhookSecret()).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });
});
