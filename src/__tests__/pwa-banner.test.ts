import { describe, it, expect } from 'vitest';
import { shouldShowInstallBanner } from '@/lib/pwa/banner';
import type { PwaPlatform } from '@/lib/pwa/platform';

const NOW = new Date('2026-06-12T12:00:00.000Z');

function input(over: Partial<Parameters<typeof shouldShowInstallBanner>[0]> = {}) {
  return {
    platform: 'ios-safari' as PwaPlatform,
    dismissedAt: null,
    now: NOW,
    justCompleted: true,
    ...over,
  };
}

describe('shouldShowInstallBanner (S7/S9/S10/S11)', () => {
  it('justCompleted + ios-safari + no dismiss → true', () => {
    expect(shouldShowInstallBanner(input({ platform: 'ios-safari' }))).toBe(true);
  });

  it('justCompleted + android-chrome + no dismiss → true', () => {
    expect(shouldShowInstallBanner(input({ platform: 'android-chrome' }))).toBe(true);
  });

  it('standalone → always false', () => {
    expect(shouldShowInstallBanner(input({ platform: 'standalone' }))).toBe(false);
  });

  it('other → always false', () => {
    expect(shouldShowInstallBanner(input({ platform: 'other' }))).toBe(false);
  });

  it('justCompleted:false → always false (reload/revisit)', () => {
    expect(shouldShowInstallBanner(input({ justCompleted: false }))).toBe(false);
    expect(
      shouldShowInstallBanner(input({ justCompleted: false, platform: 'android-chrome' }))
    ).toBe(false);
  });

  describe('30-day dismiss suppression boundary', () => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    it('dismissed just now → false', () => {
      const dismissedAt = NOW.toISOString();
      expect(shouldShowInstallBanner(input({ dismissedAt }))).toBe(false);
    });

    it('dismissed 29 days ago → false', () => {
      const dismissedAt = new Date(NOW.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldShowInstallBanner(input({ dismissedAt }))).toBe(false);
    });

    it('dismissed exactly 30 days ago → false (boundary suppresses)', () => {
      const dismissedAt = new Date(NOW.getTime() - THIRTY_DAYS_MS).toISOString();
      expect(shouldShowInstallBanner(input({ dismissedAt }))).toBe(false);
    });

    it('dismissed 30 days + 1ms ago → true', () => {
      const dismissedAt = new Date(NOW.getTime() - THIRTY_DAYS_MS - 1).toISOString();
      expect(shouldShowInstallBanner(input({ dismissedAt }))).toBe(true);
    });

    it('dismissed 31 days ago → true', () => {
      const dismissedAt = new Date(NOW.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString();
      expect(shouldShowInstallBanner(input({ dismissedAt }))).toBe(true);
    });
  });

  it('invalid dismissedAt string → treated as null (show)', () => {
    expect(shouldShowInstallBanner(input({ dismissedAt: 'not-a-date' }))).toBe(true);
  });
});
