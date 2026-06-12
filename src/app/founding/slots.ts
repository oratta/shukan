/**
 * Remaining-slot fetcher — the single isolation point for the change-B
 * (founding-member-program) public counter API dependency.
 *
 * Cross-change contract (change-B spec S13):
 *   {
 *     founder50: { cap: number, claimed: number, remaining: number },
 *     founder30: { cap: number, claimed: number, remaining: number }
 *   }
 *
 * While change-B is not yet deployed (no API), or on any fetch / shape failure,
 * this returns `null` so the teaser page omits the numbers instead of showing
 * invented or stale values (change-C design D5).
 *
 * The endpoint path is configurable via FOUNDING_COUNTER_API_URL and defaults to
 * the route change-B is expected to expose. When change-B lands, only this file
 * needs to change.
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

const DEFAULT_COUNTER_PATH = '/api/founding/slots';

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

function resolveCounterUrl(): string {
  const explicit = process.env.FOUNDING_COUNTER_API_URL;
  if (explicit) return explicit;
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? '';
  return `${base}${DEFAULT_COUNTER_PATH}`;
}

export async function fetchRemainingSlots(): Promise<RemainingSlots | null> {
  try {
    const res = await fetch(resolveCounterUrl(), {
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
