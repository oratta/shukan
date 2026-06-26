/**
 * Consumer-facing price display (change-D: jp-legal-compliance).
 *
 * Single source of truth for prices shown to consumers. All amounts are treated
 * as TAX-INCLUSIVE totals (総額表示 — Consumption Tax Act) so the displayed figure
 * equals the amount charged at Stripe Checkout (Stripe Price `tax_behavior:
 * inclusive`, design D3). No display surface adds tax on top of these numbers.
 *
 * Default amounts mirror src/lib/billing/config.ts plan economics:
 *   monthly $4.99 / annual $39.99 / lifetime $99.
 */

import type { Plan } from '@/lib/billing/config';

export type Locale = 'en' | 'ja';

export interface ConsumerPrice {
  /** Tax-inclusive amount in the display currency. */
  amount: number;
  /** ISO currency code. */
  currency: 'USD';
  /** Billing cadence; `null` means a one-time (non-recurring) charge. */
  cadence: 'monthly' | 'annual' | null;
}

export const CONSUMER_PRICES: Record<Plan, ConsumerPrice> = {
  monthly: { amount: 4.99, currency: 'USD', cadence: 'monthly' },
  annual: { amount: 39.99, currency: 'USD', cadence: 'annual' },
  lifetime: { amount: 99, currency: 'USD', cadence: null },
};

/** Subscription plans recur; lifetime is a one-time purchase. */
export function isRecurringPlan(plan: Plan): boolean {
  return CONSUMER_PRICES[plan].cadence !== null;
}

/**
 * Amount actually charged at Checkout. Because Stripe Prices are tax-inclusive,
 * this equals the displayed amount — there is no separate tax line added on top.
 */
export function chargedAmount(plan: Plan): number {
  return CONSUMER_PRICES[plan].amount;
}

/** Bare currency string (e.g. "$4.99"). */
export function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

const TAX_INCLUSIVE_LABEL: Record<Locale, string> = {
  ja: '税込',
  en: 'tax incl.',
};

/**
 * Consumer-facing price string with an explicit tax-inclusive marker, e.g.
 * "$4.99（税込）". The ja form is authoritative for the 総額表示 requirement.
 */
export function formatTaxInclusivePrice(plan: Plan, locale: Locale = 'ja'): string {
  const { amount } = CONSUMER_PRICES[plan];
  const marker = TAX_INCLUSIVE_LABEL[locale];
  return locale === 'ja'
    ? `${formatAmount(amount)}（${marker}）`
    : `${formatAmount(amount)} (${marker})`;
}

/**
 * Total payable over one year for a recurring plan — used by the final
 * confirmation screen's「一定期間の支払総額」requirement (改正特商法 第12条の6).
 * For monthly this is the per-cycle price × 12; for annual it is the annual
 * amount itself. Lifetime (non-recurring) returns its one-time amount.
 */
export function annualTotal(plan: Plan): number {
  const { amount, cadence } = CONSUMER_PRICES[plan];
  if (cadence === 'monthly') return amount * 12;
  return amount;
}

/** Tax-inclusive annual-total string for the confirmation screen. */
export function formatAnnualTotal(plan: Plan, locale: Locale = 'ja'): string {
  const total = annualTotal(plan);
  const marker = TAX_INCLUSIVE_LABEL[locale];
  return locale === 'ja'
    ? `${formatAmount(total)}（${marker}）`
    : `${formatAmount(total)} (${marker})`;
}
