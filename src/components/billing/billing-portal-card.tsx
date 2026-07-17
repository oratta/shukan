/**
 * Billing & cancellation card (change-D: jp-legal-compliance, design D4).
 *
 * Rendered on the account/billing screen. Provides a single Customer Portal entry
 * point where the subscription can be canceled, and presents the「いつでも解約」
 * claim WITHOUT any contradicting conditions (no phone-required, no penalty), so
 * the claim matches reality (spec S7). Pure / props-driven for testability; the
 * real portal-open call (change-A `/api/stripe/portal`) is injected via
 * `onOpenPortal`.
 */

export type Locale = 'en' | 'ja';

export interface BillingMessages {
  heading: string;
  subscriptionStatus: string;
  noSubscription: string;
  manageButton: string;
  portalDescription: string;
  cancelAnytime: string;
  tokushohoLinkText: string;
  tokushohoLink: string;
}

export interface BillingPortalCardProps {
  /** Whether the user has billing history (an active/past subscription). */
  hasSubscription: boolean;
  locale?: Locale;
  messages: BillingMessages;
  tokushohoHref?: string;
  /** Opens the Stripe Customer Portal (change-A `/api/stripe/portal`). */
  onOpenPortal?: () => void;
}

export function BillingPortalCard({
  hasSubscription,
  messages: m,
  tokushohoHref = '/tokushoho',
  onOpenPortal,
}: BillingPortalCardProps) {
  return (
    <section
      data-billing-portal-card
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {m.heading}
      </h3>

      <p className="text-sm text-muted-foreground">
        {hasSubscription ? m.subscriptionStatus : m.noSubscription}
      </p>

      <button
        type="button"
        onClick={onOpenPortal}
        data-open-portal
        className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium"
      >
        {m.manageButton}
      </button>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {m.portalDescription}
      </p>

      {/* いつでも解約 claim — stated without any contradicting condition. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {m.cancelAnytime}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {m.tokushohoLinkText}{' '}
        <a
          href={tokushohoHref}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {m.tokushohoLink}
        </a>
      </p>
    </section>
  );
}
