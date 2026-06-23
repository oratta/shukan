export const PWA_INSTALL_DISMISSED_AT_KEY = 'pwa-install-dismissed-at';

/**
 * Read the last dismissal timestamp (ISO 8601) from a Storage-compatible object.
 *
 * Storage access is wrapped in try/catch: private-browsing modes can throw on
 * access. On any failure we return null (→ banner side falls back to "show").
 */
export function readDismissedAt(storage: Pick<Storage, 'getItem'>): string | null {
  try {
    return storage.getItem(PWA_INSTALL_DISMISSED_AT_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist `now` as the dismissal timestamp (ISO 8601). Never throws.
 */
export function writeDismissedAt(storage: Pick<Storage, 'setItem'>, now: Date): void {
  try {
    storage.setItem(PWA_INSTALL_DISMISSED_AT_KEY, now.toISOString());
  } catch {
    // Storage unavailable (private mode / quota): silently ignore.
  }
}
