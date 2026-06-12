import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

/**
 * S6: founding namespace keys exist in both locales.
 * Requirement: Founding teaser copy is localized via next-intl founding namespace.
 *
 * Asserts both locale files contain a `founding` namespace with an identical
 * key set covering at minimum: hero, tiers, promise, waitlist, faq.
 */

type Json = Record<string, unknown>;

// Recursively collect dotted key paths of an object (leaf paths included at every level).
function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Json)) {
    const path = prefix ? `${prefix}.${k}` : k;
    out.push(path);
    out.push(...keyPaths(v, path));
  }
  return out;
}

describe('S6: founding namespace keys exist in both locales', () => {
  it('both en.json and ja.json contain a founding namespace', () => {
    expect((en as Json).founding).toBeDefined();
    expect((ja as Json).founding).toBeDefined();
  });

  it('founding namespace covers hero, tiers, promise, waitlist, faq in both locales', () => {
    for (const messages of [en, ja]) {
      const founding = (messages as Json).founding as Json;
      expect(founding.hero).toBeDefined();
      expect(founding.tiers).toBeDefined();
      expect(founding.promise).toBeDefined();
      expect(founding.waitlist).toBeDefined();
      expect(founding.faq).toBeDefined();
    }
  });

  it('en and ja founding namespaces have an identical key set', () => {
    const enKeys = keyPaths((en as Json).founding).sort();
    const jaKeys = keyPaths((ja as Json).founding).sort();
    expect(jaKeys).toEqual(enKeys);
  });

  it('faq contains at least 3 question/answer pairs in both locales', () => {
    for (const messages of [en, ja]) {
      const founding = (messages as Json).founding as Json;
      const faq = founding.faq as Json;
      const items = faq.items as unknown[];
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(3);
      for (const item of items as Json[]) {
        expect(typeof item.q).toBe('string');
        expect(typeof item.a).toBe('string');
        expect((item.q as string).length).toBeGreaterThan(0);
        expect((item.a as string).length).toBeGreaterThan(0);
      }
    }
  });
});
