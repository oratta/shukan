import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Tree-walking helper for sync Server Component output.
 * Mirrors the approach used in middleware.test.ts S8 to avoid needing a DOM runtime.
 */
type WalkResult = {
  texts: string[];
  hrefs: string[];
  // Each element: { type, props } pairs
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

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  // Ensure NEXT_PUBLIC_APP_URL is unset so default falls through to https://s-mitch.com
  delete process.env.NEXT_PUBLIC_APP_URL;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('S13: copy.ts exports core strings', () => {
  it('exports tagline, heroSubcopy, problemText, solutionText, ctaLabel, footerCredit', async () => {
    const copy = await import('@/app/marketing/copy');
    expect(typeof copy.tagline).toBe('string');
    expect(copy.tagline).toBe('Switch your path.');

    expect(typeof copy.heroSubcopy).toBe('string');
    expect(copy.heroSubcopy.length).toBeGreaterThan(0);

    expect(typeof copy.problemText).toBe('string');
    expect(copy.problemText.length).toBeGreaterThan(0);

    expect(typeof copy.solutionText).toBe('string');
    expect(copy.solutionText.length).toBeGreaterThan(0);

    expect(typeof copy.ctaLabel).toBe('string');
    expect(copy.ctaLabel).toBe('アプリを始める');

    expect(typeof copy.footerCredit).toBe('string');
    expect(copy.footerCredit).toContain('Genetta');
  });
});

describe('S9: Hero section is visible', () => {
  it('renders <h1> with "Switch your path." and ja subcopy referencing "なりたい自分" and "科学"', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const tree = (MarketingPage as () => unknown)();
    const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(tree, acc);

    // h1 contains tagline
    const h1Elements = getElementsByType(acc, 'h1');
    expect(h1Elements.length).toBe(1);
    const h1Acc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(h1Elements[0].props.children, h1Acc);
    expect(h1Acc.texts.join(' ')).toContain('Switch your path.');

    // Subcopy references "なりたい自分" and "科学"
    const joined = acc.texts.join(' ');
    expect(joined).toContain('なりたい自分');
    expect(joined).toContain('科学');
  });
});

describe('S10: Problem and Solution texts coexist', () => {
  it('renders both problemText and solutionText from copy.ts', async () => {
    const [{ default: MarketingPage }, copy] = await Promise.all([
      import('@/app/marketing/page'),
      import('@/app/marketing/copy'),
    ]);
    const tree = (MarketingPage as () => unknown)();
    const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(tree, acc);
    const joined = acc.texts.join(' ');
    expect(joined).toContain(copy.problemText);
    expect(joined).toContain(copy.solutionText);
  });
});

describe('S11: Primary CTA href points to login', () => {
  it('renders exactly one CTA anchor with href to https://s-mitch.com/login when NEXT_PUBLIC_APP_URL is unset, with copy.ts ctaLabel as accessible label', async () => {
    // Vitest does not re-evaluate dynamically imported ESM modules after env change in the same run.
    // page.tsx reads process.env at render time (function body), so we just need to delete the var before importing.
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const copy = await import('@/app/marketing/copy');
    const tree = (MarketingPage as () => unknown)();
    const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(tree, acc);

    // CTA: anchor whose href ends with /login
    const loginAnchors = acc.elements.filter(
      (e) => e.type === 'a' && typeof e.props.href === 'string' && (e.props.href as string).endsWith('/login')
    );
    expect(loginAnchors.length).toBe(1);
    const cta = loginAnchors[0];
    expect(cta.props.href).toBe('https://s-mitch.com/login');

    // Accessible label: the visible text inside the CTA should be the copy.ts ctaLabel.
    // (No aria-label override: ja label drives the accessible name.)
    const labelAcc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(cta.props.children, labelAcc);
    const labelText = labelAcc.texts.join('').trim();
    expect(labelText).toBe(copy.ctaLabel);
  });
});

describe('S12: Footer links resolve to legal pages', () => {
  it('renders footer with /privacy, /terms anchors and Genetta Inc credit', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    const tree = (MarketingPage as () => unknown)();
    const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(tree, acc);

    // There must be a <footer> element
    const footers = getElementsByType(acc, 'footer');
    expect(footers.length).toBe(1);

    const footerAcc: WalkResult = { texts: [], hrefs: [], elements: [] };
    walk(footers[0].props.children, footerAcc);

    expect(footerAcc.hrefs).toContain('/privacy');
    expect(footerAcc.hrefs).toContain('/terms');
    const footerText = footerAcc.texts.join(' ');
    expect(footerText.toLowerCase()).toContain('genetta inc');
  });
});
