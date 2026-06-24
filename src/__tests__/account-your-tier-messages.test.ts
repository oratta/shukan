import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

/**
 * Feedback D14: the「あなたのtier」copy keys must exist in both locales.
 *  - yourTierHeading: section sub-label
 *  - yourTierPredicted: "{tier} applies if you join now" (placeholder {tier})
 *  - yourTierLocked: "You are {tier}" (placeholder {tier})
 *  - yourTierEnded: founding seats are gone (regular pricing)
 *  - yourTierBadge: the "← your tier" highlight badge
 */

const D14_KEYS = [
  'yourTierHeading',
  'yourTierPredicted',
  'yourTierLocked',
  'yourTierEnded',
  'yourTierBadge',
] as const;

describe('D14: account namespace carries the your-tier keys in en and ja', () => {
  it('en defines every your-tier key as a non-empty string', () => {
    const account = en.account as Record<string, unknown>;
    for (const key of D14_KEYS) {
      expect(typeof account[key], `en.account.${key}`).toBe('string');
      expect((account[key] as string).length).toBeGreaterThan(0);
    }
  });

  it('ja defines every your-tier key as a non-empty string', () => {
    const account = ja.account as Record<string, unknown>;
    for (const key of D14_KEYS) {
      expect(typeof account[key], `ja.account.${key}`).toBe('string');
      expect((account[key] as string).length).toBeGreaterThan(0);
    }
  });

  it('the {tier} placeholder is present in the predicted and locked templates', () => {
    for (const messages of [en, ja]) {
      const account = messages.account as Record<string, string>;
      expect(account.yourTierPredicted).toContain('{tier}');
      expect(account.yourTierLocked).toContain('{tier}');
    }
  });
});
