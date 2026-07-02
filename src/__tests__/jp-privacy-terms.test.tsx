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

describe('Terms: estimate / AI-generated content clause', () => {
  it('has a dedicated clause stating estimates are non-guaranteed references', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    // 非保証（個人の結果を保証しない）+ 個人差 + 目安 の3点セット
    expect(joined).toContain('保証するものではありません');
    expect(joined).toContain('個人差');
    expect(joined).toContain('目安');
  });

  it('discloses AI (LLM) involvement and possible inaccuracy', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('大規模言語モデル');
    expect(joined).toContain('不正確');
  });

  it('denies medical / financial professional advice and points to experts', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('診断');
    expect(joined).toContain('専門家');
  });

  it('avoids blanket exemption and salvage clauses (消費者契約法8条)', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    // 全部免責（8条1項で無効）とサルベージ条項（8条3項で無効）を禁止
    expect(joined).not.toContain('一切責任を負いません');
    expect(joined).not.toContain('いかなる損害');
    expect(joined).not.toContain('法令上許容される最大限');
    // 一部免責が軽過失限定であることの明示（8条3項対応）
    expect(joined).toContain('故意または重大な過失');
  });
});

describe('Terms: minors clause', () => {
  it('requires legal guardian consent for minors, especially for paid plans', async () => {
    const acc = await renderPage('terms');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('未成年');
    expect(joined).toContain('法定代理人');
  });
});

describe('Privacy: third-party provision and AI clauses', () => {
  it('lists the standard exceptions instead of a blanket no-provision claim', async () => {
    const acc = await renderPage('privacy');
    const joined = acc.texts.join(' ');
    expect(joined).not.toContain('第三者へのデータ販売・提供は一切行いません');
    expect(joined).toContain('法令に基づく場合');
    expect(joined).toContain('事業承継');
  });

  it('discloses overseas processors (US) for Stripe / Vercel', async () => {
    const acc = await renderPage('privacy');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('米国');
    expect(joined).toContain('外国にある第三者');
  });

  it('states user data is not used for AI model training', async () => {
    const acc = await renderPage('privacy');
    const joined = acc.texts.join(' ');
    expect(joined).toContain('学習に利用されることはありません');
  });
});
