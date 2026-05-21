import { describe, it, expect } from 'vitest';

describe('marketing layout metadata (S19: og + twitter)', () => {
  it('exports metadata with metadataBase pointing to marketing host', async () => {
    const mod = await import('@/app/marketing/layout');
    const md = mod.metadata as {
      metadataBase?: URL;
      openGraph?: Record<string, unknown>;
      twitter?: Record<string, unknown>;
      title?: string;
      description?: string;
    };
    expect(md).toBeDefined();
    expect(md.metadataBase).toBeInstanceOf(URL);
    expect(md.metadataBase?.host).toContain('s-mitch.com');
  });

  it('exports metadata with openGraph (title, description, images, type)', async () => {
    const mod = await import('@/app/marketing/layout');
    const md = mod.metadata as {
      openGraph?: {
        title?: string;
        description?: string;
        images?: unknown;
        type?: string;
        url?: string;
      };
    };
    expect(md.openGraph).toBeDefined();
    expect(typeof md.openGraph?.title).toBe('string');
    expect(typeof md.openGraph?.description).toBe('string');
    expect(md.openGraph?.type).toBe('website');
    // images can be string | array | object — accept any truthy
    expect(md.openGraph?.images).toBeTruthy();
    // image path/url should reference og-image
    const imagesStr = JSON.stringify(md.openGraph?.images);
    expect(imagesStr).toContain('og-image');
  });

  it('exports metadata with twitter card metadata', async () => {
    const mod = await import('@/app/marketing/layout');
    const md = mod.metadata as {
      twitter?: {
        card?: string;
        title?: string;
        description?: string;
        images?: unknown;
      };
    };
    expect(md.twitter).toBeDefined();
    expect(md.twitter?.card).toBe('summary_large_image');
    expect(typeof md.twitter?.title).toBe('string');
    expect(typeof md.twitter?.description).toBe('string');
    expect(md.twitter?.images).toBeTruthy();
    const imagesStr = JSON.stringify(md.twitter?.images);
    expect(imagesStr).toContain('og-image');
  });

  it('preserves existing title and description from change-B', async () => {
    const mod = await import('@/app/marketing/layout');
    const md = mod.metadata as { title?: string; description?: string };
    expect(md.title).toBe('Smitch — Switch your path.');
    expect(md.description).toContain('エビデンスベースのライフパスビルダー');
  });
});
