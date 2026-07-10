import { createServerClient } from '@supabase/ssr';
import { get } from '@vercel/edge-config';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Maintenance mode: Edge Config の maintenance フラグが ON なら全ページを
  // メンテページへ rewrite（EDGE_CONFIG 未設定環境や到達不能時は素通し）
  if (process.env.EDGE_CONFIG) {
    try {
      const maintenance = await get<boolean>('maintenance');
      if (maintenance) {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
      }
    } catch {
      // Edge Config 到達不能時はメンテ扱いにしない
    }
  }

  // host はブラウザ/プロキシによって大文字混じりになりうるため lowercase 正規化して比較する
  const host = (request.headers.get('host') ?? '').toLowerCase();
  const marketingHosts =
    process.env.NEXT_PUBLIC_MARKETING_HOSTS?.split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];

  const pathname = request.nextUrl.pathname;
  const isMarketingHost = marketingHosts.includes(host);

  // Branch 1: marketing host + root → internal rewrite to /marketing (no Supabase)
  if (isMarketingHost && pathname === '/') {
    return NextResponse.rewrite(new URL('/marketing', request.url));
  }

  // Branch 2: dev escape hatch (non-production only)
  if (
    process.env.NODE_ENV !== 'production' &&
    pathname === '/' &&
    request.nextUrl.searchParams.get('marketing') === '1'
  ) {
    return NextResponse.rewrite(new URL('/marketing', request.url));
  }

  // Branch 3: hide /marketing on non-marketing hosts (no Supabase)
  if (!isMarketingHost && pathname === '/marketing') {
    return NextResponse.rewrite(new URL('/', request.url));
  }

  // Default: existing Supabase auth flow
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/',
    '/account/:path*',
    '/discover/:path*',
    '/stats/:path*',
    '/settings/:path*',
    '/marketing/:path*',
  ],
};
