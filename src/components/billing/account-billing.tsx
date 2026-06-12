/**
 * Account billing view (billing-integration, D8).
 *
 * The /account screen. Pure / props-driven so it can be tree-walked in tests
 * (codebase avoids jsdom — change-C design D8). State (which plan is being
 * confirmed) lives in the page-level container; here it arrives as
 * `selectedPlan`. When a plan is selected we render the legally-required
 * `FinalConfirmation` — which is the ONLY path to Checkout (条件18).
 *
 * Shows, from the `subscriptions` row only (design D4):
 *  - current plan / trial days remaining (via trialDaysRemaining),
 *  - plan choices with tax-inclusive totals (src/lib/billing/pricing.ts),
 *  - Founding remaining seats transparently (real numbers or nothing),
 *  - an early-switch CTA while trialing (src/lib/founding/early-switch.ts).
 */

import { PLANS, type Plan } from '@/lib/billing/config';
import type { SubscriptionState } from '@/lib/billing/entitlement';
import { trialDaysRemaining } from '@/lib/billing/trial-status';
import { formatTaxInclusivePrice, type Locale } from '@/lib/billing/pricing';
import { shouldOfferEarlySwitch } from '@/lib/founding/early-switch';
import type { RemainingSlots } from '@/app/founding/slots';
import {
  FinalConfirmation,
  type CheckoutMessages,
} from '@/components/billing/final-confirmation';

export interface AccountMessages {
  title: string;
  currentPlanHeading: string;
  trialingStatus: string;
  trialEndedStatus: string;
  activePlanStatus: string;
  noPlanStatus: string;
  planMonthly: string;
  planAnnual: string;
  planLifetime: string;
  choosePlanHeading: string;
  selectPlanButton: string;
  perMonth: string;
  perYear: string;
  oneTime: string;
  foundingHeading: string;
  foundingDescription: string;
  foundingTier50: string;
  foundingTier30: string;
  foundingRemaining: string;
  foundingUnavailable: string;
  earlySwitchHeading: string;
  earlySwitchButton: string;
  manageHeading: string;
}

export interface AccountBillingMessages {
  account: AccountMessages;
  checkout: CheckoutMessages;
}

export interface AccountBillingProps {
  subscription: SubscriptionState | null;
  slots: RemainingSlots | null;
  locale?: Locale;
  messages: AccountBillingMessages;
  trialDays?: number;
  now?: Date;
  /** Test seam / controlled selection: which plan is under confirmation. */
  initialSelectedPlan?: Plan | null;
  selectedPlan?: Plan | null;
  onSelectPlan?: (plan: Plan) => void;
  onBack?: () => void;
  /** The confirmed checkout intent — the ONLY route to Stripe Checkout. */
  onCheckout?: (plan: Plan) => void;
  onEarlySwitch?: () => void;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? vars[key] : `{${key}}`
  );
}

function planLabel(plan: Plan, m: AccountMessages): string {
  if (plan === 'monthly') return m.planMonthly;
  if (plan === 'annual') return m.planAnnual;
  return m.planLifetime;
}

function planPriceLine(plan: Plan, m: AccountMessages, locale: Locale): string {
  const price = formatTaxInclusivePrice(plan, locale);
  if (plan === 'monthly') return interpolate(m.perMonth, { price });
  if (plan === 'annual') return interpolate(m.perYear, { price });
  return interpolate(m.oneTime, { price });
}

export function AccountBilling({
  subscription,
  slots,
  locale = 'ja',
  messages,
  trialDays = 14,
  now,
  initialSelectedPlan = null,
  selectedPlan,
  onSelectPlan,
  onBack,
  onCheckout,
  onEarlySwitch,
}: AccountBillingProps) {
  const m = messages.account;
  const active = selectedPlan ?? initialSelectedPlan;

  // Confirmation phase: the only path to Checkout (条件18). FinalConfirmation is
  // inlined (called as a function, not mounted as an element) so its mandatory
  // items and confirm button are part of this tree — both for tree-walk tests and
  // to keep the four items above the fold in the same scroll container.
  if (active) {
    return (
      <div data-account-confirm className="mx-auto w-full max-w-md p-4">
        {FinalConfirmation({
          plan: active,
          locale,
          trialDays,
          messages: messages.checkout,
          onConfirm: () => onCheckout?.(active),
          onBack,
        })}
      </div>
    );
  }

  const daysLeft = trialDaysRemaining(subscription, now);
  const offerEarlySwitch = shouldOfferEarlySwitch(subscription, now ?? new Date());

  let statusLine: string;
  if (subscription?.status === 'trialing') {
    statusLine =
      daysLeft && daysLeft > 0
        ? interpolate(m.trialingStatus, { days: String(daysLeft) })
        : m.trialEndedStatus;
  } else if (subscription?.status === 'active' && subscription.plan) {
    statusLine = interpolate(m.activePlanStatus, {
      plan: planLabel(subscription.plan, m),
    });
  } else {
    statusLine = m.noPlanStatus;
  }

  const foundingRows: Array<{ label: string; count: { cap: number; remaining: number } | null }> = [
    { label: m.foundingTier50, count: slots ? slots.founder50 : null },
    { label: m.foundingTier30, count: slots ? slots.founder30 : null },
  ];

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4">
      <h1 className="text-xl font-bold tracking-tight">{m.title}</h1>

      {/* Current plan / trial remaining */}
      <section
        data-account-current-plan
        className="rounded-lg border border-border p-4"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {m.currentPlanHeading}
        </h2>
        <p className="mt-2 text-sm text-foreground">{statusLine}</p>
      </section>

      {/* Founding seats — transparent real numbers, or nothing */}
      <section
        data-account-founding
        className="rounded-lg border border-border p-4 space-y-2"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {m.foundingHeading}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {m.foundingDescription}
        </p>
        {slots ? (
          <ul className="space-y-1">
            {foundingRows.map((row) => (
              <li key={row.label} className="flex items-baseline justify-between text-sm">
                <span className="text-foreground">{row.label}</span>
                {row.count ? (
                  <span className="font-medium text-foreground">
                    {interpolate(m.foundingRemaining, {
                      remaining: String(row.count.remaining),
                      cap: String(row.count.cap),
                    })}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">{m.foundingUnavailable}</p>
        )}
      </section>

      {/* Early-switch CTA — trialing users only */}
      {offerEarlySwitch ? (
        <section
          data-early-switch
          className="rounded-lg border border-border p-4 space-y-2"
        >
          <h2 className="text-sm font-semibold">{m.earlySwitchHeading}</h2>
          <button
            type="button"
            onClick={onEarlySwitch}
            className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            {m.earlySwitchButton}
          </button>
        </section>
      ) : null}

      {/* Plan selection — each leads to the confirmation step, never to Checkout */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {m.choosePlanHeading}
        </h2>
        <div className="space-y-2">
          {PLANS.map((plan) => (
            <div
              key={plan}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {planLabel(plan, m)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {planPriceLine(plan, m, locale)}
                </p>
              </div>
              <button
                type="button"
                data-select-plan={plan}
                onClick={() => onSelectPlan?.(plan)}
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                {interpolate(m.selectPlanButton, { plan: planLabel(plan, m) })}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
