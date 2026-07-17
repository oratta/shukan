import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ja from '@/messages/ja.json';
import en from '@/messages/en.json';

// issue #39: 推定値の表示画面に「目安・個人差・非保証」の近接注記を追加する（景表法対応）
//
// 消費者庁「打消し表示に関する実態調査報告書」の明瞭性・近接性要件に基づき、
// 推定値を表示する UI の同一ビューポート内に注記を表示する。
// 注記文言は messages（impact.estimateDisclaimer / impact.aiEstimateNote）経由で ja/en 両対応。

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
function readSource(rel: string): string {
  return readFileSync(resolve(projectRoot, rel), 'utf-8');
}

const impactJa = (ja as unknown as { impact: Record<string, string> }).impact;
const impactEn = (en as unknown as { impact: Record<string, string> }).impact;

describe('注記文言キー（ja/en）', () => {
  it('ja: impact.estimateDisclaimer は「集団平均に基づく試算・非保証・個人差」の3要素を含む', () => {
    expect(impactJa.estimateDisclaimer).toContain('集団平均');
    expect(impactJa.estimateDisclaimer).toContain('保証するものではありません');
    expect(impactJa.estimateDisclaimer).toContain('個人差');
  });

  it('en: impact.estimateDisclaimer は estimates / population averages / 非保証を含む', () => {
    expect(impactEn.estimateDisclaimer).toMatch(/estimate/i);
    expect(impactEn.estimateDisclaimer).toMatch(/population average/i);
    expect(impactEn.estimateDisclaimer).toMatch(/do not guarantee/i);
  });

  it('ja/en: impact.aiEstimateNote は AI による推定である旨を明示する', () => {
    expect(impactJa.aiEstimateNote).toContain('AI');
    expect(impactJa.aiEstimateNote).toContain('推定');
    expect(impactEn.aiEstimateNote).toMatch(/AI/);
    expect(impactEn.aiEstimateNote).toMatch(/estimate/i);
  });
});

describe('共通コンポーネント EstimateDisclaimer', () => {
  const src = readSource('src/components/habits/estimate-disclaimer.tsx');

  it('文言は messages キー（estimateDisclaimer / aiEstimateNote）経由で参照する', () => {
    expect(src).toContain("t('estimateDisclaimer')");
    expect(src).toContain("t('aiEstimateNote')");
  });

  it('注記は中立色で表示する（緑=ポジティブ専用色 text-success を使わない）', () => {
    expect(src).not.toContain('text-success');
    expect(src).toContain('text-muted-foreground');
  });
});

// 推定値を表示する各 UI が近接注記（EstimateDisclaimer）を描画する
describe('推定値表示 UI の近接注記（近接性要件）', () => {
  const components = [
    'src/components/habits/daily-impact-summary.tsx',
    'src/components/habits/impact-badge.tsx',
    'src/components/habits/evidence-article-sheet.tsx',
    'src/components/habits/impact-article-sheet.tsx',
    'src/components/habits/established-section.tsx',
    'src/components/habits/evidence-manager-sheet.tsx',
    'src/components/habits/evidence-picker.tsx',
    'src/components/onboarding/onboarding-wizard.tsx',
    'src/app/(app)/stats/page.tsx',
    'src/app/(app)/discover/page.tsx',
  ];
  for (const c of components) {
    it(`${c} が EstimateDisclaimer を描画する`, () => {
      expect(readSource(c)).toContain('EstimateDisclaimer');
    });
  }
});

// V3 の推論段落（LLM 生成）を本文表示する記事シートには AI 明示を併記する
describe('LLM 生成の推論段落への AI 明示（withAiNote）', () => {
  for (const c of [
    'src/components/habits/evidence-article-sheet.tsx',
    'src/components/habits/impact-article-sheet.tsx',
  ]) {
    it(`${c} は EstimateDisclaimer に withAiNote を渡す`, () => {
      expect(readSource(c)).toMatch(/EstimateDisclaimer\s+withAiNote/);
    });
  }
});

// 各推定値から算出根拠（calculationLogic / sources）への 1 タップ導線
describe('推定値 → 算出根拠への 1 タップ導線', () => {
  it('habit-card は ImpactBadge に onTap（onOpenArticle 経由）を配線する', () => {
    const src = readSource('src/components/habits/habit-card.tsx');
    expect(src).toContain('onOpenArticle');
    expect(src).toMatch(/onTap=/);
  });

  // 詳細ビューの KPI 表示はホーム（daily-impact-summary）と同じ非タップの 2×2 グリッドに
  // 揃えたため、算出根拠への 1 タップ導線はエビデンス一覧の各行（onOpenArticle）が担う。
  it('habit-detail-modal はエビデンス一覧から算出根拠へ 1 タップで開ける（onOpenArticle 配線）', () => {
    const src = readSource('src/components/habits/habit-detail-modal.tsx');
    expect(src).toContain('onOpenArticle');
    expect(src).toMatch(/onOpenArticle\?\.\(/);
  });

  // ホームのクライアント本体は issue #59 の server prefetch 化で
  // src/app/(app)/page.tsx（Server Component）→ dashboard-client.tsx へ分離された。
  it('home（dashboard-client.tsx）は HabitList に onOpenArticle を渡す', () => {
    const src = readSource('src/components/dashboard/dashboard-client.tsx');
    expect(src).toMatch(/onOpenArticle=\{?\(articleId\)/);
  });

  it('onboarding の HabitImpactBox は onTap でエビデンス記事シートを開ける', () => {
    const src = readSource('src/components/onboarding/onboarding-wizard.tsx');
    expect(src).toMatch(/HabitImpactBox[\s\S]{0,400}onTap=/);
    expect(src).toContain('setArticleSheetId(currentPreset.articleIds[0])');
  });
});

// 断定表現の総点検（受け入れ条件の grep をテスト化）
describe('断定表現ガード（優良誤認の回避）', () => {
  it('ja.json に断定表現（延びます・削減できます・増えます）が存在しない', () => {
    const raw = readSource('src/messages/ja.json');
    expect(raw).not.toMatch(/延びます|削減できます|増えます/);
  });
});
