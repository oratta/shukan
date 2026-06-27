/**
 * lp-foundation: scripts/codex-image-gen.sh wrapper behavioral test.
 *
 * Only validates --help (exit 0) and missing-args (non-zero). Actual image
 * generation requires Codex CLI and is out of scope for this change.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/codex-image-gen.sh');

describe('lp-foundation / codex-image-gen.sh wrapper', () => {
  it('script exists with shebang', () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const content = readFileSync(SCRIPT, 'utf8');
    expect(content.startsWith('#!')).toBe(true);
  });

  it('--help exits 0 and prints usage covering required flags', () => {
    const res = spawnSync('bash', [SCRIPT, '--help'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(res.status, `stderr: ${res.stderr}`).toBe(0);
    const out = res.stdout + res.stderr;
    expect(out).toMatch(/--refs/);
    expect(out).toMatch(/--prompt-file/);
    expect(out).toMatch(/--n/);
    expect(out).toMatch(/--size/);
  });

  it('exits non-zero when invoked with no args (missing required --prompt-file)', () => {
    const res = spawnSync('bash', [SCRIPT], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(res.status).not.toBe(0);
    expect((res.stdout + res.stderr).toLowerCase()).toMatch(
      /prompt-file|required|missing/
    );
  });
});
