import { describe, it, expect } from 'vitest';
import {
  PWA_INSTALL_DISMISSED_AT_KEY,
  readDismissedAt,
  writeDismissedAt,
} from '@/lib/pwa/dismissal';

// Minimal in-memory Storage-compatible object (no DOM needed)
function memoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    _store: store,
  };
}

describe('dismissal read/write (S10)', () => {
  it('exposes the canonical localStorage key', () => {
    expect(PWA_INSTALL_DISMISSED_AT_KEY).toBe('pwa-install-dismissed-at');
  });

  it('readDismissedAt returns null when unset', () => {
    const s = memoryStorage();
    expect(readDismissedAt(s)).toBeNull();
  });

  it('readDismissedAt returns the stored ISO string', () => {
    const iso = '2026-06-12T12:00:00.000Z';
    const s = memoryStorage({ [PWA_INSTALL_DISMISSED_AT_KEY]: iso });
    expect(readDismissedAt(s)).toBe(iso);
  });

  it('writeDismissedAt persists current time as ISO 8601', () => {
    const s = memoryStorage();
    const now = new Date('2026-06-12T12:00:00.000Z');
    writeDismissedAt(s, now);
    expect(s._store.get(PWA_INSTALL_DISMISSED_AT_KEY)).toBe('2026-06-12T12:00:00.000Z');
  });

  it('round-trips: write then read', () => {
    const s = memoryStorage();
    const now = new Date('2026-06-12T12:00:00.000Z');
    writeDismissedAt(s, now);
    expect(readDismissedAt(s)).toBe('2026-06-12T12:00:00.000Z');
  });

  it('readDismissedAt does not throw when storage.getItem throws (private mode)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(readDismissedAt(throwing)).toBeNull();
  });

  it('writeDismissedAt does not throw when storage.setItem throws (private mode)', () => {
    const throwing = {
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    expect(() => writeDismissedAt(throwing, new Date())).not.toThrow();
  });
});
