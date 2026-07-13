import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

/**
 * Dynamic robots.ts (Next.js 16 Metadata API).
 *
 * Strategy (D1/D2):
 * - When the request host is included in NEXT_PUBLIC_MARKETING_HOSTS
 *   (e.g. www.s-mitch.com), allow all crawlers and advertise the sitemap.
 * - Otherwise (apex, localhost, preview URLs not added to env), explicitly
 *   disallow everything to preserve the non-indexed posture of the (app)
 *   surface.
 *
 * NOTE: `headers()` is an async API in Next.js 16 (deprecated-as-sync since
 * v15.0, fully async in v16). Always `await` it.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get('host') ?? '').toLowerCase();
  const marketingHosts = (process.env.NEXT_PUBLIC_MARKETING_HOSTS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (marketingHosts.includes(host)) {
    return {
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://www.s-mitch.com/sitemap.xml',
    };
  }

  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
