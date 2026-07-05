import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { EVIDENCE_HERO_IMAGES, getEvidenceHeroImage } from '@/data/evidence-hero-images';

// F15: ホームのデイリー習慣カード背景にエビデンス画像の等分割コラージュを敷く。
// 画像ソースは Discover と共有（evidence-hero-images.ts）。ソースリードで配線を固定する。

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
function readSource(rel: string): string {
  return readFileSync(resolve(projectRoot, rel), 'utf-8');
}

describe('共有エビデンス画像ソース（Discover と同一）', () => {
  it('既知の記事IDで画像URLを返す', () => {
    expect(getEvidenceHeroImage('daily_cardio')).toMatch(/^https:\/\/(images|plus)\.unsplash\.com/);
    expect(getEvidenceHeroImage('quit_smoking')).toMatch(/unsplash\.com/);
  });

  it('未登録の記事IDは undefined（呼び出し側でフォールバック）', () => {
    expect(getEvidenceHeroImage('nonexistent_article')).toBeUndefined();
  });

  it('Discover が同じ共有モジュールの画像を使う（同一ソース）', () => {
    const discover = readSource('src/app/(app)/discover/page.tsx');
    expect(discover).toContain('EVIDENCE_HERO_IMAGES');
    // 代表的な記事IDが共有マップに存在する
    expect(EVIDENCE_HERO_IMAGES['daily_walking']).toBeDefined();
  });
});

describe('F15: HabitCard がエビデンス画像コラージュ背景を配線している', () => {
  const src = readSource('src/components/habits/habit-card.tsx');

  it('evidences から共有画像を引き、最大4枚に打ち切る', () => {
    expect(src).toContain('getEvidenceHeroImage');
    expect(src).toContain('MAX_COLLAGE_IMAGES = 4');
    expect(src).toContain('slice(0, MAX_COLLAGE_IMAGES)');
  });

  it('画像を等分割（flex-1）で並べ、可読性グラデーションオーバーレイを重ねる', () => {
    expect(src).toContain('hasEvidenceBg');
    expect(src).toMatch(/flex-1[^"]*object-cover|object-cover[^"]*flex-1/);
    expect(src).toMatch(/bg-gradient-to-r[^"]*from-black/);
  });

  it('画像を持たない習慣は背景を出さず通常表示にフォールバックする', () => {
    // コラージュ背景は hasEvidenceBg が真のときだけ描画する
    expect(src).toContain('hasEvidenceBg && (');
  });
});
