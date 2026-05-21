import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const marketingHosts =
    process.env.NEXT_PUBLIC_MARKETING_HOSTS?.split(',')
      .map((s) => s.trim())
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
    '/discover/:path*',
    '/stats/:path*',
    '/settings/:path*',
    '/marketing/:path*',
  ],
};
