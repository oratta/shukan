export type PwaPlatform = 'ios-safari' | 'android-chrome' | 'standalone' | 'other';

/**
 * Detect the PWA install platform from a user-agent string and standalone flag.
 *
 * Pure function: navigator / matchMedia are resolved by the caller and passed in,
 * so this is fully testable under Vitest's node environment.
 *
 * Priority:
 *   1. isStandalone === true                          → 'standalone'
 *   2. iPhone/iPad with Safari (not CriOS/FxiOS/etc.) → 'ios-safari'
 *   3. Android with Chrome (not Samsung/Edge/Firefox) → 'android-chrome'
 *   4. everything else                                → 'other' (conservative; no banner)
 */
export function detectPlatform(ua: string, isStandalone: boolean): PwaPlatform {
  if (isStandalone) return 'standalone';

  const isIos = /iPhone|iPad|iPod/.test(ua);
  if (isIos) {
    // Only real Safari supports the share-sheet "Add to Home Screen" flow.
    // In-app browsers report CriOS (Chrome), FxiOS (Firefox), EdgiOS (Edge), etc.
    const isIosSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
    return isIosSafari ? 'ios-safari' : 'other';
  }

  const isAndroid = /Android/.test(ua);
  if (isAndroid) {
    // Chrome is the only browser whose beforeinstallprompt flow we rely on.
    // Samsung Internet / Edge (EdgA) / Firefox are treated conservatively as 'other'.
    const isAndroidChrome =
      /Chrome\//.test(ua) && !/SamsungBrowser|EdgA|OPR|Firefox|FxiOS/.test(ua);
    return isAndroidChrome ? 'android-chrome' : 'other';
  }

  return 'other';
}
