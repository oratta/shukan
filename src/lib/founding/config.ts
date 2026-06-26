/**
 * Founding-member configuration (change-B: founding-member-program).
 *
 * Tier caps and tier-specific Stripe Price IDs are resolved from environment /
 * settings values so boundary behavior can be tested with small caps and the
 * production values (50 / 200) are not hard-coded (design D2, spec: "Tier caps
 * are configurable").
 */

import type { Plan } from '@/lib/billing/config';

export type FoundingTier = 'founder_50' | 'founder_30';

/** Tier the claim resolved to. `none` means regular pricing (annual at 20% off). */
export type ResolvedTier = FoundingTier | 'none';

export const FOUNDING_TIERS: readonly FoundingTier[] = ['founder_50', 'founder_30'] as const;

const DEFAULT_CAP_50 = 50;
const DEFAULT_CAP_30 = 200;

export const DISCOUNT_PCT_BY_TIER: Record<FoundingTier, number> = {
  founder_50: 50,
  founder_30: 30,
};

export interface FoundingCaps {
  cap50: number;
  cap30: number;
}

function parseCap(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return parsed;
}

/**
 * Resolve tier caps from env (FOUNDING_CAP_50 / FOUNDING_CAP_30). Tests override
 * the env vars to exercise small-cap boundary behavior.
 */
export function getFoundingCaps(): FoundingCaps {
  return {
    cap50: parseCap(process.env.FOUNDING_CAP_50, DEFAULT_CAP_50),
    cap30: parseCap(process.env.FOUNDING_CAP_30, DEFAULT_CAP_30),
  };
}

/**
 * Tier-specific Stripe Price IDs. Only subscription plans (monthly/annual) carry
 * founding discounts; lifetime is a one-time purchase and has no tier price.
 *
 * Env naming convention mirrors the lookup_keys used by scripts/stripe-setup.ts:
 *   STRIPE_PRICE_FOUNDER50_MONTHLY / STRIPE_PRICE_FOUNDER50_ANNUAL
 *   STRIPE_PRICE_FOUNDER30_MONTHLY / STRIPE_PRICE_FOUNDER30_ANNUAL
 *   STRIPE_PRICE_ANNUAL (regular annual already carries the standard 20% off)
 *   STRIPE_PRICE_MONTHLY (regular monthly, no discount)
 */
type DiscountablePlan = Extract<Plan, 'monthly' | 'annual'>;

const TIER_PRICE_ENV: Record<FoundingTier, Record<DiscountablePlan, string>> = {
  founder_50: {
    monthly: 'STRIPE_PRICE_FOUNDER50_MONTHLY',
    annual: 'STRIPE_PRICE_FOUNDER50_ANNUAL',
  },
  founder_30: {
    monthly: 'STRIPE_PRICE_FOUNDER30_MONTHLY',
    annual: 'STRIPE_PRICE_FOUNDER30_ANNUAL',
  },
};

const REGULAR_PRICE_ENV: Record<DiscountablePlan, string> = {
  monthly: 'STRIPE_PRICE_MONTHLY',
  annual: 'STRIPE_PRICE_ANNUAL',
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Run scripts/stripe-setup.ts and copy the printed Price IDs into .env.local.`
    );
  }
  return value;
}

function isDiscountablePlan(plan: Plan): plan is DiscountablePlan {
  return plan === 'monthly' || plan === 'annual';
}

/**
 * Resolve the Stripe Price ID for a given (tier, plan). For `none` (caps reached)
 * the regular Price is used — the regular annual Price already includes the
 * standard 20% off per plan.md. Lifetime never carries a founding tier discount.
 */
export function resolveFoundingPriceId(tier: ResolvedTier, plan: Plan): string {
  if (plan === 'lifetime') {
    return requireEnv('STRIPE_PRICE_LIFETIME');
  }
  if (!isDiscountablePlan(plan)) {
    // Exhaustive guard; Plan is monthly|annual|lifetime so this is unreachable.
    throw new Error(`Unsupported plan for founding pricing: ${plan}`);
  }
  if (tier === 'none') {
    return requireEnv(REGULAR_PRICE_ENV[plan]);
  }
  return requireEnv(TIER_PRICE_ENV[tier][plan]);
}
