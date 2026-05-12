import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/headers BEFORE importing robots
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

describe('src/app/robots.ts', () => {
  describe('S15: robots for www host allows all', () => {
    it('returns allow rule + sitemap when host matches NEXT_PUBLIC_MARKETING_HOSTS', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      headersMock.mockResolvedValue(new Headers({ host: 'www.s-mitch.com' }));

      const { default: robots } = await import('@/app/robots');
      const result = await robots();

      expect(result).toEqual({
        rules: [{ userAgent: '*', allow: '/' }],
        sitemap: 'https://www.s-mitch.com/sitemap.xml',
      });
    });
  });

  describe('S16: robots for apex disallows everything', () => {
    it('returns disallow rule when host is not in NEXT_PUBLIC_MARKETING_HOSTS', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      headersMock.mockResolvedValue(new Headers({ host: 's-mitch.com' }));

      const { default: robots } = await import('@/app/robots');
      const result = await robots();

      expect(result).toEqual({
        rules: [{ userAgent: '*', disallow: '/' }],
      });
    });

    it('returns disallow rule when NEXT_PUBLIC_MARKETING_HOSTS is unset', async () => {
      delete process.env.NEXT_PUBLIC_MARKETING_HOSTS;
      headersMock.mockResolvedValue(new Headers({ host: 'www.s-mitch.com' }));

      const { default: robots } = await import('@/app/robots');
      const result = await robots();

      expect(result).toEqual({
        rules: [{ userAgent: '*', disallow: '/' }],
      });
    });
  });
});
