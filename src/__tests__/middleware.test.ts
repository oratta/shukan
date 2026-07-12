import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Supabase mock ---
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
  const req = new NextRequest(new URL(url), {
    headers,
  });
  if (options.cookies) {
    for (const [k, v] of Object.entries(options.cookies)) {
      req.cookies.set(k, v);
    }
  }
  return req;
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  getUserMock.mockReset();
  createServerClientMock.mockClear();
  // Default: no marketing hosts unless specified per test
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('middleware: marketing host routing', () => {
  describe('S1: www host returns marketing page at root', () => {
    it('rewrites to /marketing for www host and does not invoke Supabase', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com');

      const res = await middleware(req);

      expect(res).toBeDefined();
      // Internal rewrite header used by Next.js
      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toBeTruthy();
      expect(rewriteHeader).toContain('/marketing');
      expect(createServerClientMock).not.toHaveBeenCalled();
      expect(getUserMock).not.toHaveBeenCalled();
    });
  });

  describe('S2: dev escape hatch in non-production', () => {
    it('rewrites to /marketing when NODE_ENV != production and ?marketing=1', async () => {
      // vitest by default has NODE_ENV=test
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
      // No marketing hosts configured
      const req = makeRequest('http://localhost:3000/?marketing=1', 'localhost:3000');

      const res = await middleware(req);

      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toBeTruthy();
      expect(rewriteHeader).toContain('/marketing');
      expect(createServerClientMock).not.toHaveBeenCalled();
    });

    it('does NOT honor ?marketing=1 in production', async () => {
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
      getUserMock.mockResolvedValue({ data: { user: null } });
      const req = makeRequest('https://s-mitch.com/?marketing=1', 's-mitch.com');

      const res = await middleware(req);

      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      // should NOT rewrite to /marketing; should redirect to /login instead
      expect(rewriteHeader ?? '').not.toContain('/marketing');
      expect(createServerClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('S3: apex unauthenticated user gets redirected to login', () => {
    it('redirects unauthenticated apex user to /login', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      getUserMock.mockResolvedValue({ data: { user: null } });
      const req = makeRequest('https://s-mitch.com/', 's-mitch.com');

      const res = await middleware(req);

      // NextResponse.redirect sets a Location header & 307 status
      expect(res!.status).toBe(307);
      expect(res!.headers.get('location')).toContain('/login');
      expect(createServerClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('S4: apex authenticated user reaches home', () => {
    it('allows authenticated apex user to proceed', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      getUserMock.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'a@b.c' } },
      });
      const req = makeRequest('https://s-mitch.com/', 's-mitch.com');

      const res = await middleware(req);

      // not a redirect, not a rewrite to /login
      expect(res!.headers.get('location')).toBeFalsy();
      expect(res!.headers.get('x-middleware-rewrite') ?? '').not.toContain('/login');
      expect(createServerClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('S5: localhost without escape hatch behaves as apex', () => {
    it('redirects unauthenticated localhost user to /login when no ?marketing=1', async () => {
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
      // No marketing host match
      getUserMock.mockResolvedValue({ data: { user: null } });
      const req = makeRequest('http://localhost:3000/', 'localhost:3000');

      const res = await middleware(req);

      expect(res!.status).toBe(307);
      expect(res!.headers.get('location')).toContain('/login');
      expect(createServerClientMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('S6: apex direct /marketing rewritten to root', () => {
    it('rewrites /marketing to / on apex host (hidden), without calling Supabase', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      const req = makeRequest('https://s-mitch.com/marketing', 's-mitch.com');

      const res = await middleware(req);

      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toBeTruthy();
      // rewritten to apex root "/"
      const rewriteUrl = new URL(rewriteHeader!);
      expect(rewriteUrl.pathname).toBe('/');
      expect(createServerClientMock).not.toHaveBeenCalled();
    });
  });

  describe('S7: Supabase mock not called for www root', () => {
    it('createServerClient call count is 0 for marketing host', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com');

      await middleware(req);

      expect(createServerClientMock).toHaveBeenCalledTimes(0);
      expect(getUserMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('S9: marketing host matching is case-insensitive (#56)', () => {
    it('rewrites to /marketing when the request host has mixed case', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'www.s-mitch.com';
      // 大文字混じり host（プロキシ/ブラウザ由来）でも lowercase 正規化でマッチする
      const req = makeRequest('https://WWW.S-Mitch.com/', 'WWW.S-Mitch.com');

      const res = await middleware(req);

      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toBeTruthy();
      expect(rewriteHeader).toContain('/marketing');
      expect(createServerClientMock).not.toHaveBeenCalled();
    });

    it('matches even when the env value itself has mixed case', async () => {
      process.env.NEXT_PUBLIC_MARKETING_HOSTS = 'WWW.S-Mitch.com';
      const req = makeRequest('https://www.s-mitch.com/', 'www.s-mitch.com');

      const res = await middleware(req);

      const rewriteHeader = res!.headers.get('x-middleware-rewrite');
      expect(rewriteHeader).toBeTruthy();
      expect(rewriteHeader).toContain('/marketing');
      expect(createServerClientMock).not.toHaveBeenCalled();
    });
  });
});

describe('middleware: marketing page renders standalone layout (S8)', () => {
  it('marketing page module exports a default React component', async () => {
    const mod = await import('@/app/marketing/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('marketing layout module exports a default React component', async () => {
    const mod = await import('@/app/marketing/layout');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('marketing page renders LP sections and footer links', async () => {
    const { default: MarketingPage } = await import('@/app/marketing/page');
    // Server Component returns JSX synchronously; render to a tree object
    const tree = (MarketingPage as () => unknown)();

    // Collect text, hrefs, and component names by walking the React element tree
    const texts: string[] = [];
    const hrefs: string[] = [];
    const componentNames: string[] = [];
    const visit = (node: unknown): void => {
      if (node === null || node === undefined || node === false) return;
      if (typeof node === 'string' || typeof node === 'number') {
        texts.push(String(node));
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (typeof node === 'object') {
        const el = node as {
          type?: unknown;
          props?: { children?: unknown; href?: string };
        };
        if (typeof el.type === 'function' && el.type.name) {
          componentNames.push(el.type.name);
        }
        if (el.props?.href) hrefs.push(el.props.href);
        if (el.props?.children !== undefined) visit(el.props.children);
      }
    };
    visit(tree);

    const joinedText = texts.join(' ');
    expect(joinedText).toContain('Switch your path');
    // LP 刷新（PR #33 以降）で /login CTA は廃止され、CTA はウェイトリストフォームになった。
    // セクションコンポーネントの存在とフッター（Privacy / Terms / コピーライト）を検証する。
    expect(componentNames).toContain('Hero');
    expect(componentNames).toContain('CtaWaitlistForm');
    expect(hrefs).toContain('/privacy');
    expect(hrefs).toContain('/terms');
    expect(joinedText).toContain('Genetta');
  });
});
