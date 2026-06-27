/**
 * lp-foundation: scripts/check-design-md-sync.sh behavioral test.
 *
 * Uses spawnSync (no shell, array args) to invoke the script and assert exit
 * codes for happy path (sync ok) and broken path (token removed from DESIGN.md).
 */
import { spawnSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  cpSync,
  existsSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/check-design-md-sync.sh');
const DESIGN_MD = path.join(ROOT, 'docs/design/DESIGN.md');
const GLOBALS_CSS = path.join(ROOT, 'src/app/globals.css');

describe('lp-foundation / check-design-md-sync.sh', () => {
  it('script exists and is executable-shaped', () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const content = readFileSync(SCRIPT, 'utf8');
    expect(content.startsWith('#!'), 'script must start with shebang').toBe(
      true
    );
  });

  it('exits 0 when DESIGN.md is in sync with globals.css (default repo state)', () => {
    const res = spawnSync('bash', [SCRIPT], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(res.status, `stderr: ${res.stderr}\nstdout: ${res.stdout}`).toBe(0);
    expect(res.stdout + res.stderr).toMatch(/OK|in sync/i);
  });

  it('exits non-zero when DESIGN.md drops a known OKLCh token', () => {
    // Build a temp copy of the repo files the script needs, then point script at it.
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'lp-foundation-sync-'));
    cpSync(GLOBALS_CSS, path.join(tmp, 'globals.css'));

    const original = readFileSync(DESIGN_MD, 'utf8');
    // Remove all occurrences of --primary token to force a drift
    const broken = original.replace(/--primary\b/g, '--xxx-removed');
    writeFileSync(path.join(tmp, 'DESIGN.md'), broken);

    const res = spawnSync(
      'bash',
      [SCRIPT, '--css', path.join(tmp, 'globals.css'), '--design', path.join(tmp, 'DESIGN.md')],
      { cwd: ROOT, encoding: 'utf8' }
    );
    expect(res.status).not.toBe(0);
    expect((res.stdout + res.stderr).toLowerCase()).toMatch(/missing|drift|mismatch|primary/);
  });
});
