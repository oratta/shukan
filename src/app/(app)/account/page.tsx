'use client';

import { useEffect, useReducer, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchRemainingSlots, type RemainingSlots } from '@/app/founding/slots';
import { getTrialDays, type Plan } from '@/lib/billing/config';
import {
  AccountBilling,
  type AccountBillingMessages,
} from '@/components/billing/account-billing';
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

  const messages: AccountBillingMessages = {
    account: {
      title: tAccount('title'),
      currentPlanHeading: tAccount('currentPlanHeading'),
      trialingStatus: tAccount('trialingStatus'),
      trialEndedStatus: tAccount('trialEndedStatus'),
      activePlanStatus: tAccount('activePlanStatus'),
      noPlanStatus: tAccount('noPlanStatus'),
      planMonthly: tAccount('planMonthly'),
      planAnnual: tAccount('planAnnual'),
      planLifetime: tAccount('planLifetime'),
      choosePlanHeading: tAccount('choosePlanHeading'),
      selectPlanButton: tAccount('selectPlanButton'),
      perMonth: tAccount('perMonth'),
      perYear: tAccount('perYear'),
      oneTime: tAccount('oneTime'),
      foundingHeading: tAccount('foundingHeading'),
      foundingDescription: tAccount('foundingDescription'),
      foundingTier50: tAccount('foundingTier50'),
      foundingTier30: tAccount('foundingTier30'),
      foundingRemaining: tAccount('foundingRemaining'),
      foundingUnavailable: tAccount('foundingUnavailable'),
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
      perCycleMonthly: tCheckout('perCycleMonthly'),
      perCycleAnnual: tCheckout('perCycleAnnual'),
      annualTotalLabel: tCheckout('annualTotalLabel'),
      annualTotalValue: tCheckout('annualTotalValue'),
      trialHeading: tCheckout('trialHeading'),
      trialBody: tCheckout('trialBody'),
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
