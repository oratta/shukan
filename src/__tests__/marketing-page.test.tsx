import { describe, expect, it, vi } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import {
  getColumnMaxima,
  getCorpusFigures,
  getCumulativeSeries,
  getFeaturedHabits,
  getOutlierHabit,
  MODEL_PROFILE,
} from '@/lib/marketing/evidence-figures';

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
      // SectionHeading carries its copy in props rather than children.
      for (const key of ['title', 'lede'] as const) {
        const value = el.props[key];
        if (typeof value === 'string') acc.texts.push(value);
      }
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
  const lookup = (key: string): unknown => {
    let cur: unknown = ns;
    for (const part of key.split('.')) {
      if (cur && typeof cur === 'object') cur = (cur as Json)[part];
    }
    return cur;
  };
  const t = (key: string, values?: Record<string, unknown>) => {
    const raw = lookup(key);
    if (typeof raw !== 'string') return key;
    if (!values) return raw;
    return Object.entries(values).reduce(
      (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
      raw
    );
  };
  t.raw = lookup;
  return t;
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => makeT(namespace)),
  getLocale: vi.fn(async () => 'en'),
}));

const marketing = (en as unknown as { marketing: Json }).marketing;

describe('Smitch marketing landing page (Clarity)', () => {
  it('assembles the Clarity sections in order', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect(await MarketingPage());

    const known = [
      'Masthead',
      'Hero',
      'AxisLegend',
      'HabitTable',
      'CumulativeChart',
      'ConfidenceDistribution',
      'MethodNote',
      'References',
      'Cta',
    ];
    const sectionNames = acc.elements
      .map((element) => typeName(element.type))
      .filter((name) => known.includes(name));

    expect(sectionNames).toEqual(known);
  });

  it('keeps footer legal links and brand credit visible', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect(await MarketingPage());
    const joined = acc.texts.join(' ');

    expect(acc.hrefs).toContain('/privacy');
    expect(acc.hrefs).toContain('/terms');
    expect(joined).toContain('Switch your path.');
    expect(joined).toContain('Genetta Inc.');
  });

  it('carries no hero photography (the Clarity variant is figure-only)', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect(await MarketingPage());

    const imageTypes = acc.elements.map((element) => typeName(element.type));
    expect(imageTypes).not.toContain('Image');
    expect(imageTypes).not.toContain('img');
  });
});

describe('Hero', () => {
  it('renders the corpus figures derived from the evidence dataset', async () => {
    const { Hero } = await import('@/components/landing/clarity/Hero');
    const acc = collect(await Hero());
    const corpus = getCorpusFigures();

    expect(acc.texts).toContain(String(corpus.articleCount));
    expect(acc.texts).toContain(String(corpus.sourceCount));
    expect(acc.texts).toContain(String(corpus.confidence.high));
  });

  it('links to the founding signup and to the method section', async () => {
    const { Hero } = await import('@/components/landing/clarity/Hero');
    const acc = collect(await Hero());

    expect(acc.hrefs).toContain('/founding');
    expect(acc.hrefs).toContain('#method');
  });
});

describe('HabitTable', () => {
  it('prints every featured habit value straight from the dataset', async () => {
    const { HabitTable } = await import('@/components/landing/clarity/HabitTable');
    const acc = collect(await HabitTable());
    const rendered = acc.texts.join(' ');

    for (const row of getFeaturedHabits()) {
      const label = (marketing.habits as Record<string, string>)[row.id];
      expect(label, `missing en label for ${row.id}`).toBeTruthy();
      expect(rendered).toContain(label);
      expect(acc.texts).toContain(String(row.healthMinutes));
      expect(acc.texts).toContain(String(row.positiveMoodMinutes));
    }
  });

  it('holds the smoking outlier out of the table and states its ratio', async () => {
    const { HabitTable } = await import('@/components/landing/clarity/HabitTable');
    const acc = collect(await HabitTable());
    const rendered = acc.texts.join(' ');

    const outlier = getOutlierHabit();
    const maxima = getColumnMaxima(getFeaturedHabits());
    const ratio = (Math.round((outlier.healthMinutes / maxima.healthMinutes) * 10) / 10).toFixed(1);

    expect(outlier.healthMinutes).toBeGreaterThan(maxima.healthMinutes);
    expect(rendered).toContain(String(outlier.healthMinutes));
    expect(rendered).toContain(ratio);
  });
});

