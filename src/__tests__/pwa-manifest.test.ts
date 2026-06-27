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
