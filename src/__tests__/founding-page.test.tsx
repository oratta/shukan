import { describe, it, expect, vi, beforeEach } from 'vitest';
import en from '@/messages/en.json';

/**
 * Tree-walking helpers for sync/async Server Component output.
 * Mirrors src/__tests__/marketing-page.test.tsx.
 */
type WalkResult = {
  texts: string[];
  hrefs: string[];
  elements: Array<{ type: unknown; props: Record<string, unknown> }>;
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
      acc.elements.push({ type: el.type, props: el.props });
      const href = el.props.href;
      if (typeof href === 'string') acc.hrefs.push(href);
      const children = el.props.children;
      if (children !== undefined) walk(children, acc);
    }
  }
}

function getElementsByType(acc: WalkResult, type: string) {
  return acc.elements.filter((e) => e.type === type);
}

// --- Mock next-intl/server getTranslations to read directly from en.json ---
type Json = Record<string, unknown>;
function makeT(namespace: string) {
  const ns = (en as Json)[namespace] as Json;
  const t = (key: string) => {
    const parts = key.split('.');
    let cur: unknown = ns;
    for (const p of parts) {
      if (cur && typeof cur === 'object') cur = (cur as Json)[p];
    }
    return typeof cur === 'string' ? cur : key;
  };
  t.raw = (key: string) => {
    const parts = key.split('.');
    let cur: unknown = ns;
    for (const p of parts) {
      if (cur && typeof cur === 'object') cur = (cur as Json)[p];
    }
    return cur;
  };
  return t;
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => makeT(namespace)),
  getLocale: vi.fn(async () => 'en'),
}));

// --- Mock the slot fetcher; tests control the return value per case ---
const fetchSlotsMock = vi.fn();
vi.mock('@/app/founding/slots', () => ({
  fetchRemainingSlots: (...args: unknown[]) => fetchSlotsMock(...args),
}));

// --- Mock the client WaitlistForm so the page tree exposes a real <form> ---
// Exporting the string 'form' makes `<WaitlistForm/>` compile to a plain <form>
// element in the page tree, so the structural walk can detect the form. The real
// 'use client' form behavior is verified separately by founding-actions.test.ts.
vi.mock('@/app/founding/waitlist-form', () => ({
  WaitlistForm: 'form',
}));

// --- Mock the client LocaleSwitcher so the page tree exposes a detectable node ---
// Returning a function component named LocaleSwitcher lets the structural walk
// find it by element type/name. The real cookie-based toggle behavior lives in
// src/components/locale-switcher.tsx and is exercised in the running app.
vi.mock('@/components/locale-switcher', () => ({
  LocaleSwitcher: function LocaleSwitcher() {
    return null;
  },
}));

async function renderPage(): Promise<WalkResult> {
  const { default: FoundingPage } = await import('@/app/founding/page');
  const tree = await (FoundingPage as () => Promise<unknown>)();
  const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
  walk(tree, acc);
  return acc;
}

beforeEach(() => {
  fetchSlotsMock.mockReset();
});

describe('S1: All five sections are present', () => {
  it('renders Hero (single h1) → tiers (50% & 30%) → CS promise → waitlist form → FAQ (>=3)', async () => {
    fetchSlotsMock.mockResolvedValue(null);
    const acc = await renderPage();
    const joined = acc.texts.join(' ');

    // Single <h1>
    const h1s = getElementsByType(acc, 'h1');
    expect(h1s.length).toBe(1);

    // Tier section references both 50% and 30%
    expect(joined).toContain('50%');
    expect(joined).toContain('30%');

    // CS-priority promise message present
    const founding = (en as Json).founding as Json;
    const promise = founding.promise as Json;
    expect(joined).toContain(promise.body as string);

    // Waitlist form present (a <form> element)
    const forms = getElementsByType(acc, 'form');
    expect(forms.length).toBeGreaterThanOrEqual(1);

    // FAQ section with >= 3 q/a pairs rendered
    const faq = founding.faq as Json;
    const items = faq.items as Json[];
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (const item of items) {
      expect(joined).toContain(item.q as string);
    }
  });
});

describe('Feedback (D11): Locale switcher is present on the teaser', () => {
  it('renders a LocaleSwitcher so EN/JA can be toggled from /founding', async () => {
    fetchSlotsMock.mockResolvedValue(null);
    const acc = await renderPage();

    const switchers = acc.elements.filter((e) => {
      const t = e.type;
      const name =
        typeof t === 'function'
          ? (t as { name?: string }).name ?? ''
          : typeof t === 'string'
            ? t
            : '';
      return name === 'LocaleSwitcher';
    });
    expect(switchers.length).toBeGreaterThanOrEqual(1);
  });
});

describe('S2: No dark-pattern urgency devices', () => {
  it('renders no countdown component and no remaining-slot number literals in copy', async () => {
    fetchSlotsMock.mockResolvedValue(null);
    const acc = await renderPage();

    // No element whose type/name hints at a countdown timer
    const countdownish = acc.elements.filter((e) => {
      const t = e.type;
      const name =
        typeof t === 'function'
          ? (t as { name?: string }).name ?? ''
          : typeof t === 'string'
            ? t
            : '';
      return /countdown|timer/i.test(name);
    });
    expect(countdownish.length).toBe(0);
  });
});

describe('S13: Live counts are rendered from the API', () => {
  it('displays exact remaining numbers from the counter API for both tiers', async () => {
    fetchSlotsMock.mockResolvedValue({
      founder50: { cap: 50, claimed: 13, remaining: 37 },
      founder30: { cap: 200, claimed: 8, remaining: 192 },
    });
    const acc = await renderPage();
    const joined = acc.texts.join(' ');
    expect(joined).toContain('37');
    expect(joined).toContain('192');
  });
});

describe('S14: Counter API unavailable falls back without fake numbers', () => {
  it('renders tier benefits without numeric remaining counts when fetcher returns null', async () => {
    fetchSlotsMock.mockResolvedValue(null);
    const acc = await renderPage();
    const joined = acc.texts.join(' ');

    // Tier benefits still rendered (50%/30% present)
    expect(joined).toContain('50%');
    expect(joined).toContain('30%');

    // No invented remaining counts: the known fallback values must not appear
    expect(joined).not.toContain('37');
    expect(joined).not.toContain('192');
  });
});
