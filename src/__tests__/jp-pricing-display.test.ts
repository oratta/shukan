import { describe, it, expect } from 'vitest';

/**
 * change-D S6: Displayed price is tax-inclusive and matches the charged amount.
 * Tasks: 5.1
 *
 * The display utility is the single source of consumer-facing price strings.
 * It must (a) emit a 税込 indication, (b) emit the exact configured amount that
 * equals the amount charged at Checkout (tax_behavior: inclusive — no extra tax
 * is added on top of the displayed figure), and (c) provide the per-cycle price
 * plus the annual total for the final confirmation screen.
 */

describe('jp pricing display (S6)', () => {
  it('formats every plan price as a tax-inclusive total with a 税込 indication', async () => {
    const { formatTaxInclusivePrice, CONSUMER_PRICES } = await import(
      '@/lib/billing/pricing'
    );

    for (const plan of ['monthly', 'annual', 'lifetime'] as const) {
      const out = formatTaxInclusivePrice(plan, 'ja');
      // Tax-inclusive marker present
      expect(out).toContain('税込');
      // The exact configured amount appears in the rendered string
      expect(out).toContain(CONSUMER_PRICES[plan].amount.toFixed(2));
    }
  });

  it('uses the configured default amounts ($4.99 / $39.99 / $99)', async () => {
    const { CONSUMER_PRICES } = await import('@/lib/billing/pricing');
    expect(CONSUMER_PRICES.monthly.amount).toBe(4.99);
    expect(CONSUMER_PRICES.annual.amount).toBe(39.99);
    expect(CONSUMER_PRICES.lifetime.amount).toBe(99);
  });

  it('treats all amounts as tax-inclusive so display equals charge (no added tax)', async () => {
    const { CONSUMER_PRICES, chargedAmount } = await import('@/lib/billing/pricing');
    for (const plan of ['monthly', 'annual', 'lifetime'] as const) {
      // The amount charged at Checkout (tax_behavior: inclusive) equals the
      // displayed amount — no tax is added on top.
      expect(chargedAmount(plan)).toBe(CONSUMER_PRICES[plan].amount);
    }
  });

  it('reports the annual total payable for a subscription (per-cycle x cycles/year)', async () => {
    const { annualTotal } = await import('@/lib/billing/pricing');
    // Monthly billed 12x/year → 4.99 * 12
    expect(annualTotal('monthly')).toBeCloseTo(4.99 * 12, 2);
    // Annual billed once/year → the annual amount itself
    expect(annualTotal('annual')).toBeCloseTo(39.99, 2);
  });

  it('marks subscription plans as recurring and lifetime as one-time', async () => {
    const { isRecurringPlan } = await import('@/lib/billing/pricing');
    expect(isRecurringPlan('monthly')).toBe(true);
    expect(isRecurringPlan('annual')).toBe(true);
    expect(isRecurringPlan('lifetime')).toBe(false);
  });
});
