import type { AccountBillingMessages } from '@/components/billing/account-billing';

/**
 * Minimal shape of a next-intl translator used by the /account screen.
 * `t(key)` formats a message; `t.raw(key)` returns the un-formatted template.
 */
export interface AccountTranslator {
  (key: string): string;
  raw(key: string): unknown;
}

/**
 * Builds the AccountBillingMessages props for the /account screen (change-D, D12).
 *
 * Keys whose messages contain ICU placeholders ({price}, {plan}, {days},
 * {remaining}/{cap}, {total}) MUST be passed as RAW templates: the downstream
 * view components (AccountBilling / FinalConfirmation) interpolate them
 * themselves from src/lib/billing/pricing.ts — the single source of truth for
 * tax-inclusive totals (displayed amount == amount charged; change-D invariant).
 *
 * Resolving a placeholder message via plain `t(key)` (no values) throws the
 * runtime FORMATTING_ERROR that broke /account. We therefore use `t.raw(key)`
 * for those keys so the templates flow through untouched, and `t(key)` for the
 * plain (placeholder-free) keys.
 */
export function buildAccountBillingMessages(
  tAccount: AccountTranslator,
  tCheckout: AccountTranslator,
  // Back-compat overloads (older call sites / tests passed raw accessors
  // separately). When the first two args already expose `.raw`, the extra
  // accessors are ignored.
  rawAccount?: { raw(key: string): unknown },
  rawCheckout?: { raw(key: string): unknown },
): AccountBillingMessages {
  const accountRaw = (key: string): string =>
    String((rawAccount ?? tAccount).raw(key));
  const checkoutRaw = (key: string): string =>
    String((rawCheckout ?? tCheckout).raw(key));

  return {
    account: {
      title: tAccount('title'),
      currentPlanHeading: tAccount('currentPlanHeading'),
      // Placeholder templates — interpolated downstream with runtime data.
      trialingStatus: accountRaw('trialingStatus'),
      trialEndedStatus: tAccount('trialEndedStatus'),
      activePlanStatus: accountRaw('activePlanStatus'),
      noPlanStatus: tAccount('noPlanStatus'),
      planMonthly: tAccount('planMonthly'),
      planAnnual: tAccount('planAnnual'),
      planLifetime: tAccount('planLifetime'),
      choosePlanHeading: tAccount('choosePlanHeading'),
      selectPlanButton: accountRaw('selectPlanButton'),
      perMonth: accountRaw('perMonth'),
      perYear: accountRaw('perYear'),
      oneTime: accountRaw('oneTime'),
      foundingHeading: tAccount('foundingHeading'),
      foundingDescription: tAccount('foundingDescription'),
      foundingTier50: tAccount('foundingTier50'),
      foundingTier30: tAccount('foundingTier30'),
      foundingRemaining: accountRaw('foundingRemaining'),
      foundingUnavailable: tAccount('foundingUnavailable'),
      yourTierHeading: tAccount('yourTierHeading'),
      // {tier} is interpolated downstream by the view (Feedback D14) — pass raw.
      yourTierPredicted: accountRaw('yourTierPredicted'),
      yourTierLocked: accountRaw('yourTierLocked'),
      yourTierEnded: tAccount('yourTierEnded'),
      yourTierBadge: tAccount('yourTierBadge'),
      earlySwitchHeading: tAccount('earlySwitchHeading'),
      earlySwitchButton: tAccount('earlySwitchButton'),
      manageHeading: tAccount('manageHeading'),
    },
    checkout: {
      title: tCheckout('title'),
      subtitle: tCheckout('subtitle'),
      recurringHeading: tCheckout('recurringHeading'),
      recurringBody: tCheckout('recurringBody'),
      priceHeading: tCheckout('priceHeading'),
      // Placeholder templates — interpolated downstream from pricing.ts.
      perCycleMonthly: checkoutRaw('perCycleMonthly'),
      perCycleAnnual: checkoutRaw('perCycleAnnual'),
      annualTotalLabel: tCheckout('annualTotalLabel'),
      annualTotalValue: checkoutRaw('annualTotalValue'),
      trialHeading: tCheckout('trialHeading'),
      trialBody: checkoutRaw('trialBody'),
      cancelHeading: tCheckout('cancelHeading'),
      cancelBody: tCheckout('cancelBody'),
      lifetimeHeading: tCheckout('lifetimeHeading'),
      lifetimeBody: tCheckout('lifetimeBody'),
      lifetimePriceLabel: tCheckout('lifetimePriceLabel'),
      taxNote: tCheckout('taxNote'),
      tokushohoLink: tCheckout('tokushohoLink'),
      tokushohoLinkText: tCheckout('tokushohoLinkText'),
      confirmButton: tCheckout('confirmButton'),
      backButton: tCheckout('backButton'),
    },
  };
}
