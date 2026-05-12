import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

/**
 * Dynamic sitemap.ts (Next.js 16 Metadata API).
 *
 * Returns the marketing root URL when the request host is a marketing host
 * (NEXT_PUBLIC_MARKETING_HOSTS). For apex / localhost / preview, returns an
 * empty sitemap so crawlers do not discover non-marketing surfaces.
 *
 * `headers()` is async in Next.js 16 — `await` it.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get('host') ?? '';
  const marketingHosts = (process.env.NEXT_PUBLIC_MARKETING_HOSTS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!marketingHosts.includes(host)) {
    return [];
  }

  return [
    {
      url: 'https://www.s-mitch.com/',
      lastModified: new Date(),
    },
  ];
}
