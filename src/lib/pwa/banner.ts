import type { PwaPlatform } from './platform';

export const INSTALL_BANNER_SUPPRESS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface ShouldShowInstallBannerInput {
  platform: PwaPlatform;
  /** ISO 8601 string of the last dismissal, or null if never dismissed. */
  dismissedAt: string | null;
  now: Date;
  /** True only on the render immediately after a habit transitioned to completed. */
  justCompleted: boolean;
}

/**
 * Decide whether the install banner should be shown.
 *
 * true ⇔ justCompleted
 *      AND platform ∈ {'ios-safari', 'android-chrome'}
 *      AND (no valid dismissal OR more than 30 days since dismissal)
 *
 * The 30-day boundary itself counts as "within the suppression window" → false.
 * An unparseable dismissedAt is treated as "never dismissed".
 */
export function shouldShowInstallBanner(input: ShouldShowInstallBannerInput): boolean {
  const { platform, dismissedAt, now, justCompleted } = input;

  if (!justCompleted) return false;
  if (platform !== 'ios-safari' && platform !== 'android-chrome') return false;

  if (dismissedAt !== null) {
    const dismissedMs = Date.parse(dismissedAt);
    if (!Number.isNaN(dismissedMs)) {
      const elapsed = now.getTime() - dismissedMs;
      // Within 30 days (boundary inclusive) → suppress.
      if (elapsed <= INSTALL_BANNER_SUPPRESS_MS) return false;
    }
    // Unparseable dismissedAt falls through → treated as never dismissed.
  }

  return true;
}
