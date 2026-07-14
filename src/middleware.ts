import { createServerClient } from '@supabase/ssr';
import { get } from '@vercel/edge-config';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rewrites the request to /marketing while forcing the ja locale (#57).
 * The LP is Japanese content, so the request's `locale` cookie is overridden
 * to `ja` for this request only — src/i18n/request.ts then resolves ja and
 * RootLayout renders `<html lang="ja">`. No Set-Cookie is emitted, so the
 * browser's own locale cookie (used on the app host) is left untouched.
 */
function rewriteToMarketing(request: NextRequest): NextResponse {
  request.cookies.set('locale', 'ja');
  return NextResponse.rewrite(new URL('/marketing', request.url), { request });
}

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
    return rewriteToMarketing(request);
  }

  // Branch 2: dev escape hatch (non-production only)
  if (
    process.env.NODE_ENV !== 'production' &&
    pathname === '/' &&
    request.nextUrl.searchParams.get('marketing') === '1'
  ) {
    return rewriteToMarketing(request);
  }

  // Branch 3: hide /marketing on non-marketing hosts (no Supabase)
  // Vercel Preview では LP 確認のため認証なしで素通しする
  const isVercelPreview = process.env.VERCEL_ENV === 'preview';
  if (!isMarketingHost && pathname === '/marketing') {
    if (isVercelPreview) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL('/', request.url));
  }

  // Default: existing Supabase auth flow
  //
  // 認証フロー全体を try/catch で防御する（#81）。Supabase が到達不能・env が
  // 空文字・ネットワーク断のいずれでも middleware が例外を投げると全ページが
  // 500 MIDDLEWARE_INVOCATION_FAILED になるため、失敗時は throw せず /login へ
  // フォールバックして白い 500 画面を避ける。env が空文字のケースも同様に扱う。
  const redirectToLogin = (): NextResponse => {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // env が空文字/未設定なら createServerClient が throw するので、先に検知して
  // フォールバックする（Vercel の Sensitive 型 env が vercel pull で空になる事故対策）
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[middleware] Supabase env が未設定のため /login へフォールバックします'
    );
    return redirectToLogin();
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirectToLogin();
    }

    return supabaseResponse;
  } catch (error) {
    // Supabase 到達不能・getUser() reject 等はログを残しつつ /login へ倒す
    console.error('[middleware] Supabase 認証フローで例外が発生しました', error);
    return redirectToLogin();
  }
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
