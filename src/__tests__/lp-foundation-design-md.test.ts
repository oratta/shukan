/**
 * lp-foundation: DESIGN.md structure and sync with globals.css.
 *
 * Validates that docs/design/DESIGN.md (LP-specific design system, authoritative
 * source for Codex image generation) contains all required sections and that the
 * OKLCh tokens stay in sync with src/app/globals.css.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const DESIGN_MD = path.join(ROOT, 'docs/design/DESIGN.md');
const GLOBALS_CSS = path.join(ROOT, 'src/app/globals.css');

describe('lp-foundation / DESIGN.md structure', () => {
  it('docs/design/DESIGN.md exists', () => {
    expect(existsSync(DESIGN_MD)).toBe(true);
  });

  it('contains all required section headings', () => {
    const content = readFileSync(DESIGN_MD, 'utf8');
    const required = [
      '## Color Palette',
      '## Typography',
      '## Spacing & Rhythm',
      '## Motion Budget',
      '## Hard Rules',
      '## AI Generation Style Block',
    ];
    for (const heading of required) {
      expect(content, `missing heading: ${heading}`).toContain(heading);
    }
  });

  it('contains 8px rhythm reference', () => {
    const content = readFileSync(DESIGN_MD, 'utf8');
    expect(content).toMatch(/8\s*px/i);
  });

  it('includes both OKLCh notation and HEX notation for primary color', () => {
    const content = readFileSync(DESIGN_MD, 'utf8');
    expect(content).toMatch(/oklch\(/i);
    expect(content).toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it('mentions required color tokens from globals.css', () => {
    const content = readFileSync(DESIGN_MD, 'utf8');
    const tokens = [
      '--primary',
      '--background',
      '--foreground',
      '--ring',
      '--impact-health',
      '--impact-cost',
      '--impact-income',
    ];
    for (const token of tokens) {
      expect(content, `missing token: ${token}`).toContain(token);
    }
  });
});

describe('lp-foundation / DESIGN.md snapshot sync with globals.css', () => {
  it('every :root token mentioned in DESIGN.md uses the same OKLCh value as globals.css', () => {
    const css = readFileSync(GLOBALS_CSS, 'utf8');
    const designMd = readFileSync(DESIGN_MD, 'utf8');

    const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
    expect(rootMatch, ':root block must exist in globals.css').toBeTruthy();
    const rootBlock = rootMatch![1];

    const tokenRegex = /(--[a-z0-9-]+)\s*:\s*(oklch\([^)]+\))/gi;
    const cssTokens: Record<string, string> = {};
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(rootBlock)) !== null) {
      cssTokens[m[1]] = m[2].replace(/\s+/g, ' ').trim();
    }

    const designTokens = Object.keys(cssTokens).filter((t) =>
      designMd.includes(t)
    );
    expect(
      designTokens.length,
      'DESIGN.md must mention at least 5 globals.css tokens'
    ).toBeGreaterThanOrEqual(5);

    for (const token of designTokens) {
      const inner = cssTokens[token].replace(/^oklch\(|\)$/g, '').trim();
      const numbers = inner.split(/[\s/]+/).filter((s) => /^[0-9.]+%?$/.test(s));
      const designNormalized = designMd.replace(/\s+/g, ' ');
      for (const num of numbers) {
        expect(
          designNormalized,
          `token ${token} value ${cssTokens[token]} missing number ${num} in DESIGN.md`
        ).toContain(num);
      }
    }
  });
});
