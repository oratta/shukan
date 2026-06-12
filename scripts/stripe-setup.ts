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
 *   STRIPE_PRICE_ANNUAL=price_...
 *   STRIPE_PRICE_LIFETIME=price_...
 *
 * Dry run / safety: if STRIPE_SECRET_KEY is missing, the script exits with a
 * descriptive error and does NOT call the Stripe API.
 */

import Stripe from 'stripe';

interface PlanSpec {
  key: 'monthly' | 'annual' | 'lifetime';
  productName: string;
  /** Amount in the smallest currency unit (USD cents). */
  unitAmount: number;
  recurring?: { interval: 'month' | 'year' };
}

// Default values from plan.md (adjustable). Currency: USD.
const PLAN_SPECS: PlanSpec[] = [
  {
    key: 'monthly',
    productName: 'Smitch Monthly',
    unitAmount: 499, // $4.99
    recurring: { interval: 'month' },
  },
  {
    key: 'annual',
    productName: 'Smitch Annual',
    unitAmount: 3999, // $39.99
    recurring: { interval: 'year' },
  },
  {
    key: 'lifetime',
    productName: 'Smitch Lifetime',
    unitAmount: 9900, // $99 one-time
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
  const results: Record<string, string> = {};

  for (const spec of PLAN_SPECS) {
    const product = await stripe.products.create({ name: spec.productName });
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: spec.unitAmount,
      // REQUIRED by change-D: tax-inclusive total pricing. Immutable after creation.
      tax_behavior: 'inclusive',
      ...(spec.recurring ? { recurring: spec.recurring } : {}),
    });
    results[spec.key] = price.id;
    console.log(`Created ${spec.key}: product=${product.id} price=${price.id}`);
  }

  console.log('\nAdd these to .env.local:');
  console.log(`STRIPE_PRICE_MONTHLY=${results.monthly}`);
  console.log(`STRIPE_PRICE_ANNUAL=${results.annual}`);
  console.log(`STRIPE_PRICE_LIFETIME=${results.lifetime}`);
}

main().catch((err) => {
  console.error('[stripe-setup] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
