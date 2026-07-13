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
  'Kpis',
  'Proof',
  'Cumulative',
  'Doctrine',
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

  it('explains the four KPIs and hands off to the evidence section', async () => {
    const { Kpis } = await import('@/components/landing/manifesto/Kpis');
    const joined = collect(await Kpis()).texts.join(' ');

    for (const kpi of ['健康寿命', '前向きな気持ちの時間', '出費削減', '増える収入']) {
      expect(joined).toContain(kpi);
    }
    // 各 KPI に説明文が付く
    expect(joined).toContain('健康に過ごせる時間');
    // 章末の問いが次章（証拠）への橋渡しになる
    expect(joined).toContain('実際にどれだけ動かす');
  });

  it('backs the reversal with figures derived from the evidence dataset', async () => {
    const [{ Proof }, figures] = await Promise.all([
      import('@/components/landing/manifesto/Proof'),
      import('@/lib/marketing/evidence-figures'),
    ]);
    const joined = collect(await Proof()).texts.join(' ');

    // 4 軸の名前は台帳テーブルの列見出しとして残る
    for (const axis of ['健康寿命', '前向きな気持ちの時間', '出費削減', '増える収入']) {
      expect(joined).toContain(axis);
    }
    // 代表 8 習慣がすべて行として出る（コピーは ja.json の habits ラベル）
    const habitLabels = ((ja as Json).marketing as Json).habits as Record<string, string>;
    for (const id of figures.FEATURED_ARTICLE_IDS) {
      expect(joined).toContain(habitLabels[id]);
    }
    // コーパスの実数（記事数）がデータセット由来で出る
    const corpus = figures.getCorpusFigures();
    expect(joined).toContain(Math.round(corpus.articleCount).toLocaleString('en-US'));
    // 禁煙の外れ値ブロックは削除済み（作図都合の説明をユーザに見せない）
    expect(joined).not.toContain('禁煙');
    // 推定値である旨の断りを外さない（景表法まわりのガード）
    expect(joined).toContain('お約束するものではありません');
  });

  it('compounds the daily figure into a life-scale number over ten years', async () => {
    const [{ Cumulative }, figures] = await Promise.all([
      import('@/components/landing/manifesto/Cumulative'),
      import('@/lib/marketing/evidence-figures'),
    ]);
    const acc = collect(await Cumulative());
    const joined = acc.texts.join(' ');

    const series = figures.getCumulativeSeries();
    const finalDays = series[series.length - 1].healthyDays;
    expect(joined).toContain(`+${Math.round(finalDays).toLocaleString('en-US')}`);
    expect(joined).toContain('お約束するものではありません');
    // 数字の直後に導線を置く（このページの主 CV ポイント）
    expect(acc.hrefs).toContain('/founding');
  });

  it('refuses to over-promise and discloses the confidence distribution', async () => {
    const [{ Honesty }, figures] = await Promise.all([
      import('@/components/landing/manifesto/Honesty'),
      import('@/lib/marketing/evidence-figures'),
    ]);
    const joined = collect(await Honesty()).texts.join(' ');

    expect(joined).toContain('約束しないこと。');
    expect(joined).toContain('偽のカウントダウンや、盛った利用者数は出しません。');
    // 信頼度の内訳を実数で開示する（ゼロ件のカテゴリは表示しない）
    const corpus = figures.getCorpusFigures();
    for (const level of ['high', 'medium', 'low'] as const) {
      if (corpus.confidence[level] > 0) {
        expect(joined).toContain(String(corpus.confidence[level]));
      }
    }
    // 作り手側の編集判断ではなく、製品の主張として語る（内情コピーの再発ガード）
    expect(joined).not.toContain('表から外して');
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
      import('@/components/landing/manifesto/Kpis').then((m) => m.Kpis()),
      import('@/components/landing/manifesto/Proof').then((m) => m.Proof()),
      import('@/components/landing/manifesto/Cumulative').then((m) => m.Cumulative()),
      import('@/components/landing/manifesto/Method').then((m) => m.Method()),
      import('@/components/landing/manifesto/Honesty').then((m) => m.Honesty()),
      import('@/components/landing/manifesto/CallToAction').then((m) => m.CallToAction()),
    ]);

    const types = sections.flatMap((tree) => collect(tree).elements.map((e) => typeName(e.type)));
    expect(types).not.toContain('img');
    expect(types).not.toContain('Image');
  });
});
