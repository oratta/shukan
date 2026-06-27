/**
 * lp-foundation: CLAUDE.md must document Smitch concept core (受動 -> 能動,
 * 手段と目的の逆転) and the LP image-to-code hard rules.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const CLAUDE_MD = path.join(ROOT, 'CLAUDE.md');

describe('lp-foundation / CLAUDE.md', () => {
  it('exists at repo root', () => {
    expect(existsSync(CLAUDE_MD)).toBe(true);
  });

  it('explains the passive -> active path switch concept core', () => {
    const content = readFileSync(CLAUDE_MD, 'utf8');
    expect(content).toMatch(/受動/);
    expect(content).toMatch(/能動/);
    expect(content).toMatch(/経路/);
  });

  it('mentions the means / end (手段 / 目的) inversion', () => {
    const content = readFileSync(CLAUDE_MD, 'utf8');
    expect(content).toMatch(/手段/);
    expect(content).toMatch(/目的/);
  });

  it('contains a Hard Rules section', () => {
    const content = readFileSync(CLAUDE_MD, 'utf8');
    expect(content).toMatch(/Hard Rules/i);
  });

  it('hard rules cover stack and a11y essentials', () => {
    const content = readFileSync(CLAUDE_MD, 'utf8');
    expect(content).toMatch(/shadcn/i);
    expect(content).toMatch(/Tailwind/i);
    expect(content).toMatch(/8\s*px/i);
    expect(content).toMatch(/WCAG/i);
    expect(content).toMatch(/prefers-reduced-motion/i);
  });

  it('bans the AI-slop hallmarks (purple gradient, Inter, glass orb, ...)', () => {
    const content = readFileSync(CLAUDE_MD, 'utf8').toLowerCase();
    const bans = ['purple', 'inter', 'glass', 'streak'];
    for (const b of bans) {
      expect(content, `CLAUDE.md should ban ${b}`).toContain(b);
    }
  });
});
