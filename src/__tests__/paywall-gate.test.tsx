import { describe, it, expect } from 'vitest';
import {
  isEntitled,
  isGatedAction,
  type SubscriptionState,
} from '@/lib/billing/entitlement';
import { PaywallGate } from '@/components/paywall-gate';

// change-A S19/S21/S22/S23/S17: entitlement
// change-A S24: gate configuration
// Tasks: 3.5

const NOW = new Date('2026-06-12T00:00:00Z');
const FUTURE = new Date('2026-06-20T00:00:00Z').toISOString();
const PAST = new Date('2026-06-01T00:00:00Z').toISOString();

function sub(overrides: Partial<SubscriptionState>): SubscriptionState {
  return {
    status: 'trialing',
    plan: null,
    trialEnd: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

describe('entitlement: trial in window (S19)', () => {
  it('grants entitlement when trialing and trial_end is in the future', () => {
    expect(isEntitled(sub({ status: 'trialing', trialEnd: FUTURE }), NOW)).toBe(true);
  });
});

describe('entitlement: expired trial (S22 / S21)', () => {
  it('denies entitlement when trialing and trial_end is in the past', () => {
    expect(isEntitled(sub({ status: 'trialing', trialEnd: PAST }), NOW)).toBe(false);
  });

  it('evaluates purely from trial_end < now (no status transition required)', () => {
    // status stays 'trialing' even after expiry; entitlement is false
    const expired = sub({ status: 'trialing', trialEnd: PAST });
    expect(expired.status).toBe('trialing');
    expect(isEntitled(expired, NOW)).toBe(false);
  });
});

describe('entitlement: active subscription (S23)', () => {
  it('grants entitlement when status is active regardless of trial_end', () => {
    expect(
      isEntitled(sub({ status: 'active', plan: 'monthly', trialEnd: PAST }), NOW)
    ).toBe(true);
  });
});

describe('entitlement: lifetime (S17)', () => {
  it('grants permanent entitlement for lifetime plan regardless of current_period_end', () => {
    expect(
      isEntitled(
        sub({ status: 'active', plan: 'lifetime', currentPeriodEnd: PAST }),
        NOW
      )
    ).toBe(true);
  });
});

describe('entitlement: no subscription / canceled', () => {
  it('denies entitlement for null subscription', () => {
    expect(isEntitled(null, NOW)).toBe(false);
  });

  it('denies entitlement for canceled status', () => {
    expect(isEntitled(sub({ status: 'canceled', plan: 'monthly' }), NOW)).toBe(false);
  });
});

describe('gate configuration is adjustable (S24)', () => {
  it('reads the gated-action set from configuration values, not hardcoded logic', () => {
    expect(isGatedAction('create_habit', { gatedActions: ['create_habit'] })).toBe(true);
    expect(isGatedAction('create_habit', { gatedActions: [] })).toBe(false);
    expect(isGatedAction('view_stats', { gatedActions: ['create_habit'] })).toBe(false);
  });

  it('honors a different gated-action set without changing gate logic', () => {
    const cfg = { gatedActions: ['export_data', 'view_stats'] };
    expect(isGatedAction('export_data', cfg)).toBe(true);
    expect(isGatedAction('view_stats', cfg)).toBe(true);
    expect(isGatedAction('create_habit', cfg)).toBe(false);
  });
});

// --- PaywallGate component (tree-walk, mirrors marketing-page.test.tsx) ---

type WalkResult = { texts: string[]; hrefs: string[]; onClicks: boolean[] };

function walk(node: unknown, acc: WalkResult): void {
  if (node === null || node === undefined || node === false || node === true) return;
  if (typeof node === 'string' || typeof node === 'number') {
    acc.texts.push(String(node));
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, acc));
    return;
  }
  if (typeof node === 'object') {
    const el = node as { props?: Record<string, unknown> };
    if (el.props) {
      if (typeof el.props.href === 'string') acc.hrefs.push(el.props.href);
      if (typeof el.props.onClick === 'function') acc.onClicks.push(true);
      if (el.props.children !== undefined) walk(el.props.children, acc);
    }
  }
}

function render(node: unknown): WalkResult {
  const acc: WalkResult = { texts: [], hrefs: [], onClicks: [] };
  walk(node, acc);
  return acc;
}

describe('PaywallGate component', () => {
  it('renders children directly when the user is entitled (active) (S23)', () => {
    const tree = PaywallGate({
      action: 'create_habit',
      subscription: sub({ status: 'active', plan: 'monthly' }),
      now: NOW,
      children: 'protected content',
    });
    const out = render(tree);
    expect(out.texts.join(' ')).toContain('protected content');
  });

  it('renders children when trialing and within window (S19)', () => {
    const tree = PaywallGate({
      action: 'create_habit',
      subscription: sub({ status: 'trialing', trialEnd: FUTURE }),
      now: NOW,
      children: 'protected content',
    });
    expect(render(tree).texts.join(' ')).toContain('protected content');
  });

  it('blocks and shows an upgrade prompt with a Checkout CTA when trial expired (S22)', () => {
    const tree = PaywallGate({
      action: 'create_habit',
      subscription: sub({ status: 'trialing', trialEnd: PAST }),
      now: NOW,
      children: 'protected content',
    });
    const out = render(tree);
    // Child content must NOT be rendered
    expect(out.texts.join(' ')).not.toContain('protected content');
    // Upgrade prompt + CTA present
    expect(out.onClicks.length).toBeGreaterThan(0);
  });

  it('renders children for a non-gated action even when not entitled (S24)', () => {
    const tree = PaywallGate({
      action: 'view_dashboard',
      gatedActions: ['create_habit'],
      subscription: sub({ status: 'trialing', trialEnd: PAST }),
      now: NOW,
      children: 'free content',
    });
    expect(render(tree).texts.join(' ')).toContain('free content');
  });
});
