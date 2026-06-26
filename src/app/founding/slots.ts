/**
 * Remaining-slot HTTP fetcher for the public counter API (GET /api/founding/slots).
 *
 * Used ONLY by the client `/account` page, which runs in the browser where a
 * relative fetch resolves against the current origin (no env / absolute URL
 * needed). The `/founding` teaser (a Server Component) no longer goes through
 * this fetcher — it calls `getFoundingCounts()` directly server-side to avoid an
 * HTTP self-fetch and its env-URL dependency (Feedback / decisions D13; change-B
 * is now integrated into the same app, so the indirection is unnecessary).
 *
 * Cross-change contract (change-B spec S13):
 *   {
 *     founder50: { cap: number, claimed: number, remaining: number },
 *     founder30: { cap: number, claimed: number, remaining: number }
 *   }
 *
 * On any fetch / shape failure, returns `null` so the caller omits the numbers
 * instead of showing invented or stale values (change-C design D5).
 */

export type TierCount = {
  cap: number;
  claimed: number;
  remaining: number;
};

export type RemainingSlots = {
  founder50: TierCount;
  founder30: TierCount;
};

const COUNTER_PATH = '/api/founding/slots';

function isTierCount(value: unknown): value is TierCount {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.cap === 'number' &&
    typeof v.claimed === 'number' &&
    typeof v.remaining === 'number'
  );
}

function isRemainingSlots(value: unknown): value is RemainingSlots {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return isTierCount(v.founder50) && isTierCount(v.founder30);
}

export async function fetchRemainingSlots(): Promise<RemainingSlots | null> {
  try {
    // Relative path: this runs in the browser (client /account page), so it
    // resolves against the current origin without any env / absolute URL.
    const res = await fetch(COUNTER_PATH, {
      // Short cache window aligned with change-B's 10–30s revalidation contract.
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!isRemainingSlots(data)) return null;
    return data;
  } catch {
    // API unavailable (change-B not deployed) or network/parse failure:
    // fall back to no numbers. Never surface a fake count.
    return null;
  }
}
