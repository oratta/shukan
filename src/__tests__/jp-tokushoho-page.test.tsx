import { describe, it, expect } from 'vitest';

/**
 * change-D S1: Tokushoho page renders mandatory items.
 * change-D S2: Tokushoho page is reachable from pages that display prices.
 * Tasks: 2.1, 2.3
 *
 * Structural tree-walk over the Server Component output (same approach as
 * marketing-page.test.tsx / founding-page.test.tsx) — no DOM runtime needed.
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

async function renderTokushoho(): Promise<WalkResult> {
  const { default: Page } = await import('@/app/tokushoho/page');
  const tree = (Page as () => unknown)();
  const acc: WalkResult = { texts: [], hrefs: [], elements: [] };
  walk(tree, acc);
  return acc;
}

const MANDATORY_LABELS = [
  '事業者名',
  '所在地',
  '連絡先',
  '販売価格',
  '支払', // 支払方法 / 支払時期
  '提供時期', // 役務（サービス）の提供時期
  '返品', // 返品・解約に関する事項
];

describe('S1: Tokushoho page renders mandatory items', () => {
  it('contains every mandatory 特商法 section label', async () => {
    const acc = await renderTokushoho();
    const joined = acc.texts.join(' ');
    for (const label of MANDATORY_LABELS) {
      expect(joined, `missing mandatory label: ${label}`).toContain(label);
    }
  });

  it('mentions 支払方法 and 支払時期 distinctly', async () => {
    const acc = await renderTokushoho();
    const joined = acc.texts.join(' ');
    expect(joined).toContain('支払方法');
    expect(joined).toContain('支払時期');
  });

  it('states 販売価格 as a tax-inclusive (税込) total', async () => {
    const acc = await renderTokushoho();
    const joined = acc.texts.join(' ');
    expect(joined).toContain('税込');
    // All three plan amounts are listed
    expect(joined).toContain('4.99');
    expect(joined).toContain('39.99');
    expect(joined).toContain('99');
  });

  it('contains no developer-leftover placeholders (TODO/XXX)', async () => {
    const acc = await renderTokushoho();
    const joined = acc.texts.join(' ');
    expect(joined).not.toMatch(/\bTODO\b/);
    expect(joined).not.toMatch(/\bXXX\b/);
    expect(joined).not.toContain('lorem ipsum');
  });
});

describe('S2: Tokushoho page is reachable from price-displaying pages', () => {
  it('founding teaser footer links to /tokushoho', async () => {
    // The teaser displays Lifetime/subscription pricing context, so it must link
    // to the 特商法表記 page (spec S2).
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(process.cwd(), 'src/app/founding/page.tsx'),
      'utf8'
    );
    expect(src).toContain('/tokushoho');
  });

  it('account/billing (settings) screen links to /tokushoho', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const src = readFileSync(
      path.resolve(process.cwd(), 'src/app/(app)/settings/page.tsx'),
      'utf8'
    );
    expect(src).toContain('/tokushoho');
  });
});
