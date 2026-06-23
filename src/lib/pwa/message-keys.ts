/**
 * Canonical list of i18n message keys used by the PWA install UI.
 *
 * Single source of truth shared by components and the key-existence test.
 * All keys live under the new top-level `pwa` namespace (additive only —
 * no existing key is changed/moved/deleted).
 */
export const PWA_MESSAGE_KEYS = [
  // Shared / banner
  'pwa.banner.title',
  'pwa.dismiss',
  // iOS install instructions (2-step illustrated)
  'pwa.ios.intro',
  'pwa.ios.step1',
  'pwa.ios.step2',
  // Android install button
  'pwa.android.intro',
  'pwa.android.button',
  // Settings help entry + dialog
  'pwa.help.title',
  'pwa.help.dialogTitle',
  'pwa.help.installed',
  'pwa.help.unsupported',
] as const;

export type PwaMessageKey = (typeof PWA_MESSAGE_KEYS)[number];
