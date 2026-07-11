import { describe, it, expect } from 'vitest';
import { validateEvidence, isWellFormedHttpUrl, collectSourceUrls } from '@/lib/evidence/validate';

// scripts/validate-evidence.ts と同じロジックをテストスイート内でもゲートする。
// これにより「エビデンス品質」が通常の npm test / CI でも守られる。

describe('validateEvidence — エビデンス品質ゲート', () => {
  const findings = validateEvidence();

  it('現行の全記事に error レベルの findings が無い', () => {
    const errors = findings.filter((f) => f.level === 'error');
    // 失敗時に原因が読めるよう、メッセージ付きで落とす。
    expect(errors, errors.map((e) => `[${e.code}] ${e.article ?? ''} ${e.message}`).join('\n')).toEqual([]);
  });

  it('findings は level/code/message を持つ構造化データである', () => {
    for (const f of findings) {
      expect(['error', 'warning']).toContain(f.level);
      expect(typeof f.code).toBe('string');
      expect(f.code.length).toBeGreaterThan(0);
      expect(typeof f.message).toBe('string');
    }
  });

  it('全記事が出典を1件以上持つ（no-sources エラーが無い）', () => {
    expect(findings.filter((f) => f.code === 'no-sources')).toEqual([]);
  });

  it('habitCategory がレジストリキーと一致する（category-mismatch エラーが無い）', () => {
    expect(findings.filter((f) => f.code === 'category-mismatch')).toEqual([]);
  });

  it('calculationLogic を持つ記事は params と最終ステップが整合する（logic-param-mismatch が無い）', () => {
    expect(findings.filter((f) => f.code === 'logic-param-mismatch')).toEqual([]);
  });
});

describe('isWellFormedHttpUrl', () => {
  it('http/https の正しい URL を受理する', () => {
    expect(isWellFormedHttpUrl('https://doi.org/10.1371/journal.pone.0161749')).toBe(true);
    expect(isWellFormedHttpUrl('http://example.com')).toBe(true);
  });

  it('不正な文字列・非http スキームを弾く', () => {
    expect(isWellFormedHttpUrl('not a url')).toBe(false);
    expect(isWellFormedHttpUrl('ftp://example.com')).toBe(false);
    expect(isWellFormedHttpUrl('')).toBe(false);
  });
});

describe('collectSourceUrls', () => {
  it('http形式の出典URLを記事横断で列挙する', () => {
    const urls = collectSourceUrls();
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) {
      expect(isWellFormedHttpUrl(u.url)).toBe(true);
      expect(typeof u.article).toBe('string');
      expect(typeof u.sourceId).toBe('number');
    }
  });
});
