import { describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

/**
 * Tree-walking helpers for async Server Component output.
 * Mirrors src/__tests__/founding-page.test.tsx.
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

function collect(node: unknown): WalkResult {
  const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
  walk(node, acc);
  return acc;
}

function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'function') return type.name;
  if (typeof type === 'object' && type && 'render' in type) {
    const render = (type as { render?: { name?: string } }).render;
    return render?.name ?? '';
  }
  return '';
}

// --- Mock next-intl/server getTranslations to read directly from en.json ---
type Json = Record<string, unknown>;
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

// Client component: expose a detectable, side-effect-free stand-in.
vi.mock('@/components/locale-switcher', () => ({
  LocaleSwitcher: function LocaleSwitcher() {
    return null;
  },
}));

const marketing = (en as Json).marketing as Json;

describe('Smitch marketing landing page — structure', () => {
  it('assembles the redesigned LP sections in order', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect(await (MarketingPage as () => Promise<unknown>)());

    const order = [
      'Hero',
      'Problem',
      'HowItWorks',
      'ImpactAxes',
      'Difference',
      'Evidence',
      'Faq',
      'Cta',
    ];
    const sectionNames = acc.elements
      .map((element) => typeName(element.type))
      .filter((name) => order.includes(name));

    expect(sectionNames).toEqual(order);
  });

  it('keeps footer legal links (incl. tokushoho) and brand credit visible', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect(await (MarketingPage as () => Promise<unknown>)());
    const joined = acc.texts.join(' ');

    expect(acc.hrefs).toContain('/privacy');
    expect(acc.hrefs).toContain('/terms');
    expect(acc.hrefs).toContain('/tokushoho');
    expect(joined).toContain('Switch your path.');
    expect(joined).toContain('Genetta Inc.');
  });
});

describe('Smitch marketing landing page — sections', () => {
  it('Hero shows the headline, subtitle, and app + how-it-works CTAs', async () => {
    const { Hero } = await import('@/components/landing/Hero');
    const acc = collect(await Hero());
    const joined = acc.texts.join(' ');

    expect(joined).toContain('Science picks the habits');
    expect(joined).toContain((marketing.hero as Json).subtitle as string);
    // Primary CTA points at the running app host (not a coming-soon anchor).
    expect(acc.hrefs).toContain('https://s-mitch.com');
    expect(acc.hrefs).toContain('#how');
  });

  it('ImpactAxes lists the four KPI axes with a 景表法 estimate/disclaimer note', async () => {
    const { ImpactAxes } = await import('@/components/landing/ImpactAxes');
    const acc = collect(await ImpactAxes());
    const joined = acc.texts.join(' ');

    const axes = (marketing.impact as Json).axes as Array<{ label: string }>;
    expect(axes).toHaveLength(4);
    for (const axis of axes) expect(joined).toContain(axis.label);
    expect(joined).toContain((marketing.impact as Json).note as string);
  });

  it('Difference renders the positioning comparison rows', async () => {
    const { Difference } = await import('@/components/landing/Difference');
    const acc = collect(await Difference());
    const joined = acc.texts.join(' ');

    const rows = (marketing.difference as Json).rows as Array<{ smitch: string }>;
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const row of rows) expect(joined).toContain(row.smitch);
  });

  it('Faq renders at least five honest Q/A items', async () => {
    const { Faq } = await import('@/components/landing/Faq');
    const acc = collect(await Faq());
    const joined = acc.texts.join(' ');

    const items = (marketing.faq as Json).items as Array<{ q: string }>;
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const item of items) expect(joined).toContain(item.q);
  });

  it('Cta drives to the live app and the Founding program, with no fake waitlist form', async () => {
    const { Cta } = await import('@/components/landing/Cta');
    const acc = collect(await Cta());

    expect(acc.hrefs).toContain('https://s-mitch.com');
    expect(acc.hrefs).toContain('https://s-mitch.com/founding');
    // The removed placeholder waitlist form must not come back.
    expect(acc.elements.map((e) => typeName(e.type))).not.toContain('form');
  });
});

describe('Smitch marketing landing page — ja/en parity (Hero required in both)', () => {
  const jaM = (ja as Json).marketing as Json;
  const enM = (en as Json).marketing as Json;

  it('both locales define the marketing namespace with a Hero title', () => {
    expect(typeof (jaM.hero as Json).title).toBe('string');
    expect(typeof (enM.hero as Json).title).toBe('string');
    expect(((jaM.hero as Json).title as string).length).toBeGreaterThan(0);
    expect(((enM.hero as Json).title as string).length).toBeGreaterThan(0);
  });

  it('impact axes, faq, and difference rows match in count across locales', () => {
    expect((jaM.impact as Json).axes).toHaveLength(4);
    expect((enM.impact as Json).axes).toHaveLength(4);
    expect(((jaM.faq as Json).items as unknown[]).length).toBeGreaterThanOrEqual(5);
    expect(((enM.faq as Json).items as unknown[]).length).toBe(
      ((jaM.faq as Json).items as unknown[]).length
    );
    expect(((enM.difference as Json).rows as unknown[]).length).toBe(
      ((jaM.difference as Json).rows as unknown[]).length
    );
  });
});
