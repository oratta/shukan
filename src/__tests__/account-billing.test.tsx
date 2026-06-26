import { describe, it, expect } from 'vitest';
import { AccountBilling } from '@/components/billing/account-billing';
import type { AccountBillingMessages } from '@/components/billing/account-billing';
import {
  checkoutFlowReducer,
  initialCheckoutFlow,
  type CheckoutFlowState,
} from '@/lib/billing/checkout-flow';
import en from '@/messages/en.json';
import type { SubscriptionState } from '@/lib/billing/entitlement';
import type { RemainingSlots } from '@/app/founding/slots';

/**
 * billing-integration D8: /account billing UI.
 *
 * Asserts the points this change owns:
 *  - Current plan / trial-remaining shown from the subscriptions row.
 *  - Founding remaining slots shown transparently (real numbers, no fakes).
 *  - The ONLY path to Checkout is through the final-confirmation step (条件18):
 *    selecting a plan moves to a confirmation state; only confirming emits the
 *    checkout intent. Verified on a pure reducer so no DOM runtime is required
 *    (codebase avoids @testing-library / jsdom — change-C design D8).
 *  - A trialing user is offered the early-switch CTA.
 *
 * The component tree is tree-walked (same approach as paywall-gate.test.tsx /
 * jp-final-confirmation.test.tsx).
 */

const NOW = new Date('2026-06-12T00:00:00Z');
const FUTURE = new Date('2026-06-20T00:00:00Z').toISOString();

function sub(overrides: Partial<SubscriptionState>): SubscriptionState {
  return {
    status: 'trialing',
    plan: null,
    trialEnd: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

function messages(): AccountBillingMessages {
  return {
    account: en.account as AccountBillingMessages['account'],
    checkout: en.checkout as AccountBillingMessages['checkout'],
  };
}

const SLOTS: RemainingSlots = {
  founder50: { cap: 50, claimed: 12, remaining: 38 },
  founder30: { cap: 200, claimed: 0, remaining: 200 },
};

// --- tree-walk helper ---

type Walk = {
  texts: string[];
  data: string[]; // names of any data-* attribute encountered
  ordered: Array<{ type: unknown; text: string | null; props: Record<string, unknown> }>;
};

function walk(node: unknown, acc: Walk): void {
  if (node === null || node === undefined || node === false || node === true) return;
  if (typeof node === 'string' || typeof node === 'number') {
    acc.texts.push(String(node));
    acc.ordered.push({ type: '#text', text: String(node), props: {} });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, acc));
    return;
  }
  if (typeof node === 'object') {
    const el = node as { type?: unknown; props?: Record<string, unknown> };
    if (el.props) {
      for (const key of Object.keys(el.props)) {
        if (key.startsWith('data-')) acc.data.push(key);
      }
      acc.ordered.push({ type: el.type, text: null, props: el.props });
      if (el.props.children !== undefined) walk(el.props.children, acc);
    }
  }
}

function render(props: Parameters<typeof AccountBilling>[0]): Walk {
  const tree = (AccountBilling as (p: unknown) => unknown)(props);
  const acc: Walk = { texts: [], data: [], ordered: [] };
  walk(tree, acc);
  return acc;
}

describe('AccountBilling: current plan & trial remaining', () => {
  it('shows trial days remaining for a trialing user', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    const joined = acc.texts.join(' ');
    // 8 days between 2026-06-12 and 2026-06-20
    expect(joined).toContain('8');
    expect(joined.toLowerCase()).toContain('trial');
  });

  it('shows the active plan name for a paying user', () => {
    const acc = render({
      subscription: sub({ status: 'active', plan: 'monthly', trialEnd: null }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.texts.join(' ').toLowerCase()).toContain('monthly');
  });
});

describe('AccountBilling: founding slots transparency', () => {
  it('renders the real remaining counts from the fetched slots', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    const joined = acc.texts.join(' ');
    expect(joined).toContain('38');
    expect(joined).toContain('200');
  });

  it('omits the counts (no invented numbers) when slots are null', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: null,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.texts.join(' ')).not.toContain('38');
  });
});

describe('AccountBilling: plan prices are tax-inclusive', () => {
  it('shows tax-inclusive plan prices for all three plans', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    const joined = acc.texts.join(' ');
    expect(joined).toContain('4.99');
    expect(joined).toContain('39.99');
    expect(joined).toContain('99');
    expect(joined.toLowerCase()).toContain('tax incl');
  });

  it('exposes a select-plan control for each plan', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).toContain('data-select-plan');
  });
});

describe('AccountBilling: early-switch CTA (trialing only)', () => {
  it('offers the early-switch CTA while trialing', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).toContain('data-early-switch');
  });

  it('does NOT offer the early-switch CTA for an active subscriber', () => {
    const acc = render({
      subscription: sub({ status: 'active', plan: 'monthly', trialEnd: null }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).not.toContain('data-early-switch');
  });
});

describe('AccountBilling: confirmation gate is rendered when a plan is selected', () => {
  it('renders the FinalConfirmation (confirm-checkout button) when selectedPlan is set', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
      // test seam: force the confirmation state
      initialSelectedPlan: 'monthly',
    });
    expect(acc.data).toContain('data-confirm-checkout');
    // The four mandatory items come from FinalConfirmation.
    expect(acc.texts.join(' ')).toContain('auto-renewal');
  });

  it('does NOT render the confirm-checkout control in the default (no plan selected) state', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: SLOTS,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).not.toContain('data-confirm-checkout');
  });
});

// --- Pure checkout-flow reducer: condition 18 enforced without a DOM ---

describe('checkoutFlowReducer: Checkout reachable only after confirmation (条件18)', () => {
  it('starts idle with no checkout intent', () => {
    const s = initialCheckoutFlow();
    expect(s.phase).toBe('idle');
    expect(s.checkoutPlan).toBeNull();
  });

  it('SELECT_PLAN moves to confirming WITHOUT emitting a checkout intent', () => {
    const s = checkoutFlowReducer(initialCheckoutFlow(), {
      type: 'SELECT_PLAN',
      plan: 'monthly',
    });
    expect(s.phase).toBe('confirming');
    expect(s.selectedPlan).toBe('monthly');
    // No checkout yet.
    expect(s.checkoutPlan).toBeNull();
  });

  it('CONFIRM emits the checkout intent for the confirmed plan', () => {
    let s: CheckoutFlowState = checkoutFlowReducer(initialCheckoutFlow(), {
      type: 'SELECT_PLAN',
      plan: 'annual',
    });
    s = checkoutFlowReducer(s, { type: 'CONFIRM' });
    expect(s.phase).toBe('checkout');
    expect(s.checkoutPlan).toBe('annual');
  });

  it('CONFIRM from idle is a no-op (cannot bypass selection)', () => {
    const s = checkoutFlowReducer(initialCheckoutFlow(), { type: 'CONFIRM' });
    expect(s.phase).toBe('idle');
    expect(s.checkoutPlan).toBeNull();
  });

  it('BACK returns to idle and clears any selection', () => {
    let s = checkoutFlowReducer(initialCheckoutFlow(), {
      type: 'SELECT_PLAN',
      plan: 'lifetime',
    });
    s = checkoutFlowReducer(s, { type: 'BACK' });
    expect(s.phase).toBe('idle');
    expect(s.selectedPlan).toBeNull();
    expect(s.checkoutPlan).toBeNull();
  });
});
