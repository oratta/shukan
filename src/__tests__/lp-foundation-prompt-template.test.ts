/**
 * lp-foundation: Codex section prompt template must be pre-filled with
 * Smitch brand values and enumerate the 12 NG visuals from plan.md.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const TEMPLATE = path.join(ROOT, 'docs/design/prompts/section-prompt-template.md');

describe('lp-foundation / Codex section prompt template', () => {
  it('exists', () => {
    expect(existsSync(TEMPLATE)).toBe(true);
  });

  it('contains Smitch brand fixed values', () => {
    const content = readFileSync(TEMPLATE, 'utf8');
    expect(content).toContain('Smitch');
    expect(content.toLowerCase()).toMatch(/science\s*[x×]\s*soul/);
    expect(content).toMatch(/Switch your path/i);
    expect(content.toLowerCase()).toMatch(/quiet/);
    expect(content.toLowerCase()).toMatch(/intentional/);
  });

  it('includes a Project Style Block section', () => {
    const content = readFileSync(TEMPLATE, 'utf8');
    expect(content).toMatch(/Project Style Block/);
  });

  it('enumerates at least 10 of the 12 NG visuals from plan.md as Hard Constraints', () => {
    const content = readFileSync(TEMPLATE, 'utf8').toLowerCase();
    const ngTokens = [
      'purple',
      'neon',
      'inter',
      'roboto',
      '3-column',
      'glass',
      'stock-photo',
      'flexing',
      'streak',
      'watermark',
      'symmetry',
      'eye-contact',
    ];
    const found = ngTokens.filter((t) => content.includes(t));
    expect(
      found.length,
      `only ${found.length}/12 NG tokens found: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(10);
  });

  it('mentions the variation rule (vary ONE dimension)', () => {
    const content = readFileSync(TEMPLATE, 'utf8');
    expect(content.toLowerCase()).toMatch(/vary\s+one|one\s+dimension/);
  });
});
