/**
 * Final confirmation screen (change-D: jp-legal-compliance, design D2).
 *
 * Shown immediately BEFORE redirecting to Stripe Checkout (改正特商法 第12条の6).
 * Pure, props-driven component: the four mandatory items are rendered directly
 * above the confirmation button, never behind accordions/modals/tabs and never
 * below the fold (spec S3/S4). Lifetime renders non-recurring terms (spec S5).
 *
 * Prices come from src/lib/billing/pricing.ts (tax-inclusive totals = the amount
 * charged). Copy is supplied via the `messages` prop (the next-intl `checkout`
 * namespace), with ja being the authoritative legal text (design D7).
 */

import type { Plan } from '@/lib/billing/config';
import {
  formatTaxInclusivePrice,
  formatAnnualTotal,
  isRecurringPlan,
} from '@/lib/billing/pricing';

export type Locale = 'en' | 'ja';

export interface CheckoutMessages {
  title: string;
  subtitle: string;
  recurringHeading: string;
  recurringBody: string;
  priceHeading: string;
  perCycleMonthly: string;
  perCycleAnnual: string;
  annualTotalLabel: string;
  annualTotalValue: string;
  trialHeading: string;
  trialBody: string;
  cancelHeading: string;
  cancelBody: string;
  lifetimeHeading: string;
  lifetimeBody: string;
  lifetimePriceLabel: string;
  taxNote: string;
  tokushohoLink: string;
  tokushohoLinkText: string;
  confirmButton: string;
  backButton: string;
}

export interface FinalConfirmationProps {
  plan: Plan;
  locale?: Locale;
  trialDays: number;
  messages: CheckoutMessages;
  /** Path to the 特商法表記 page. */
  tokushohoHref?: string;
  /** Called when the user confirms (the only path to Checkout). */
  onConfirm?: () => void;
  /** Called when the user backs out. */
  onBack?: () => void;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? vars[key] : `{${key}}`
  );
}

// Interpolation that renders each substituted value in Geist Mono + tabular-nums
// so charged amounts read as clean digits (DESIGN §6 / ⑥). Label text stays sans.
function interpolateMono(template: string, vars: Record<string, string>) {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    if (key && key in vars) {
      return (
        <span key={i} className="font-mono tabular-nums">
          {vars[key]}
        </span>
      );
    }
    return part;
  });
}

export function FinalConfirmation({
  plan,
  locale = 'ja',
  trialDays,
  messages: m,
  tokushohoHref = '/tokushoho',
  onConfirm,
  onBack,
}: FinalConfirmationProps) {
  const perCyclePrice = formatTaxInclusivePrice(plan, locale);
  const annualTotalStr = formatAnnualTotal(plan, locale);
  const recurring = isRecurringPlan(plan);

  return (
    <section
      data-final-confirmation={plan}
      className="mx-auto w-full max-w-md space-y-5 p-4"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">{m.title}</h2>
        <p className="text-sm text-muted-foreground">{m.subtitle}</p>
      </header>

      {recurring ? (
        <div className="space-y-4">
          {/* ① 定期購入（自動更新）である旨 */}
          <div className="rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">{m.recurringHeading}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {m.recurringBody}
            </p>
          </div>

          {/* ② 各回の代金 + 一定期間の支払総額（税込） */}
          <div className="rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">{m.priceHeading}</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {plan === 'monthly'
                ? interpolateMono(m.perCycleMonthly, { price: perCyclePrice })
                : interpolateMono(m.perCycleAnnual, { price: perCyclePrice })}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {m.annualTotalLabel}：{interpolateMono(m.annualTotalValue, { total: annualTotalStr })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{m.taxNote}</p>
          </div>

          {/* ③ トライアル → 有料移行の時期と金額 */}
          <div className="rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">{m.trialHeading}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {interpolate(m.trialBody, {
                days: String(trialDays),
                price: perCyclePrice,
              })}
            </p>
          </div>

          {/* ④ 解約方法・期限・違約金の有無 */}
          <div className="rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">{m.cancelHeading}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {m.cancelBody}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lifetime: non-recurring terms */}
          <div className="rounded-lg border border-border p-3">
            <h3 className="text-sm font-semibold">{m.lifetimeHeading}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {m.lifetimeBody}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {m.lifetimePriceLabel}：
              <span className="font-mono tabular-nums">{perCyclePrice}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{m.taxNote}</p>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {m.tokushohoLinkText}{' '}
        <a
          href={tokushohoHref}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {m.tokushohoLink}
        </a>
      </p>

      {/* Confirmation button sits AFTER all mandatory items (S4). */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          {m.backButton}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-confirm-checkout
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {m.confirmButton}
        </button>
      </div>
    </section>
  );
}
