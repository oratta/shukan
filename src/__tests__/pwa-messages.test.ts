import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import { PWA_MESSAGE_KEYS } from '@/lib/pwa/message-keys';

function resolve(obj: unknown, dottedKey: string): unknown {
  return dottedKey.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

describe('PWA i18n message keys (S13)', () => {
  it.each(PWA_MESSAGE_KEYS)('en.json has key %s as a non-empty string', (key) => {
    const value = resolve(en, key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
  });

  it.each(PWA_MESSAGE_KEYS)('ja.json has key %s as a non-empty string', (key) => {
    const value = resolve(ja, key);
    expect(typeof value).toBe('string');
    expect((value as string).length).toBeGreaterThan(0);
  });

  it('en and ja expose the exact same pwa key set', () => {
    const enPwa = (en as Record<string, unknown>).pwa;
    const jaPwa = (ja as Record<string, unknown>).pwa;
    expect(enPwa).toBeDefined();
    expect(jaPwa).toBeDefined();
    expect(Object.keys(flatten(enPwa)).sort()).toEqual(Object.keys(flatten(jaPwa)).sort());
  });
});

function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
      else out[key] = String(v);
    }
  }
  return out;
}
