import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';

/**
 * S2 (grep part) + S15: No hardcoded slot numbers and no countdown component.
 * Requirement: Remaining slot display shows live counts from the founding counter API.
 *
 * The "remaining" figures MUST come exclusively from the API response. Static
 * program description (e.g. "first 50 members") is allowed in copy, so we only
 * forbid a *bare standalone* "remaining" integer literal in the founding source
 * tree, and forbid any countdown/timer component file.
 */

const FOUNDING_DIR = join(process.cwd(), 'src', 'app', 'founding');

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe('S15: No hardcoded slot numbers in source', () => {
  it('founding source tree contains no countdown/timer component file', () => {
    const files = listSourceFiles(FOUNDING_DIR);
    const offenders = files.filter((f) => /countdown|timer/i.test(f));
    expect(offenders).toEqual([]);
  });

  it('founding source has no "remaining" numeric literal hardcoded near a remaining label', () => {
    const files = listSourceFiles(FOUNDING_DIR);
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      // Forbid patterns like `remaining: 50` / `remaining = 200` / `remaining={37}`
      // (numeric literal directly assigned to a remaining identifier in source).
      const bad = /remaining\s*[:=]\s*\{?\s*\d+/i.test(src);
      expect(bad, `hardcoded remaining number found in ${f}`).toBe(false);
    }
  });
});

describe('S2: founding message namespace has no remaining-slot number literals', () => {
  it('no "残り" / "remaining" copy embeds a digit (numbers come from API only)', () => {
    for (const messages of [en, ja]) {
      const founding = JSON.stringify(
        (messages as Record<string, unknown>).founding
      );
      // Tier program description like "最初の50人" / "first 50 members" is allowed
      // as static program copy. What is forbidden is a literal *remaining* number,
      // i.e. a digit adjacent to a remaining/残り word in the copy.
      const remainingWithDigit =
        /残り[^"]*\d/.test(founding) || /\bremaining\b[^"]*\d/i.test(founding);
      expect(remainingWithDigit).toBe(false);
    }
  });
});
