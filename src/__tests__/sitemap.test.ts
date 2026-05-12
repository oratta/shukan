import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const headersMock = vi.fn();
vi.mock('next/headers', () => ({
  headers: () => headersMock(),
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  headersMock.mockReset();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('src/app/sitemap.ts', () => {
  describe('S17: sitemap for www lists root URL', () => {
    it('returns sitemap with root URL when host is a marketing host', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      headersMock.mockResolvedValue(new Headers({ host: 'www.s-mitch.com' }));

      const { default: sitemap } = await import('@/app/sitemap');
      const result = await sitemap();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      const urls = result.map((entry) => entry.url);
      expect(urls).toContain('https://www.s-mitch.com/');
    });
  });

  describe('S18: sitemap for apex is empty', () => {
    it('returns empty array when host is apex', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      headersMock.mockResolvedValue(new Headers({ host: 's-mitch.com' }));

      const { default: sitemap } = await import('@/app/sitemap');
      const result = await sitemap();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('returns empty array when NEXT_PUBLIC_MARKETING_HOSTS is unset', async () => {
      delete process.env.NEXT_PUBLIC_MARKETING_HOSTS;
      headersMock.mockResolvedValue(new Headers({ host: 'www.s-mitch.com' }));

      const { default: sitemap } = await import('@/app/sitemap');
      const result = await sitemap();

      expect(result.length).toBe(0);
    });
  });
});
