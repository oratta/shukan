import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';
import { getArticle, getArticleList } from '@/data/impact-articles';

// change-3: mood-axis-display
//
// 4軸目「前向きな気持ちの時間」(positive_mood) を UI 9箇所に4軸目として表示し、
// impact.* ラベル（ja/en）を正準名で追加する。記事データは kpi-data-foundation で
// 代表12本に値と算出根拠が入っている。0値記事は二重計上回避のため意図的に 0 のままとし、
// 理由コメントを記事ファイルに残す（受け入れ条件 #9）。

type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
const impactJa = (ja as unknown as { impact: Record<string, Json> }).impact;
const impactEn = (en as unknown as { impact: Record<string, Json> }).impact;
const kpiJa = (ja as unknown as { onboarding: { kpi: Record<string, { name: string }> } })
  .onboarding.kpi;
const kpiEn = (en as unknown as { onboarding: { kpi: Record<string, { name: string }> } })
  .onboarding.kpi;

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
function readSource(rel: string): string {
  return readFileSync(resolve(projectRoot, rel), 'utf-8');
}

// Scenario 3-1: 4軸目ラベルの正準統一
describe('impact.dailyPositiveMood ラベルの正準統一 (Scenario 3-1)', () => {
  it('ja impact.dailyPositiveMood は「前向きな気持ちの時間」（正準 onboarding.kpi.positive_mood.name と一致）', () => {
    expect(impactJa.dailyPositiveMood).toBe(kpiJa.positive_mood.name);
    expect(impactJa.dailyPositiveMood).toBe('前向きな気持ちの時間');
  });
  it('en impact.dailyPositiveMood は正準 onboarding.kpi.positive_mood.name と一致', () => {
    expect(impactEn.dailyPositiveMood).toBe(kpiEn.positive_mood.name);
  });
});

// Scenario 3-2: 対象9箇所での4軸目表示
describe('4軸目「前向きな気持ちの時間」が対象9箇所に表示される (Scenario 3-2)', () => {
  const components = [
    'src/components/habits/daily-impact-summary.tsx',
    'src/components/habits/impact-badge.tsx',
    'src/components/habits/savings-card.tsx',
    'src/app/(app)/stats/page.tsx',
    'src/app/(app)/discover/page.tsx',
    'src/components/habits/impact-article-sheet.tsx',
    'src/components/habits/evidence-article-sheet.tsx',
    'src/components/habits/evidence-picker.tsx',
    'src/components/habits/evidence-manager-sheet.tsx',
  ];
  for (const c of components) {
    it(`${c} が dailyPositiveMood ラベルで4軸目を描画する`, () => {
      const src = readSource(c);
      // `dailyPositiveMoodMinutes`（計算パラメータ）ではなく翻訳キー
      // `dailyPositiveMood`（ラベル）の参照を要求する。
      expect(src).toMatch(/dailyPositiveMood(?!Minutes)/);
    });
  }
});

// Scenario 3-3: 全38記事の精査（値>0 は根拠付き / 値0 は理由コメント付き）
describe('全38記事の dailyPositiveMoodMinutes が精査済み (Scenario 3-3)', () => {
  const articlesDir = resolve(projectRoot, 'src/data/impact-articles');
  const articleFiles = readdirSync(articlesDir).filter(
    (f) => f.endsWith('.ts') && f !== 'index.ts'
  );

  it('値 > 0 の記事は inferences.positiveMood と calculationLogic.positiveMood を持つ', () => {
    for (const { id } of getArticleList()) {
      const article = getArticle(id);
      if (!article) continue;
      if (article.calculationParams.dailyPositiveMoodMinutes > 0) {
        expect(typeof article.inferences.positiveMood).toBe('string');
        expect(Array.isArray(article.calculationLogic?.positiveMood)).toBe(true);
      }
    }
  });

  it('dailyPositiveMoodMinutes = 0 の全記事に 0 のままにした理由コメント（marker "positiveMood 0:"）がある', () => {
    const zeroFilesMissingComment: string[] = [];
    for (const file of articleFiles) {
      const src = readFileSync(resolve(articlesDir, file), 'utf-8');
      const isZero = /dailyPositiveMoodMinutes:\s*0\b/.test(src);
      if (!isZero) continue;
      if (!src.includes('positiveMood 0:')) {
        zeroFilesMissingComment.push(file);
      }
    }
    expect(zeroFilesMissingComment).toEqual([]);
  });
});
