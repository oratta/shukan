import { describe, expect, it } from 'vitest';

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

describe('Smitch marketing landing page', () => {
  it('assembles the eight image-to-code LP sections in order', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect((MarketingPage as () => unknown)());

    const sectionNames = acc.elements
      .map((element) => typeName(element.type))
      .filter((name) =>
        [
          'Hero',
          'Problem',
          'Process',
          'Detail',
          'OutcomeGallery',
          'SelectionCriterion',
          'Testimony',
          'CtaWaitlistForm',
        ].includes(name)
      );

    expect(sectionNames).toEqual([
      'Hero',
      'Problem',
      'Process',
      'Detail',
      'OutcomeGallery',
      'SelectionCriterion',
      'Testimony',
      'CtaWaitlistForm',
    ]);
  });

  it('keeps footer legal links and brand credit visible', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const acc = collect((MarketingPage as () => unknown)());
    const joined = acc.texts.join(' ');

    expect(acc.hrefs).toContain('/privacy');
    expect(acc.hrefs).toContain('/terms');
    expect(joined).toContain('Switch your path.');
    expect(joined).toContain('Genetta Inc.');
  });

  it('renders hero headline, positioning copy, and primary section links', async () => {
    const { Hero } = await import('@/components/landing/Hero');
    const acc = collect(Hero());
    const joined = acc.texts.join(' ');

    expect(joined).toContain('人生は、');
    expect(joined).toContain('続けた日数では');
    expect(joined).toContain('科学的根拠のある習慣');
    expect(acc.hrefs).toContain('#waitlist');
    expect(acc.hrefs).toContain('#process');
  });

  it('renders the problem, process, detail, outcome, selection, and testimony section copy', async () => {
    const [
      { Problem },
      { Process },
      { Detail },
      { OutcomeGallery },
      { SelectionCriterion },
      { Testimony },
    ] = await Promise.all([
      import('@/components/landing/Problem'),
      import('@/components/landing/Process'),
      import('@/components/landing/Detail'),
      import('@/components/landing/OutcomeGallery'),
      import('@/components/landing/SelectionCriterion'),
      import('@/components/landing/Testimony'),
    ]);

    const joined = [
      Problem(),
      Process(),
      Detail(),
      OutcomeGallery(),
      SelectionCriterion(),
      Testimony(),
    ]
      .map((tree) => collect(tree).texts.join(' '))
      .join(' ');

    expect(joined).toContain('習慣アプリに、');
    expect(joined).toContain('能動的に選び取る');
    expect(joined).toContain('判断材料');
    expect(joined).toContain('生活に戻ってくるもの');
    expect(joined).toContain('問題はそこではない');
    expect(joined).toContain('ストリークを守るためではなく');
  });
});
