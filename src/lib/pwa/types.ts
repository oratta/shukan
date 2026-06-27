/**
 * The Chromium-only `beforeinstallprompt` event. Not in the TS DOM lib by default.
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}
