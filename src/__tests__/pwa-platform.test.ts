import { describe, it, expect } from 'vitest';
import { detectPlatform } from '@/lib/pwa/platform';

// Real-world UA strings (2024-2026 era)
const IOS_SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IOS_SAFARI_IPAD =
  'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IOS_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1';
const IOS_FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.113 Mobile Safari/537.36';
const ANDROID_SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';
const ANDROID_FIREFOX =
  'Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0';
const ANDROID_EDGE =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 EdgA/124.0.0.0';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const DESKTOP_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

describe('detectPlatform (S5)', () => {
  it('standalone wins regardless of UA', () => {
    expect(detectPlatform(IOS_SAFARI_IPHONE, true)).toBe('standalone');
    expect(detectPlatform(ANDROID_CHROME, true)).toBe('standalone');
    expect(detectPlatform(DESKTOP_CHROME, true)).toBe('standalone');
    expect(detectPlatform('', true)).toBe('standalone');
  });

  it('iOS Safari (iPhone/iPad) → ios-safari', () => {
    expect(detectPlatform(IOS_SAFARI_IPHONE, false)).toBe('ios-safari');
    expect(detectPlatform(IOS_SAFARI_IPAD, false)).toBe('ios-safari');
  });

  it('iOS non-Safari browsers (CriOS/FxiOS) → other (cannot add-to-home via share)', () => {
    expect(detectPlatform(IOS_CHROME, false)).toBe('other');
    expect(detectPlatform(IOS_FIREFOX, false)).toBe('other');
  });

  it('Android Chrome → android-chrome', () => {
    expect(detectPlatform(ANDROID_CHROME, false)).toBe('android-chrome');
  });

  it('Android non-Chrome (Samsung/Firefox/Edge) → other (conservative)', () => {
    expect(detectPlatform(ANDROID_SAMSUNG, false)).toBe('other');
    expect(detectPlatform(ANDROID_FIREFOX, false)).toBe('other');
    expect(detectPlatform(ANDROID_EDGE, false)).toBe('other');
  });

  it('Desktop browsers → other', () => {
    expect(detectPlatform(DESKTOP_CHROME, false)).toBe('other');
    expect(detectPlatform(DESKTOP_SAFARI, false)).toBe('other');
  });

  it('empty/unknown UA → other', () => {
    expect(detectPlatform('', false)).toBe('other');
    expect(detectPlatform('something-weird', false)).toBe('other');
  });
});
