'use client';

import { useEffect, useReducer, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchRemainingSlots, type RemainingSlots } from '@/app/founding/slots';
import { getTrialDays, type Plan } from '@/lib/billing/config';
import { AccountBilling } from '@/components/billing/account-billing';
import {
  buildAccountBillingMessages,
  type AccountTranslator,
} from '@/app/(app)/account/account-messages';
import {
  checkoutFlowReducer,
  initialCheckoutFlow,
} from '@/lib/billing/checkout-flow';

/**
 * /account — plan & billing screen (billing-integration, D8).
 *
 * Authenticated (in the `(app)` route group; middleware matcher protects
 * `/account`). Wires the subscriptions row + founding seat counts into the pure
 * AccountBilling view, and drives the checkout flow through the confirmation
 * gate. The PaywallGate CTA routes here via `/account?upgrade=1`.
 */
export default function AccountPage() {
  const locale = useLocale() as 'en' | 'ja';
  const tAccount = useTranslations('account');
  const tCheckout = useTranslations('checkout');
  const { subscription } = useSubscription();
  const [slots, setSlots] = useState<RemainingSlots | null>(null);
  const [flow, dispatch] = useReducer(checkoutFlowReducer, undefined, initialCheckoutFlow);

  useEffect(() => {
    let cancelled = false;
    fetchRemainingSlots().then((s) => {
      if (!cancelled) setSlots(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // When the flow reaches `checkout`, POST to the Checkout API and redirect.
  // This is the ONLY caller of /api/stripe/checkout from the UI, and it is only
  // reachable after the user confirmed on the FinalConfirmation screen (条件18).
  useEffect(() => {
    if (flow.phase !== 'checkout' || !flow.checkoutPlan) return;
    const plan = flow.checkoutPlan;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });
        if (!res.ok) {
          if (!cancelled) dispatch({ type: 'RESET' });
          return;
        }
        const { url } = (await res.json()) as { url?: string };
        if (url && !cancelled) window.location.href = url;
      } catch {
        if (!cancelled) dispatch({ type: 'RESET' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flow.phase, flow.checkoutPlan]);

  // Build the view copy. Keys with ICU placeholders ({price}, {plan}, {days},
  // {total}, {remaining}/{cap}) are passed as RAW templates and interpolated by
  // the view from pricing.ts (change-D invariant). Resolving them via plain
  // t(key) with no values throws FORMATTING_ERROR at runtime (D12).
  const messages = buildAccountBillingMessages(
    tAccount as unknown as AccountTranslator,
    tCheckout as unknown as AccountTranslator,
  );

  const handleEarlySwitch = () => {
    // The early-switch CTA leads into the same confirmation→checkout path; we
    // default to the annual plan (the founding discount applies to subscriptions).
    dispatch({ type: 'SELECT_PLAN', plan: 'annual' });
  };

  return (
    <AccountBilling
      subscription={subscription}
      slots={slots}
      locale={locale}
      messages={messages}
      trialDays={getTrialDays()}
      selectedPlan={flow.selectedPlan}
      onSelectPlan={(plan: Plan) => dispatch({ type: 'SELECT_PLAN', plan })}
      onBack={() => dispatch({ type: 'BACK' })}
      onCheckout={() => dispatch({ type: 'CONFIRM' })}
      onEarlySwitch={handleEarlySwitch}
    />
  );
}
