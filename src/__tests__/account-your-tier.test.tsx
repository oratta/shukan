import { describe, it, expect } from 'vitest';
import {
  AccountBilling,
  predictTierFromSlots,
} from '@/components/billing/account-billing';
import type { AccountBillingMessages } from '@/components/billing/account-billing';
import en from '@/messages/en.json';
import type { SubscriptionState } from '@/lib/billing/entitlement';
import type { RemainingSlots } from '@/app/founding/slots';

/**
 * Feedback D14: /account「あなたのtier」明示.
 *
 * Pure / tree-walk tests (no jsdom, same approach as account-billing.test.tsx).
 *  - predictTierFromSlots derives the tier the next claim would land in, from the
 *    public counter `slots`, by reusing decideTier (src/lib/founding/allocation.ts).
 *  - AccountBilling shows a predicted tier (not yet joined) or a locked tier
 *    (membership confirmed), highlighting the matching tier row.
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

function slotsWith(remaining50: number, remaining30: number): RemainingSlots {
  return {
    founder50: { cap: 50, claimed: 50 - remaining50, remaining: remaining50 },
    founder30: { cap: 200, claimed: 200 - remaining30, remaining: remaining30 },
  };
}

// --- tree-walk helper (mirrors account-billing.test.tsx) ---

type Walk = {
  texts: string[];
  data: string[];
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

describe('predictTierFromSlots: reuse decideTier on public counter slots', () => {
  it('founder_50 while the 50% tier has seats left', () => {
    expect(predictTierFromSlots(slotsWith(10, 200))).toBe('founder_50');
  });

  it('founder_30 once the 50% tier is full but the 30% tier has seats', () => {
    expect(predictTierFromSlots(slotsWith(0, 5))).toBe('founder_30');
  });

  it('none when both tiers are full', () => {
    expect(predictTierFromSlots(slotsWith(0, 0))).toBe('none');
  });

  it('returns null when slots are unavailable', () => {
    expect(predictTierFromSlots(null)).toBeNull();
  });
});

describe('AccountBilling: predicted tier for a user who has not joined yet', () => {
  it('shows the predicted 50% tier and highlights the 50% row when seats remain', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: slotsWith(38, 200),
      membershipTier: null,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).toContain('data-account-your-tier');
    const joined = acc.texts.join(' ');
    // predicted-tier copy is interpolated with the 50% tier label
    expect(joined).toContain(en.account.yourTierPredicted.replace('{tier}', en.account.foundingTier50));
  });

  it('predicts the 30% tier once the 50% tier is full', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: slotsWith(0, 100),
      membershipTier: null,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    const joined = acc.texts.join(' ');
    expect(joined).toContain(en.account.yourTierPredicted.replace('{tier}', en.account.foundingTier30));
  });

  it('shows the ended message when both tiers are full', () => {
    const acc = render({
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      slots: slotsWith(0, 0),
      membershipTier: null,
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.texts.join(' ')).toContain(en.account.yourTierEnded);
    expect(acc.data).not.toContain('data-account-your-tier');
  });
});

describe('AccountBilling: locked tier overrides prediction once membership exists', () => {
  it('shows the locked 30% copy and highlights the 30% row even if slots predict 50%', () => {
    const acc = render({
      subscription: sub({ status: 'active', plan: 'annual', trialEnd: null }),
      slots: slotsWith(38, 200), // prediction would be founder_50
      membershipTier: 'founder_30',
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    expect(acc.data).toContain('data-account-your-tier');
    const joined = acc.texts.join(' ');
    expect(joined).toContain(en.account.yourTierLocked.replace('{tier}', en.account.foundingTier30));
    // must NOT show the predicted-tier phrasing
    expect(joined).not.toContain(en.account.yourTierPredicted.replace('{tier}', en.account.foundingTier50));
  });

  it('locked founder_50 shows the locked 50% copy', () => {
    const acc = render({
      subscription: sub({ status: 'active', plan: 'monthly', trialEnd: null }),
      slots: slotsWith(0, 0),
      membershipTier: 'founder_50',
      locale: 'en',
      messages: messages(),
      now: NOW,
    });
    const joined = acc.texts.join(' ');
    expect(joined).toContain(en.account.yourTierLocked.replace('{tier}', en.account.foundingTier50));
    // not the "ended" message even though slots are exhausted
    expect(joined).not.toContain(en.account.yourTierEnded);
  });
});
