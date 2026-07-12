import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

/**
 * Manifesto LP のコピーは next-intl の `marketing` namespace が単一ソース。
 * ja / en の両方が完全に揃っていること（キー集合の一致・配列長の一致）を固定する。
 */

type Json = Record<string, unknown>;

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

const marketingJa = (ja as Json).marketing as Json;
const marketingEn = (en as Json).marketing as Json;

describe('marketing namespace exists in both locales', () => {
  it('both en.json and ja.json contain a marketing namespace', () => {
    expect(marketingJa).toBeDefined();
    expect(marketingEn).toBeDefined();
  });

  it('covers every manifesto section', () => {
    for (const messages of [marketingJa, marketingEn]) {
      for (const section of [
        'nav',
        'hero',
        'indictment',
        'turn',
        'proof',
        'cumulative',
        'doctrine',
        'method',
        'honesty',
        'cta',
        'footer',
      ]) {
        expect(messages[section]).toBeDefined();
      }
    }
  });

  it('en and ja marketing namespaces have an identical key set', () => {
    expect(keyPaths(marketingJa).sort()).toEqual(keyPaths(marketingEn).sort());
  });
});

describe('marketing namespace list copy is complete in both locales', () => {
  const listPaths = [
    'hero.lines',
    'indictment.lines',
    'indictment.items',
    'turn.lines',
    'proof.lines',
    'cumulative.lines',
    'doctrine.items',
    'method.steps',
    'honesty.items',
    'cta.lines',
  ];

  function at(messages: Json, path: string): unknown {
    let cur: unknown = messages;
    for (const part of path.split('.')) {
      if (cur && typeof cur === 'object') cur = (cur as Json)[part];
    }
    return cur;
  }

  it('every list is a non-empty array of the same length in ja and en', () => {
    for (const path of listPaths) {
      const jaList = at(marketingJa, path);
      const enList = at(marketingEn, path);
      expect(Array.isArray(jaList), `ja ${path}`).toBe(true);
      expect(Array.isArray(enList), `en ${path}`).toBe(true);
      expect((jaList as unknown[]).length).toBeGreaterThan(0);
      expect((enList as unknown[]).length).toBe((jaList as unknown[]).length);
    }
  });

  it('title/body pairs are non-empty strings in both locales', () => {
    for (const path of ['indictment.items', 'doctrine.items', 'method.steps']) {
      for (const messages of [marketingJa, marketingEn]) {
        const items = at(messages, path) as Array<{ title: string; body: string }>;
        for (const item of items) {
          expect(typeof item.title).toBe('string');
          expect(item.title.length).toBeGreaterThan(0);
          expect(typeof item.body).toBe('string');
          expect(item.body.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
