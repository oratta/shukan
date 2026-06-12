import { describe, it, expect, afterEach } from 'vitest';
import {
  getFoundingCaps,
  resolveFoundingPriceId,
  DISCOUNT_PCT_BY_TIER,
} from '@/lib/founding/config';

// change-B S18: caps are configurable via env (small caps for boundary tests)
// change-B S10: tier-specific Price ID resolution
// change-B S5: regular pricing fallback uses regular Price (annual = 20% off)
// Tasks: 2.1, 3.1, 3.3

const ENV_KEYS = [
  'FOUNDING_CAP_50',
  'FOUNDING_CAP_30',
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_ANNUAL',
  'STRIPE_PRICE_LIFETIME',
  'STRIPE_PRICE_FOUNDER50_MONTHLY',
  'STRIPE_PRICE_FOUNDER50_ANNUAL',
  'STRIPE_PRICE_FOUNDER30_MONTHLY',
  'STRIPE_PRICE_FOUNDER30_ANNUAL',
];

afterEach(() => {
  for (const k of ENV_KEYS) delete process.env[k];
});

describe('getFoundingCaps (S18 / config)', () => {
  it('defaults to production caps 50 / 200 when env is unset', () => {
    expect(getFoundingCaps()).toEqual({ cap50: 50, cap30: 200 });
  });

  it('reads small caps from env for boundary testing', () => {
    process.env.FOUNDING_CAP_50 = '2';
    process.env.FOUNDING_CAP_30 = '3';
    expect(getFoundingCaps()).toEqual({ cap50: 2, cap30: 3 });
  });

  it('falls back to defaults on invalid (non-integer / negative) values', () => {
    process.env.FOUNDING_CAP_50 = 'abc';
    process.env.FOUNDING_CAP_30 = '-5';
    expect(getFoundingCaps()).toEqual({ cap50: 50, cap30: 200 });
  });
});

describe('resolveFoundingPriceId (S10 / S5)', () => {
  it('S10: founder_50 monthly resolves the founder_50 monthly Price', () => {
    process.env.STRIPE_PRICE_FOUNDER50_MONTHLY = 'price_f50_m';
    expect(resolveFoundingPriceId('founder_50', 'monthly')).toBe('price_f50_m');
  });

  it('S10: founder_30 annual resolves the founder_30 annual Price', () => {
    process.env.STRIPE_PRICE_FOUNDER30_ANNUAL = 'price_f30_a';
    expect(resolveFoundingPriceId('founder_30', 'annual')).toBe('price_f30_a');
  });

  it('S5: none (caps reached) monthly resolves the regular monthly Price', () => {
    process.env.STRIPE_PRICE_MONTHLY = 'price_reg_m';
    expect(resolveFoundingPriceId('none', 'monthly')).toBe('price_reg_m');
  });

  it('S5: none annual resolves the regular annual Price (carries standard 20% off)', () => {
    process.env.STRIPE_PRICE_ANNUAL = 'price_reg_a';
    expect(resolveFoundingPriceId('none', 'annual')).toBe('price_reg_a');
  });

  it('lifetime ignores tier and resolves the lifetime Price', () => {
    process.env.STRIPE_PRICE_LIFETIME = 'price_life';
    expect(resolveFoundingPriceId('founder_50', 'lifetime')).toBe('price_life');
    expect(resolveFoundingPriceId('none', 'lifetime')).toBe('price_life');
  });

  it('throws a descriptive error when a tier Price env is missing', () => {
    expect(() => resolveFoundingPriceId('founder_50', 'monthly')).toThrow(
      /STRIPE_PRICE_FOUNDER50_MONTHLY/
    );
  });
});

describe('DISCOUNT_PCT_BY_TIER', () => {
  it('maps tiers to their discount percentages', () => {
    expect(DISCOUNT_PCT_BY_TIER).toEqual({ founder_50: 50, founder_30: 30 });
  });
});
