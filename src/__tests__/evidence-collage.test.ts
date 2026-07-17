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

  it('メイン写真を全面に敷き、テーマ別の可読性レイヤー（dark=スクリム/light=ベール）を重ねる', () => {
    expect(src).toContain('hasEvidenceBg');
    expect(src).toContain('object-cover');
    expect(src).toContain('banner-scrim');
    expect(src).toContain('banner-veil');
  });

  it('画像を持たない習慣は背景を出さず通常表示にフォールバックする', () => {
    // コラージュ背景は hasEvidenceBg が真のときだけ描画する
    expect(src).toContain('hasEvidenceBg && (');
  });
});

// F17: 展開時も背景維持・緑枠廃止・写真前提のUI調整
describe('F17: 展開時もコラージュ背景を維持し、緑枠を廃して写真前提に調整', () => {
  const card = readSource('src/components/habits/habit-card.tsx');
  const badge = readSource('src/components/habits/impact-badge.tsx');
  const savings = readSource('src/components/habits/savings-card.tsx');

  it('コラージュ背景を collapsed 行内ではなく Card 全体の直下に敷く（展開時も維持）', () => {
    // 背景画像（object-cover）が Collapsed row コメントより前＝カード直下にある
    const bgIdx = card.indexOf('object-cover');
    const rowIdx = card.indexOf('Collapsed row');
    expect(bgIdx).toBeGreaterThan(0);
    expect(rowIdx).toBeGreaterThan(0);
    expect(bgIdx).toBeLessThan(rowIdx);
  });

  it('緑の枠（Card border）を外す（border-0）', () => {
    expect(card).toContain('border-0');
  });

  it('展開ボディを背景の上に載せる（relative z-10）', () => {
    expect(card).toMatch(/relative z-10 grid/);
  });

  it('写真カードでは ImpactBadge / SavingsCard を bare で内包する（F18）', () => {
    expect(card).toContain('surface="bare"');
  });

  it('ImpactBadge / SavingsCard は写真上で緑ボーダーを白ガラス/白文字に切替える', () => {
    expect(badge).toContain('border-white/20');
    expect(savings).toContain('border-white/20');
  });
});

// F18/F19/F20: 展開ビューの1ボックス統合と「緑＝ポジティブ専用」の色整理
describe('F18/F19/F20: 展開ビューの箱統合と色の意味整理', () => {
  const card = readSource('src/components/habits/habit-card.tsx');
  const badge = readSource('src/components/habits/impact-badge.tsx');
  const savings = readSource('src/components/habits/savings-card.tsx');

  it('F18: KPI影響・継続・累積を単一のガラスボックスに内包（薄ディバイダ・bare子）', () => {
    expect(card).toMatch(/rounded-xl bg-background\/70 p-3 backdrop-blur-md dark:bg-white\/10/);
    expect(card).toContain('h-px bg-border/70 dark:bg-white/15');
    expect(card).toContain('surface="bare"');
  });

  it('F18: bare variant は自前の箱（border/緑地）を持たない', () => {
    expect(badge).toContain("bare = props.surface === 'bare'");
    expect(savings).toContain("bare = surface === 'bare'");
  });

  it('F20: 詳細ボタンは緑（bg-success）をやめ中立色にする', () => {
    const idx = card.indexOf('onOpenDetail(habit.id)');
    const around = card.slice(idx, idx + 500);
    expect(around).not.toContain('bg-success');
    expect(around).toMatch(/bg-white\/90|bg-secondary/);
  });

  it('F19: スキップボタンは中立アクセント＋ring で押せる（緑は使わない）', () => {
    const idx = card.indexOf('onSkipToday(habit.id)');
    const around = card.slice(idx, idx + 600);
    expect(around).toContain('ring-1');
    expect(around).not.toContain('bg-success');
    expect(around).toMatch(/bg-primary\/10|bg-white\/15/);
  });
});
