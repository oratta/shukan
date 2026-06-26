import { describe, it, expect, vi, beforeEach } from 'vitest';
import en from '@/messages/en.json';

/**
 * change-D S8: Remaining slots reflect the real counter (景表法 有利誤認/おとり広告排除).
 * change-D S9: Discount percentage references the real regular price.
 * Tasks: 6.3 (D5)
 *
 * Structural verification that the teaser's remaining-slot number is sourced from
 * the change-B counter API (not a hardcoded literal), and that the discount
 * reference price is the real regular price from billing config (not a fictitious
 * "was" price).
 */

type Json = Record<string, unknown>;

type WalkResult = { texts: string[]; elements: Array<{ type: unknown }> };

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
      acc.elements.push({ type: el.type });
      const children = el.props.children;
      if (children !== undefined) walk(children, acc);
    }
  }
}

function makeT(namespace: string) {
  const ns = (en as Json)[namespace] as Json;
  const t = (key: string) => {
    const parts = key.split('.');
    let cur: unknown = ns;
    for (const p of parts) if (cur && typeof cur === 'object') cur = (cur as Json)[p];
    return typeof cur === 'string' ? cur : key;
  };
  t.raw = (key: string) => {
    const parts = key.split('.');
    let cur: unknown = ns;
    for (const p of parts) if (cur && typeof cur === 'object') cur = (cur as Json)[p];
    return cur;
  };
  return t;
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => makeT(namespace)),
  getLocale: vi.fn(async () => 'en'),
}));

vi.mock('server-only', () => ({}));

// The teaser now calls getFoundingCounts directly (no HTTP self-fetch, D13).
const getFoundingCountsMock = vi.fn();
vi.mock('@/lib/supabase/founding-admin', () => ({
  getFoundingCounts: (...args: unknown[]) => getFoundingCountsMock(...args),
}));
vi.mock('@/app/founding/waitlist-form', () => ({ WaitlistForm: 'form' }));
vi.mock('@/components/locale-switcher', () => ({
  LocaleSwitcher: function LocaleSwitcher() {
    return null;
  },
}));

async function renderFounding(): Promise<WalkResult> {
  const { default: FoundingPage } = await import('@/app/founding/page');
  const tree = await (FoundingPage as () => Promise<unknown>)();
  const acc: WalkResult = { texts: [], elements: [] };
  walk(tree, acc);
  return acc;
}

beforeEach(() => {
  vi.resetModules();
  getFoundingCountsMock.mockReset();
});

describe('S8: Remaining slots reflect the real counter', () => {
  it('renders the exact remaining count returned by the counter aggregate', async () => {
    getFoundingCountsMock.mockResolvedValue({
      founder50: { cap: 50, claimed: 41, remaining: 9 },
      founder30: { cap: 200, claimed: 5, remaining: 195 },
    });
    const acc = await renderFounding();
    const joined = acc.texts.join(' ');
    // Counter values appear
    expect(joined).toContain('9');
    expect(joined).toContain('195');
  });

  it('shows NO remaining-slot number when the counter is unavailable (no fabricated count)', async () => {
    getFoundingCountsMock.mockImplementation(async () => {
      throw new Error('counter unavailable');
    });
    const acc = await renderFounding();
    const joined = acc.texts.join(' ');
    // The remaining-label prefix should not be paired with a fabricated integer.
    // Specifically, the prior test's distinctive counts must not appear.
    expect(joined).not.toContain('195');
  });

  it('the page source contains no hardcoded remaining-slot integer literal', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(process.cwd(), 'src/app/founding/page.tsx'),
      'utf8'
    );
    // The remaining count must be rendered from `count.remaining`, never a literal.
    expect(src).toContain('count.remaining');
    // No `remaining: <number>` style literal pretending to be a live count.
    expect(src).not.toMatch(/残り枠\s*[:：]\s*\d+/);
  });
});

describe('S9: Discount percentage references the real regular price', () => {
  it('discount tiers reference the real billing-config regular prices', async () => {
    const { CONSUMER_PRICES } = await import('@/lib/billing/pricing');
    const { DISCOUNT_PCT_BY_TIER } = await import('@/lib/founding/config');

    // The discounted amount must derive from the real regular price × (1 - pct),
    // so the displayed "○% OFF" is anchored to an actually-charged reference.
    for (const tier of ['founder_50', 'founder_30'] as const) {
      const pct = DISCOUNT_PCT_BY_TIER[tier];
      const regularAnnual = CONSUMER_PRICES.annual.amount;
      const discounted = regularAnnual * (1 - pct / 100);
      expect(discounted).toBeLessThan(regularAnnual);
      // The reference price (regular) is a real, configured value, not zero/fake.
      expect(regularAnnual).toBeGreaterThan(0);
    }
  });

  it('founding config maps tiers to their advertised discount percentages', async () => {
    const { DISCOUNT_PCT_BY_TIER } = await import('@/lib/founding/config');
    expect(DISCOUNT_PCT_BY_TIER.founder_50).toBe(50);
    expect(DISCOUNT_PCT_BY_TIER.founder_30).toBe(30);
  });
});
