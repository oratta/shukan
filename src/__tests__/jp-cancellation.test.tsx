import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

/**
 * change-D S7: User can reach cancellation from the billing screen.
 * Tasks: 6.2 (D4)
 *
 * The account/billing screen presents a Customer Portal entry point and an
 * "いつでも解約" claim with NO contradicting extra conditions. The portal link is
 * rendered by a pure component so the structure can be tree-walked.
 */

type Json = Record<string, unknown>;
type WalkResult = {
  texts: string[];
  buttonsAndLinks: Array<{ type: unknown; props: Record<string, unknown> }>;
};

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
    const el = node as { type?: unknown; props?: Record<string, unknown> };
    if (el.props) {
      if (el.type === 'button' || el.type === 'a') {
        acc.buttonsAndLinks.push({ type: el.type, props: el.props });
      }
      const children = el.props.children;
      if (children !== undefined) walk(children, acc);
    }
  }
}

async function render(props: Record<string, unknown>): Promise<WalkResult> {
  const mod = await import('@/components/billing/billing-portal-card');
  const BillingPortalCard = mod.BillingPortalCard as (p: unknown) => unknown;
  const tree = BillingPortalCard(props);
  const acc: WalkResult = { texts: [], buttonsAndLinks: [] };
  walk(tree, acc);
  return acc;
}

function messagesFor(locale: 'ja' | 'en'): Json {
  const root = (locale === 'ja' ? ja : en) as Json;
  return (root.billing as Json) ?? {};
}

describe('S7: cancellation reachable from billing screen', () => {
  it('renders a portal entry point (button or link) for an active subscriber', async () => {
    const acc = await render({
      hasSubscription: true,
      locale: 'ja',
      messages: messagesFor('ja'),
      onOpenPortal: () => {},
    });
    expect(acc.buttonsAndLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('shows an "いつでも解約" claim', async () => {
    const acc = await render({
      hasSubscription: true,
      locale: 'ja',
      messages: messagesFor('ja'),
      onOpenPortal: () => {},
    });
    const joined = acc.texts.join(' ');
    expect(joined).toContain('いつでも解約');
  });

  it('does not pair the cancel claim with contradicting conditions (phone-required / penalty)', async () => {
    const acc = await render({
      hasSubscription: true,
      locale: 'ja',
      messages: messagesFor('ja'),
      onOpenPortal: () => {},
    });
    const joined = acc.texts.join(' ');
    // No retention-wall / contradiction language.
    expect(joined).not.toContain('お電話');
    expect(joined).not.toContain('電話でのみ');
    expect(joined).not.toContain('違約金が発生');
    expect(joined).not.toContain('解約できません');
  });
});

describe('billing namespace exists in both locales', () => {
  it('both en.json and ja.json contain a billing namespace', () => {
    expect((en as Json).billing).toBeDefined();
    expect((ja as Json).billing).toBeDefined();
  });
});
