import { describe, expect, it, vi } from 'vitest';
import ja from '@/messages/ja.json';

/**
 * Manifesto LP の構造テスト。
 *
 * コピーは next-intl の `marketing` namespace が単一ソースなので、ここでは
 * getTranslations を ja.json 直読みに差し替えて Server Component を評価する。
 * 文言そのものではなく「宣言 → 告発 → 転回 → … → CTA」の骨格と、
 * CTA / フッターのリンク先という LP のコンバージョン導線を固定する。
 */

type Json = Record<string, unknown>;

function lookup(ns: Json, key: string): unknown {
  let cur: unknown = ns;
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object') cur = (cur as Json)[part];
  }
  return cur;
}

function makeT(namespace: string) {
  const ns = (ja as Json)[namespace] as Json;
  const t = (key: string) => {
    const value = lookup(ns, key);
    return typeof value === 'string' ? value : key;
  };
  t.raw = (key: string) => lookup(ns, key);
  return t;
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => makeT(namespace)),
  getLocale: vi.fn(async () => 'ja'),
}));

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

const SECTIONS = [
  'Masthead',
  'Declaration',
  'Indictment',
  'Turn',
  'Doctrine',
  'ImpactAxes',
  'Method',
  'Honesty',
  'CallToAction',
  'SiteFooter',
] as const;

describe('Smitch marketing landing page (Manifesto)', () => {
  it('assembles the manifesto sections in declaration order', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect((MarketingPage as () => unknown)());

    const rendered = acc.elements
      .map((element) => typeName(element.type))
      .filter((name) => (SECTIONS as readonly string[]).includes(name));

    expect(rendered).toEqual([...SECTIONS]);
  });

  it('opens by negating habit apps and closes on the founding CTA', async () => {
    const [{ Declaration }, { CallToAction }] = await Promise.all([
      import('@/components/landing/manifesto/Declaration'),
      import('@/components/landing/manifesto/CallToAction'),
    ]);

    const hero = collect(await Declaration());
    const cta = collect(await CallToAction());

    expect(hero.texts.join(' ')).toContain('習慣アプリは、');
    expect(hero.texts.join(' ')).toContain('変えなかった。');
    expect(hero.hrefs).toContain('/founding');

    expect(cta.hrefs).toContain('/founding');
    expect(cta.hrefs).toContain('https://s-mitch.com');
  });

  it('states the indictment, the reversal, and the three declarations', async () => {
    const [{ Indictment }, { Turn }, { Doctrine }] = await Promise.all([
      import('@/components/landing/manifesto/Indictment'),
      import('@/components/landing/manifesto/Turn'),
      import('@/components/landing/manifesto/Doctrine'),
    ]);

    const joined = [await Indictment(), await Turn(), await Doctrine()]
      .map((tree) => collect(tree).texts.join(' '))
      .join(' ');

    expect(joined).toContain('ストリークは、人生の指標ではない。');
    expect(joined).toContain('順番を');
    expect(joined).toContain('なりたい自分から始める。');
  });

  it('names the four impact axes without asserting any concrete number', async () => {
    const { ImpactAxes } = await import('@/components/landing/manifesto/ImpactAxes');
    const joined = collect(await ImpactAxes()).texts.join(' ');

    for (const axis of ['健康寿命', '前向きな気持ちの時間', '出費削減', '増える収入']) {
      expect(joined).toContain(axis);
    }
    // 推定値である旨の断りを外さない（景表法まわりのガード）
    expect(joined).toContain('約束ではない');
  });

  it('refuses to over-promise in the honesty section', async () => {
    const { Honesty } = await import('@/components/landing/manifesto/Honesty');
    const joined = collect(await Honesty()).texts.join(' ');

    expect(joined).toContain('約束しないこと。');
    expect(joined).toContain('偽のカウントダウンも、盛った利用者数も出さない。');
  });

  it('keeps footer legal links and brand credit visible', async () => {
    const { SiteFooter } = await import('@/components/landing/manifesto/SiteFooter');
    const acc = collect(await SiteFooter());

    expect(acc.hrefs).toContain('/privacy');
    expect(acc.hrefs).toContain('/terms');
    expect(acc.hrefs).toContain('/tokushoho');
    expect(acc.texts.join(' ')).toContain('Switch your path.');
    expect(acc.texts.join(' ')).toContain('Genetta Inc.');
  });

  it('renders no imagery — the manifesto is type, rules, and flat blocks only', async () => {
    const sections = await Promise.all([
      import('@/components/landing/manifesto/Declaration').then((m) => m.Declaration()),
      import('@/components/landing/manifesto/Indictment').then((m) => m.Indictment()),
      import('@/components/landing/manifesto/Turn').then((m) => m.Turn()),
      import('@/components/landing/manifesto/Doctrine').then((m) => m.Doctrine()),
      import('@/components/landing/manifesto/ImpactAxes').then((m) => m.ImpactAxes()),
      import('@/components/landing/manifesto/Method').then((m) => m.Method()),
      import('@/components/landing/manifesto/Honesty').then((m) => m.Honesty()),
      import('@/components/landing/manifesto/CallToAction').then((m) => m.CallToAction()),
    ]);

    const types = sections.flatMap((tree) => collect(tree).elements.map((e) => typeName(e.type)));
    expect(types).not.toContain('img');
    expect(types).not.toContain('Image');
  });
});
