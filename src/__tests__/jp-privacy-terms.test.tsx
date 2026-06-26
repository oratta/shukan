import { describe, it, expect } from 'vitest';

/**
 * change-D S10: Privacy page mentions waitlist email and Stripe payment data.
 * change-D S11: Terms page no longer claims the service is free.
 * Tasks: 3.1
 *
 * Tree-walk over the Server Component output (no DOM runtime needed).
 */

type WalkResult = { texts: string[]; hrefs: string[]; sections: number };

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
    if (el.type === 'section') acc.sections += 1;
    if (el.props) {
      const href = el.props.href;
      if (typeof href === 'string') acc.hrefs.push(href);
      const children = el.props.children;
      if (children !== undefined) walk(children, acc);
    }
  }
}

async function renderPage(which: 'privacy' | 'terms'): Promise<WalkResult> {
  const mod =
    which === 'privacy'
      ? await import('@/app/privacy/page')
      : await import('@/app/terms/page');
  const Page = mod.default as () => unknown;
  const tree = Page();
  const acc: WalkResult = { texts: [], hrefs: [], sections: 0 };
  walk(tree, acc);
  return acc;
}

describe('S10: Privacy page covers waitlist email and Stripe payment data', () => {
  it('mentions collecting waitlist email addresses and their purpose', async () => {
    const acc = await renderPage('privacy');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('waitlist');
    expect(joined).toContain('メールアドレス');
  });

  it('states payment processing is delegated to Stripe and what is sent', async () => {
    const acc = await renderPage('privacy');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('Stripe');
    expect(joined).toContain('決済');
    // Card data is NOT stored on our servers
    expect(joined).toContain('カード情報');
  });

  it('links to Stripe privacy policy', async () => {
    const acc = await renderPage('privacy');
    expect(acc.hrefs.some((h) => h.includes('stripe.com'))).toBe(true);
  });

  it('preserves the existing section structure (>= 12 sections)', async () => {
    const acc = await renderPage('privacy');
    expect(acc.sections).toBeGreaterThanOrEqual(12);
  });
});

describe('S11: Terms page no longer claims the service is only free', () => {
  it('does not state the service is provided 無償 as its only mode', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    // The original blanket "無償で提供されています" claim must be gone.
    expect(joined).not.toContain('無償で提供されています');
    expect(joined).not.toContain('本サービスは無償で提供されており');
  });

  it('references paid plans and points to the 特商法表記 page', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('有料');
    expect(acc.hrefs).toContain('/tokushoho');
  });
});
