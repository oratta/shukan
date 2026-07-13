import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Supabase mock (middleware imports it at module load) ---
const getUserMock = vi.fn();
const createServerClientMock = vi.fn(() => ({
  auth: {
    getUser: getUserMock,
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) =>
    (createServerClientMock as (...a: unknown[]) => unknown)(...args),
}));

// Import middleware AFTER mocks
import { middleware } from '@/middleware';

// --- Helpers ---

function makeRequest(
  url: string,
  host: string,
  options: { cookies?: Record<string, string> } = {}
): NextRequest {
  const headers = new Headers();
  headers.set('host', host);
  const req = new NextRequest(new URL(url), { headers });
  if (options.cookies) {
    for (const [k, v] of Object.entries(options.cookies)) {
      req.cookies.set(k, v);
    }
  }
  return req;
}

/**
 * Extracts the request cookie header that the middleware forwards to the
 * rendering layer. When middleware passes `{ request }` to NextResponse,
 * Next.js encodes the overridden request headers as
 * `x-middleware-request-<header>` response headers.
 */
function forwardedCookieHeader(res: Response): string | null {
  return res.headers.get('x-middleware-request-cookie');
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  getUserMock.mockReset();
  createServerClientMock.mockClear();
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('middleware: marketing host forces ja locale (#57)', () => {
  it('S1: marketing host root rewrite overrides the locale request cookie to ja', async () => {
    process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
    const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com');

    const res = await middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-rewrite')).toContain('/marketing');
    // The forwarded request cookie must carry locale=ja so that
    // src/i18n/request.ts resolves ja and RootLayout renders <html lang="ja">.
    expect(forwardedCookieHeader(res!)).toContain('locale=ja');
  });

  it('S2: marketing host overrides an existing en locale cookie to ja', async () => {
    process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
    const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com', {
      cookies: { locale: 'en' },
    });

    const res = await middleware(req);

    const forwarded = forwardedCookieHeader(res!);
    expect(forwarded).toContain('locale=ja');
    expect(forwarded).not.toContain('locale=en');
  });

  it('S3: marketing rewrite does not Set-Cookie on the browser response', async () => {
    process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
    const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com');

    const res = await middleware(req);

    // The override is per-request only; the browser's locale cookie must not
    // be persisted (app host behavior would otherwise be polluted).
    expect(res!.headers.get('set-cookie')).toBeNull();
  });

  it('S4: dev escape hatch (?marketing=1) also forces locale=ja', async () => {
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
    const req = makeRequest(
      'http://localhost:3000/?marketing=1',
      'localhost:3000'
    );

    const res = await middleware(req);

    expect(res!.headers.get('x-middleware-rewrite')).toContain('/marketing');
    expect(forwardedCookieHeader(res!)).toContain('locale=ja');
  });

  it('S5: app host keeps the next-intl locale cookie untouched', async () => {
    process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const req = makeRequest('https://s-mitch.com/', 's-mitch.com', {
      cookies: { locale: 'en' },
    });

    const res = await middleware(req);

    // App host goes through the Supabase branch; the locale cookie the
    // rendering layer sees must remain the user's own (en), never ja.
    const forwarded = forwardedCookieHeader(res!);
    if (forwarded !== null) {
      expect(forwarded).toContain('locale=en');
      expect(forwarded).not.toContain('locale=ja');
    }
    // And the incoming request cookie itself must not have been mutated.
    expect(req.cookies.get('locale')?.value).toBe('en');
  });

  it('S6: /marketing on a non-marketing host rewrites to / without forcing ja', async () => {
    process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
    const req = makeRequest('https://s-mitch.com/marketing', 's-mitch.com', {
      cookies: { locale: 'en' },
    });

    const res = await middleware(req);

    expect(res!.headers.get('x-middleware-rewrite')).toBeTruthy();
    const forwarded = forwardedCookieHeader(res!);
    if (forwarded !== null) {
      expect(forwarded).not.toContain('locale=ja');
    }
    expect(req.cookies.get('locale')?.value).toBe('en');
  });
});