describe('CumulativeChart', () => {
  it('reads out the ten-year total computed from the dataset', async () => {
    const { CumulativeChart } = await import('@/components/landing/clarity/CumulativeChart');
    const acc = collect(await CumulativeChart());
    const rendered = acc.texts.join(' ');

    const series = getCumulativeSeries();
    const finalDays = series[series.length - 1].healthyDays;
    const expected = (Math.round(finalDays * 10) / 10).toFixed(1);

    expect(rendered).toContain(expected);
  });

  it('exposes the plotted values to screen readers as a table', async () => {
    const { CumulativeChart } = await import('@/components/landing/clarity/CumulativeChart');
    const acc = collect(await CumulativeChart());

    const svg = acc.elements.find((element) => typeName(element.type) === 'svg');
    expect(svg?.props.role).toBe('img');

    const table = acc.elements.find((element) => typeName(element.type) === 'table');
    expect(table?.props.className).toContain('sr-only');
  });
});

describe('ConfidenceDistribution', () => {
  it('shows the real confidence counts across all evidence articles', async () => {
    const { ConfidenceDistribution } = await import(
      '@/components/landing/clarity/ConfidenceDistribution'
    );
    const acc = collect(await ConfidenceDistribution());
    const { confidence } = getCorpusFigures();

    expect(acc.texts).toContain(String(confidence.high));
    expect(acc.texts).toContain(String(confidence.medium));
    expect(acc.texts).toContain(String(confidence.low));
  });
});

describe('MethodNote', () => {
  it('discloses the model profile the figures are computed for', async () => {
    const { MethodNote } = await import('@/components/landing/clarity/MethodNote');
    const acc = collect(await MethodNote());
    const rendered = acc.texts.join(' ');

    expect(rendered).toContain(String(MODEL_PROFILE.age));
    expect(rendered).toContain(MODEL_PROFILE.annualIncome.toLocaleString('en-US'));
    expect(rendered).toContain(String(MODEL_PROFILE.remainingLifeExpectancy));
    // The disclaimer is the point of this section: it must survive copy edits.
    expect(rendered).toContain('not medical advice');
  });
});

describe('References', () => {
  it('cites real papers with their DOI links', async () => {
    const { References } = await import('@/components/landing/clarity/References');
    const acc = collect(await References());
    const rendered = acc.texts.join(' ');

    expect(rendered).toContain('Lancet Public Health');
    expect(acc.hrefs.some((href) => href.startsWith('https://doi.org/'))).toBe(true);
  });
});

describe('marketing message catalogue', () => {
  function keyPaths(value: unknown, prefix = ''): string[] {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
    return Object.entries(value as Json).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key)
    );
  }

  it('has identical keys in ja and en', () => {
    const jaKeys = keyPaths((ja as unknown as { marketing: Json }).marketing).sort();
    const enKeys = keyPaths((en as unknown as { marketing: Json }).marketing).sort();
    expect(jaKeys).toEqual(enKeys);
    expect(jaKeys.length).toBeGreaterThan(0);
  });

  it('labels every habit rendered on the page in both locales', () => {
    const ids = [...getFeaturedHabits().map((row) => row.id), getOutlierHabit().id];
    const jaHabits = (ja as unknown as { marketing: { habits: Record<string, string> } }).marketing
      .habits;
    const enHabits = (en as unknown as { marketing: { habits: Record<string, string> } }).marketing
      .habits;

    for (const id of ids) {
      expect(jaHabits[id], `ja label missing for ${id}`).toBeTruthy();
      expect(enHabits[id], `en label missing for ${id}`).toBeTruthy();
    }
  });
});
