/**
 * Stripe Products / Prices setup script (change-A, task 1.2).
 *
 * Creates the monthly ($4.99), annual ($39.99), and lifetime ($99) Products and
 * Prices in Stripe TEST mode. All Prices are created with `tax_behavior: inclusive`
 * (tax-inclusive total pricing) so the amount charged at Checkout equals the
 * displayed tax-inclusive amount — required by change-D (総額表示). NOTE:
 * `tax_behavior` CANNOT be changed after a Price is created.
 *
 * Usage (after putting a real test-mode key in .env.local):
 *
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts
 *     # or, if the key is already exported in your shell / .env.local:
 *   node --import tsx scripts/stripe-setup.ts
 *
 * Then copy the printed Price IDs into .env.local:
 *
 *   STRIPE_PRICE_MONTHLY=price_...
 *   STRIPE_PRICE_ANNUAL=price_...        # regular annual already carries 20% off
 *   STRIPE_PRICE_LIFETIME=price_...
 *   STRIPE_PRICE_FOUNDER50_MONTHLY=price_...   # change-B founding tiers
 *   STRIPE_PRICE_FOUNDER50_ANNUAL=price_...
 *   STRIPE_PRICE_FOUNDER30_MONTHLY=price_...
 *   STRIPE_PRICE_FOUNDER30_ANNUAL=price_...
 *
 * Dry run / safety: if STRIPE_SECRET_KEY is missing, the script exits with a
 * descriptive error and does NOT call the Stripe API.
 */

import Stripe from 'stripe';

interface PlanSpec {
  /** env var the printed Price ID is copied into. */
  envKey: string;
  /** lookup_key on the Price for machine-friendly lookup. */
  lookupKey: string;
  productName: string;
  /** Amount in the smallest currency unit (USD cents). */
  unitAmount: number;
  recurring?: { interval: 'month' | 'year' };
}

// Default values from plan.md (adjustable). Currency: USD.
// Founding tiers: founder_50 = 50% off, founder_30 = 30% off. The regular annual
// Price already includes the standard 20% off (plan.md), so founding annual prices
// are computed off the FULL annual list ($39.99) per their tier discount.
const MONTHLY_FULL = 499; // $4.99
const ANNUAL_FULL = 3999; // $39.99 (this Price IS the regular "20% off" annual)
const LIFETIME = 9900; // $99 one-time

function pct(amount: number, off: number): number {
  return Math.round(amount * (1 - off / 100));
}

const PLAN_SPECS: PlanSpec[] = [
  {
    envKey: 'STRIPE_PRICE_MONTHLY',
    lookupKey: 'monthly',
    productName: 'Smitch Monthly',
    unitAmount: MONTHLY_FULL,
    recurring: { interval: 'month' },
  },
  {
    envKey: 'STRIPE_PRICE_ANNUAL',
    lookupKey: 'annual',
    productName: 'Smitch Annual',
    unitAmount: ANNUAL_FULL,
    recurring: { interval: 'year' },
  },
  {
    envKey: 'STRIPE_PRICE_LIFETIME',
    lookupKey: 'lifetime',
    productName: 'Smitch Lifetime',
    unitAmount: LIFETIME,
  },
  // change-B: founding-tier discounted Prices.
  {
    envKey: 'STRIPE_PRICE_FOUNDER50_MONTHLY',
    lookupKey: 'founder50_monthly',
    productName: 'Smitch Monthly (Founding 50% off)',
    unitAmount: pct(MONTHLY_FULL, 50),
    recurring: { interval: 'month' },
  },
  {
    envKey: 'STRIPE_PRICE_FOUNDER50_ANNUAL',
    lookupKey: 'founder50_annual',
    productName: 'Smitch Annual (Founding 50% off)',
    unitAmount: pct(ANNUAL_FULL, 50),
    recurring: { interval: 'year' },
  },
  {
    envKey: 'STRIPE_PRICE_FOUNDER30_MONTHLY',
    lookupKey: 'founder30_monthly',
    productName: 'Smitch Monthly (Founding 30% off)',
    unitAmount: pct(MONTHLY_FULL, 30),
    recurring: { interval: 'month' },
  },
  {
    envKey: 'STRIPE_PRICE_FOUNDER30_ANNUAL',
    lookupKey: 'founder30_annual',
    productName: 'Smitch Annual (Founding 30% off)',
    unitAmount: pct(ANNUAL_FULL, 30),
    recurring: { interval: 'year' },
  },
];

async function main(): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Put a test-mode key (sk_test_...) in .env.local ' +
        'or export it before running. This script will not call Stripe without it.'
    );
  }
  if (secretKey.startsWith('sk_live_')) {
    throw new Error(
      'Refusing to run against a LIVE key. Use a test-mode key (sk_test_...) for setup.'
    );
  }

  const stripe = new Stripe(secretKey);
  const results: Array<{ envKey: string; id: string }> = [];

  for (const spec of PLAN_SPECS) {
    const product = await stripe.products.create({ name: spec.productName });
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: spec.unitAmount,
      lookup_key: spec.lookupKey,
      // REQUIRED by change-D: tax-inclusive total pricing. Immutable after creation.
      tax_behavior: 'inclusive',
      ...(spec.recurring ? { recurring: spec.recurring } : {}),
    });
    results.push({ envKey: spec.envKey, id: price.id });
    console.log(`Created ${spec.lookupKey}: product=${product.id} price=${price.id}`);
  }

  console.log('\nAdd these to .env.local:');
  for (const { envKey, id } of results) {
    console.log(`${envKey}=${id}`);
  }
}

main().catch((err) => {
  console.error('[stripe-setup] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
