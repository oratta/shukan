/**
 * Billing configuration (change-A: stripe-billing-foundation).
 *
 * Central resolution of Stripe Price IDs, trial length, gated-action policy, and
 * secrets — all from environment / settings values so price, trial days, and the
 * gated-action set are adjustable without code changes (design D6).
 *
 * Secrets are read from env only and never hardcoded (config.yaml rule).
 */

export type Plan = 'monthly' | 'annual' | 'lifetime';

export const PLANS: readonly Plan[] = ['monthly', 'annual', 'lifetime'] as const;

const DEFAULT_TRIAL_DAYS = 14;

/** Default set of actions that are gated behind entitlement. Adjustable per call site. */
export const DEFAULT_GATED_ACTIONS: readonly string[] = ['create_habit'];

const PRICE_ENV_BY_PLAN: Record<Plan, string> = {
  monthly: 'STRIPE_PRICE_MONTHLY',
  annual: 'STRIPE_PRICE_ANNUAL',
  lifetime: 'STRIPE_PRICE_LIFETIME',
};

export function isValidPlan(value: unknown): value is Plan {
  return typeof value === 'string' && (PLANS as readonly string[]).includes(value);
}

/** Subscription plans use Checkout `subscription` mode; lifetime uses one-time `payment`. */
export function checkoutModeForPlan(plan: Plan): 'subscription' | 'payment' {
  return plan === 'lifetime' ? 'payment' : 'subscription';
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        `Set it in .env.local (see .env.local.example).`
    );
  }
  return value;
}

export function resolvePriceId(plan: Plan): string {
  return requireEnv(PRICE_ENV_BY_PLAN[plan]);
}

export function getTrialDays(): number {
  const raw = process.env.NEXT_PUBLIC_TRIAL_DAYS;
  if (!raw) return DEFAULT_TRIAL_DAYS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TRIAL_DAYS;
  return parsed;
}

export function getStripeSecretKey(): string {
  return requireEnv('STRIPE_SECRET_KEY');
}

export function getWebhookSecret(): string {
  return requireEnv('STRIPE_WEBHOOK_SECRET');
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
