import { describe, it, expect } from 'vitest';
import { createTranslator } from 'next-intl';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import {
  buildAccountBillingMessages,
  type AccountTranslator,
} from '@/app/(app)/account/account-messages';

/**
 * Regression for the runtime FORMATTING_ERROR on /account (change-D, D12).
 *
 * The bug: AccountPage built its AccountBillingMessages by calling
 * `t(key)` for every checkout/account key, including keys whose messages
 * contain ICU placeholders (e.g. "{price} / year (billed annually)"). next-intl
 * throws FORMATTING_ERROR when a placeholder message is resolved with no values.
 *
 * The downstream view components (AccountBilling / FinalConfirmation) interpolate
 * those templates themselves from src/lib/billing/pricing.ts (the single source of
 * truth for tax-inclusive totals — display amount == charged amount). So the page
 * must hand them the RAW templates rather than fully-resolved (or crashing) strings.
 *
 * This walks the real messages files, enumerates every checkout/account key that
 * carries a `{var}` placeholder, and asserts that the production message-builder
 * resolves the FULL props map without throwing — i.e. no placeholder key is
 * resolved via plain `t(key)`.
 */

type Json = Record<string, unknown>;

const PLACEHOLDER = /\{[^}]+\}/;

function placeholderKeys(ns: Json): string[] {
  return Object.entries(ns)
    .filter(([, v]) => typeof v === 'string' && PLACEHOLDER.test(v as string))
    .map(([k]) => k);
}

describe('D12: /account intl messages with ICU placeholders resolve without FORMATTING_ERROR', () => {
  it('checkout and account namespaces actually contain placeholder keys (guard is meaningful)', () => {
    for (const messages of [en, ja]) {
      const m = messages as Json;
      expect(placeholderKeys(m.checkout as Json).length).toBeGreaterThan(0);
      expect(placeholderKeys(m.account as Json).length).toBeGreaterThan(0);
    }
  });

  it('builds the full AccountBillingMessages without throwing in both locales', () => {
    for (const locale of ['en', 'ja'] as const) {
      const messages = locale === 'en' ? en : ja;
      const tAccount = createTranslator({ locale, messages, namespace: 'account' });
      const tCheckout = createTranslator({ locale, messages, namespace: 'checkout' });

      expect(() =>
        buildAccountBillingMessages(
          tAccount as unknown as AccountTranslator,
          tCheckout as unknown as AccountTranslator,
        ),
      ).not.toThrow();
    }
  });

  it('every placeholder template survives into the props map as a raw `{var}` template', () => {
    for (const locale of ['en', 'ja'] as const) {
      const messages = locale === 'en' ? en : ja;
      const tAccount = createTranslator({ locale, messages, namespace: 'account' });
      const tCheckout = createTranslator({ locale, messages, namespace: 'checkout' });

      const built = buildAccountBillingMessages(
        tAccount as unknown as AccountTranslator,
        tCheckout as unknown as AccountTranslator,
      );

      const m = messages as Json;
      for (const key of placeholderKeys(m.account as Json)) {
        const value = (built.account as unknown as Record<string, string>)[key];
        if (value === undefined) continue; // key not surfaced by the page
        expect(value, `account.${key} (${locale})`).toMatch(PLACEHOLDER);
      }
      for (const key of placeholderKeys(m.checkout as Json)) {
        const value = (built.checkout as unknown as Record<string, string>)[key];
        if (value === undefined) continue;
        expect(value, `checkout.${key} (${locale})`).toMatch(PLACEHOLDER);
      }
    }
  });
});
