/**
 * lp-foundation: brand-references README must spell out the 16-image
 * role-labeling convention (palette / mood / composition / typography-layout /
 * anti-reference) and reference the existing smitch logo asset.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const README = path.join(ROOT, 'docs/design/brand-references/README.md');

describe('lp-foundation / brand-references README', () => {
  it('exists', () => {
    expect(existsSync(README)).toBe(true);
  });

  it('mentions all 5 reference roles', () => {
    const content = readFileSync(README, 'utf8').toLowerCase();
    const roles = ['palette', 'mood', 'composition', 'typography-layout', 'anti-reference'];
    for (const role of roles) {
      expect(content, `missing role: ${role}`).toContain(role);
    }
  });

  it('references the existing smitch logo asset', () => {
    const content = readFileSync(README, 'utf8');
    const refsLogoComponent = content.includes('smitch-logo');
    const refsLogoSvg = content.includes('/smitch-logo.svg');
    expect(
      refsLogoComponent || refsLogoSvg,
      'README must reference smitch-logo.tsx or /smitch-logo.svg'
    ).toBe(true);
  });

  it('mentions the 16 reference image cap', () => {
    const content = readFileSync(README, 'utf8');
    expect(content).toMatch(/\b16\b/);
  });
});
