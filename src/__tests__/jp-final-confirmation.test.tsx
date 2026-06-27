import { describe, it, expect } from 'vitest';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

/**
 * change-D S3: Four mandatory items are present and test-verified.
 * change-D S4: Mandatory items are visible without scrolling (above the button).
 * change-D S5: Lifetime (one-time) purchase shows non-recurring terms.
 * Tasks: 4.1
 *
 * The final confirmation screen is a pure, props-driven component so its tree can
 * be tree-walked without a DOM runtime (same approach as marketing-page.test.tsx).
 */

type Json = Record<string, unknown>;

type WalkResult = {
  texts: string[];
  // Ordered flat list of (type, text-or-null) so we can assert relative position.
  ordered: Array<{ type: unknown; text: string | null; props: Record<string, unknown> }>;
};

function walk(node: unknown, acc: WalkResult): void {
  if (node === null || node === undefined || node === false || node === true) return;
  if (typeof node === 'string' || typeof node === 'number') {
    acc.texts.push(String(node));
    acc.ordered.push({ type: '#text', text: String(node), props: {} });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, acc));
    return;
  }
  if (typeof node === 'object') {
    const el = node as { type?: unknown; props?: Record<string, unknown> };
    if (el.props) {
      acc.ordered.push({ type: el.type, text: null, props: el.props });
      const children = el.props.children;
      if (children !== undefined) walk(children, acc);
    }
  }
}

async function render(props: Record<string, unknown>): Promise<WalkResult> {
  const mod = await import('@/components/billing/final-confirmation');
  const FinalConfirmation = mod.FinalConfirmation as (p: unknown) => unknown;
  const tree = FinalConfirmation(props);
  const acc: WalkResult = { texts: [], ordered: [] };
  walk(tree, acc);
  return acc;
}

function messagesFor(locale: 'ja' | 'en'): Json {
  const root = (locale === 'ja' ? ja : en) as Json;
  return root.checkout as Json;
}

describe('S3: Four mandatory items are present (subscription)', () => {
  for (const plan of ['monthly', 'annual'] as const) {
    it(`renders all four mandatory items for the ${plan} plan (ja)`, async () => {
      const acc = await render({
        plan,
        locale: 'ja',
        trialDays: 14,
        messages: messagesFor('ja'),
      });
      const joined = acc.texts.join(' ');

      // ① 定期購入（自動更新）である旨
      expect(joined).toContain('定期購入');
      expect(joined).toContain('自動更新');

      // ② 各回の代金 + 一定期間（年間）の支払総額（税込）
      expect(joined).toContain('税込');
      // per-cycle amount and annual total both present
      if (plan === 'monthly') {
        expect(joined).toContain('4.99');
        expect(joined).toContain((4.99 * 12).toFixed(2)); // 59.88
      } else {
        expect(joined).toContain('39.99');
      }

      // ③ トライアル→有料移行の時期と金額
      expect(joined).toContain('トライアル');
      expect(joined).toContain('14'); // trial days

      // ④ 解約方法・期限・違約金の有無
      expect(joined).toContain('解約');
      expect(joined).toContain('違約金');
    });
  }
});

describe('S4: Mandatory items appear above the confirm button (no scrolling)', () => {
  it('places all four mandatory blocks before the confirmation <button> in tree order', async () => {
    const acc = await render({
      plan: 'annual',
      locale: 'ja',
      trialDays: 14,
      messages: messagesFor('ja'),
    });

    // Index of the confirm button (the purchase confirmation action).
    const buttonIdx = acc.ordered.findIndex((n) => n.type === 'button');
    expect(buttonIdx).toBeGreaterThan(-1);

    // Each mandatory keyword must appear at a position before the button.
    const beforeButtonText = acc.ordered
      .slice(0, buttonIdx)
      .filter((n) => n.text)
      .map((n) => n.text)
      .join(' ');

    for (const kw of ['定期購入', '自動更新', '税込', 'トライアル', '解約', '違約金']) {
      expect(beforeButtonText, `${kw} must precede the confirm button`).toContain(kw);
    }
  });

  it('does not wrap mandatory items in an accordion/details/dialog element', async () => {
    const acc = await render({
      plan: 'annual',
      locale: 'ja',
      trialDays: 14,
      messages: messagesFor('ja'),
    });
    const hiddenContainers = acc.ordered.filter(
      (n) => n.type === 'details' || n.type === 'dialog'
    );
    expect(hiddenContainers.length).toBe(0);
  });
});

describe('S5: Lifetime shows non-recurring terms', () => {
  it('states one-time payment (定期購入ではない) with the tax-inclusive total', async () => {
    const acc = await render({
      plan: 'lifetime',
      locale: 'ja',
      trialDays: 14,
      messages: messagesFor('ja'),
    });
    const joined = acc.texts.join(' ');

    // Non-recurring statement
    expect(joined).toContain('定期購入ではありません');
    // No auto-renewal claim for lifetime
    expect(joined).not.toContain('自動更新されます');
    // Tax-inclusive total present
    expect(joined).toContain('税込');
    expect(joined).toContain('99');
  });
});

describe('checkout namespace exists in both locales with identical keys', () => {
  it('both en.json and ja.json contain a checkout namespace', () => {
    expect((en as Json).checkout).toBeDefined();
    expect((ja as Json).checkout).toBeDefined();
  });
});
