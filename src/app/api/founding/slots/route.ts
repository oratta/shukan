import { NextResponse } from 'next/server';
import { getFoundingCounts } from '@/lib/supabase/founding-admin';

/**
 * GET /api/founding/slots (change-B, design D4).
 *
 * Public, unauthenticated endpoint. Returns ONLY aggregate per-tier counts —
 * `{ founder50: { cap, claimed, remaining }, founder30: { ... } }` — which is the
 * cross-change contract read by the teaser (change-C) and the 景表法 verification
 * (change-D). No personal data is exposed: the underlying `count_founding_slots`
 * RPC returns counts only.
 *
 * Placed OUTSIDE the middleware matcher (design D4, same policy as change-A's
 * webhook). Served with a 10-30s revalidation window so high-frequency teaser
 * reads hit the cache while still reflecting real DB counts (no fabricated
 * scarcity — ブランド / 景表法 requirement).
 */
export async function GET(): Promise<Response> {
  let counts;
  try {
    counts = await getFoundingCounts();
  } catch {
    // Never surface internal error detail to anonymous callers.
    return NextResponse.json({ error: 'Counter unavailable' }, { status: 503 });
  }

  return NextResponse.json(counts, {
    headers: {
      'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
    },
  });
}
