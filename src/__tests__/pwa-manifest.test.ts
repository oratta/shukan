import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

const ROOT = path.resolve(__dirname, '../..');

describe('src/app/manifest.ts (S1/S2: installable-complete manifest)', () => {
  it('returns brand name and short_name', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    expect(m.name).toBe('Smitch - Switch your path');
    expect(m.short_name).toBe('Smitch');
  });

  it('returns installability-required fields (start_url + display:standalone)', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
  });

  it('includes 192px and 512px PNG icons (purpose unspecified)', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    const icons = m.icons ?? [];
    const sizes = icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    const png192 = icons.find((i) => i.sizes === '192x192');
    const png512 = icons.find((i) => i.sizes === '512x512');
    expect(png192?.type).toBe('image/png');
    expect(png512?.type).toBe('image/png');
    expect(png192?.src).toBe('/icon-192.png');
    expect(png512?.src).toBe('/icon-512.png');
    // purpose must remain unspecified (not maskable)
    expect(png192?.purpose).toBeUndefined();
    expect(png512?.purpose).toBeUndefined();
  });

  it('includes enhancement fields id / lang / dir / categories', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    expect(m.id).toBe('/');
    expect(m.lang).toBe('en');
    expect(m.dir).toBe('ltr');
    expect(m.categories).toEqual(['health', 'lifestyle', 'productivity']);
  });

  it('preserves brand theme/background colors unchanged', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    expect(m.theme_color).toBe('#2B4162');
    expect(m.background_color).toBe('#F8F9FA');
  });

  it('preserves description and orientation from the legacy manifest', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    expect(m.description).toBe(
      'Evidence-based life path builder. Choose the right habits backed by science.'
    );
    expect(m.orientation).toBe('portrait-primary');
  });
});

/** Reads the intrinsic pixel dimensions from a PNG's IHDR chunk. */
function readPngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  // PNG signature (8 bytes) + IHDR length/type (8 bytes) → width/height at 16..24
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('src/app/manifest.ts screenshots (#60: Richer Install UI)', () => {
  it('declares at least one wide screenshot and one mobile (non-wide) screenshot', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    const shots = m.screenshots ?? [];
    expect(shots.length).toBeGreaterThanOrEqual(2);

    // Chrome desktop Richer Install UI requires form_factor: 'wide'
    const wide = shots.filter((s) => s.form_factor === 'wide');
    expect(wide.length).toBeGreaterThanOrEqual(1);

    // Chrome mobile requires at least one screenshot whose form_factor is
    // unset or set to anything other than 'wide'
    const mobile = shots.filter((s) => s.form_factor !== 'wide');
    expect(mobile.length).toBeGreaterThanOrEqual(1);
  });

  it('every screenshot file exists in public/ and is a PNG', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    const shots = m.screenshots ?? [];
    for (const s of shots) {
      expect(s.src.startsWith('/')).toBe(true);
      expect(s.type).toBe('image/png');
      expect(existsSync(path.join(ROOT, 'public', s.src))).toBe(true);
    }
  });

  it('declared sizes match the actual pixel dimensions of each file', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    const shots = m.screenshots ?? [];
    for (const s of shots) {
      expect(s.sizes).toMatch(/^\d+x\d+$/);
      const [w, h] = s.sizes!.split('x').map(Number);
      const actual = readPngSize(path.join(ROOT, 'public', s.src));
      expect({ src: s.src, ...actual }).toEqual({
        src: s.src,
        width: w,
        height: h,
      });
    }
  });

  it('every screenshot satisfies Chrome ratio/size constraints and has a label', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const m = manifest() as MetadataRoute.Manifest;
    const shots = m.screenshots ?? [];
    for (const s of shots) {
      // label is what Chrome shows under the image in the install dialog
      expect(s.label).toBeTruthy();
      const [w, h] = s.sizes!.split('x').map(Number);
      // Chrome: 320px <= dimension <= 3840px, and max <= 2.3 * min
      expect(Math.min(w, h)).toBeGreaterThanOrEqual(320);
      expect(Math.max(w, h)).toBeLessThanOrEqual(3840);
      expect(Math.max(w, h) / Math.min(w, h)).toBeLessThanOrEqual(2.3);
      // wide screenshots must be landscape, mobile ones portrait
      if (s.form_factor === 'wide') expect(w).toBeGreaterThan(h);
      else expect(h).toBeGreaterThan(w);
    }
  });
});

describe('manifest reference consistency (S3/S4)', () => {
  it('layout.tsx references /manifest.webmanifest and not /manifest.json', () => {
    const layout = readFileSync(
      path.join(ROOT, 'src/app/layout.tsx'),
      'utf-8'
    );
    expect(layout).toContain('/manifest.webmanifest');
    expect(layout).not.toContain('/manifest.json');
  });

  it('old public/manifest.json no longer exists', () => {
    expect(existsSync(path.join(ROOT, 'public/manifest.json'))).toBe(false);
  });
});
