// issue #34: エビデンス重複加算の防止（同一エビデンスを複数習慣がまたぐ問題）
//
// 方式: 「同一 articleId は1回だけ計上、最大ウェイト（達成率）採用」の単純 de-dup。
//   - ホーム集計（src/lib/impact.ts の calculateDedupedDailyImpact）
//   - オンボーディング集計（src/lib/diagnosis-v3.ts の computeDiagnosisV3。
//     選択→記事展開は src/lib/onboarding.ts のプリセット定義に基づく）
// の両方で効くことを検証する。

import { describe, it, expect, vi } from 'vitest';
import {
  calculateDailyImpact,
  calculateDedupedDailyImpact,
  dedupeEvidences,
  dedupeByArticleId,
} from '@/lib/impact';
import { computeDiagnosisV3 } from '@/lib/diagnosis-v3';
import type { HabitEvidence, LifeImpactArticle } from '@/types/impact';
import { KPI_KEYS } from '@/data/kpi/catalog';

// 現行のプリセット15本は articleId を共有しないため、オンボーディング側の de-dup は
// 「同一記事を参照する（内包関係にある）プリセット」を部分モックで注入して検証する。
// 実記事（daily_cardio / daily_walking）はそのまま使う。
vi.mock('@/data/habit-presets', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/habit-presets')>();
  const TEST_PRESETS: Record<string, import('@/data/habit-presets').HabitPreset> = {
    test_cardio_only: {
      id: 'test_cardio_only',
      name: '毎日少し運動する（cardio のみ）',
      defaultHabitType: 'positive',
      icon: 'person-standing',
      articleIds: ['daily_cardio'],
      primaryKpis: ['health_lifespan'],
    },
    test_walking_only: {
      id: 'test_walking_only',
      name: '毎日1万歩歩く（walking のみ）',
      defaultHabitType: 'positive',
      icon: 'footprints',
      articleIds: ['daily_walking'],
      primaryKpis: ['health_lifespan'],
    },
    test_cardio_walking_bundle: {
      id: 'test_cardio_walking_bundle',
      name: '有酸素運動（cardio + walking 束ね）',
      defaultHabitType: 'positive',
      icon: 'person-standing',
      articleIds: ['daily_cardio', 'daily_walking'],
      primaryKpis: ['health_lifespan'],
    },
  };
  return {
    ...mod,
    getHabitPreset: (id: string) => TEST_PRESETS[id] ?? mod.getHabitPreset(id),
  };
});

// --- ホーム集計用フィクスチャ（impact.test.ts と同スタイルのモック記事） ---

const mockArticleQuitSmoking: LifeImpactArticle = {
  habitCategory: 'quit_smoking',
  habitName: '禁煙',
  article: { researchBody: 'x', sources: [] },
  inferences: { health: 'h', cost: 'c', income: 'i', cumulative: 'm' },
  calculationParams: {
    dailyHealthMinutes: 30,
    dailyCostSaving: 550,
    dailyIncomeGain: 200,
    dailyPositiveMoodMinutes: 0,
  },
  confidenceLevel: 'high',
  defaultHabitType: 'quit',
  defaultIcon: 'cigarette-off',
};

const mockArticleDailyCardio: LifeImpactArticle = {
  habitCategory: 'daily_cardio',
  habitName: '毎日有酸素運動',
  article: { researchBody: 'x', sources: [] },
  inferences: { health: 'h', cost: 'c', income: 'i', cumulative: 'm' },
  calculationParams: {
    dailyHealthMinutes: 45,
    dailyCostSaving: 300,
    dailyIncomeGain: 500,
    dailyPositiveMoodMinutes: 60,
  },
  confidenceLevel: 'high',
  defaultHabitType: 'positive',
  defaultIcon: 'person-standing',
};

function mockGetArticle(id: string): LifeImpactArticle | undefined {
  const articles: Record<string, LifeImpactArticle> = {
    quit_smoking: mockArticleQuitSmoking,
    daily_cardio: mockArticleDailyCardio,
  };
  return articles[id];
}

function makeEvidence(habitId: string, articleId: string, weight: number): HabitEvidence {
  return {
    id: `ev-${habitId}-${articleId}`,
    habitId,
    articleId: articleId as HabitEvidence['articleId'],
    weight,
  };
}

// --- ホーム集計（src/lib/impact.ts）の de-dup ---

describe('dedupeByArticleId / dedupeEvidences（de-dup ヘルパー）', () => {
  it('同一 articleId は1件に畳まれ、最大ウェイトの項目が採用される', () => {
    const evidences = [
      makeEvidence('habit-a', 'daily_cardio', 60),
      makeEvidence('habit-b', 'daily_cardio', 100),
      makeEvidence('habit-c', 'quit_smoking', 100),
    ];
    const deduped = dedupeEvidences(evidences);
    expect(deduped).toHaveLength(2);
    const cardio = deduped.find((e) => e.articleId === 'daily_cardio');
    expect(cardio?.weight).toBe(100);
    expect(cardio?.habitId).toBe('habit-b');
  });

  it('初出順を保つ（先に現れた articleId が先頭）', () => {
    const deduped = dedupeEvidences([
      makeEvidence('habit-a', 'quit_smoking', 50),
      makeEvidence('habit-b', 'daily_cardio', 100),
      makeEvidence('habit-c', 'quit_smoking', 100),
    ]);
    expect(deduped.map((e) => e.articleId)).toEqual(['quit_smoking', 'daily_cardio']);
  });

  it('getStrength で任意の強度基準を使える（達成率など）', () => {
    const deduped = dedupeByArticleId(
      [
        { articleId: 'daily_cardio' as HabitEvidence['articleId'], rate: 0.3 },
        { articleId: 'daily_cardio' as HabitEvidence['articleId'], rate: 0.7 },
      ],
      (a) => a.rate
    );
    expect(deduped).toHaveLength(1);
    expect(deduped[0].rate).toBe(0.7);
  });
});

describe('ホーム集計: calculateDedupedDailyImpact（issue #34 受け入れ条件1）', () => {
  it('同一 articleId を参照する2習慣は1回のみ計上される（de-dup 前の合算値より小さい）', () => {
    const habitA = [makeEvidence('habit-a', 'daily_cardio', 100)];
    const habitB = [makeEvidence('habit-b', 'daily_cardio', 100)];

    const deduped = calculateDedupedDailyImpact([habitA, habitB], mockGetArticle);
    const naiveSum = calculateDailyImpact([...habitA, ...habitB], mockGetArticle);
    const single = calculateDailyImpact(habitA, mockGetArticle);

    // 1回のみ計上 = 習慣1つ分と同じ値
    expect(deduped).toEqual(single);
    // de-dup 前の単純合算（2倍計上）より小さい
    expect(deduped.healthMinutes).toBeLessThan(naiveSum.healthMinutes);
    expect(deduped.costSaving).toBeLessThan(naiveSum.costSaving);
    expect(deduped.incomeGain).toBeLessThan(naiveSum.incomeGain);
    expect(deduped.positiveMoodMinutes).toBeLessThan(naiveSum.positiveMoodMinutes);
  });

  it('ウェイトが異なる場合は最大ウェイトを採用する', () => {
    const habitA = [makeEvidence('habit-a', 'daily_cardio', 60)];
    const habitB = [makeEvidence('habit-b', 'daily_cardio', 100)];

    const deduped = calculateDedupedDailyImpact([habitA, habitB], mockGetArticle);
    expect(deduped).toEqual(calculateDailyImpact(habitB, mockGetArticle));
  });

  it('異なる articleId を参照する習慣同士は従来どおり合算される（デグレなし・受け入れ条件3）', () => {
    const habitA = [makeEvidence('habit-a', 'quit_smoking', 100)];
    const habitB = [makeEvidence('habit-b', 'daily_cardio', 100)];

    const deduped = calculateDedupedDailyImpact([habitA, habitB], mockGetArticle);
    const naiveSum = calculateDailyImpact([...habitA, ...habitB], mockGetArticle);

    expect(deduped).toEqual(naiveSum);
    // 具体値: 30+45=75分, 550+300=850円, 200+500=700円, 0+60=60分
    expect(deduped.healthMinutes).toBe(75);
    expect(deduped.costSaving).toBe(850);
    expect(deduped.incomeGain).toBe(700);
    expect(deduped.positiveMoodMinutes).toBe(60);
  });

  it('空グループ・evidences なしでもゼロを返す', () => {
    const deduped = calculateDedupedDailyImpact([], mockGetArticle);
    expect(deduped).toEqual({
      healthMinutes: 0,
      costSaving: 0,
      incomeGain: 0,
      positiveMoodMinutes: 0,
    });
  });
});

// --- オンボーディング集計（src/lib/diagnosis-v3.ts / src/lib/onboarding.ts）の de-dup ---

describe('オンボーディング集計: computeDiagnosisV3（issue #34 受け入れ条件2）', () => {
  it('同一 articleId（daily_cardio）を参照する2習慣は1回のみ計上される', () => {
    // cardio ⊃ walking の内包ケース: cardio 単体習慣 + cardio/walking 束ね習慣
    const both = computeDiagnosisV3({
      selections: [
        { presetId: 'test_cardio_only', rate: 1 },
        { presetId: 'test_cardio_walking_bundle', rate: 1 },
      ],
      profile: null,
    });
    const bundleAlone = computeDiagnosisV3({
      selections: [{ presetId: 'test_cardio_walking_bundle', rate: 1 }],
      profile: null,
    });
    const cardioAlone = computeDiagnosisV3({
      selections: [{ presetId: 'test_cardio_only', rate: 1 }],
      profile: null,
    });

    for (const kpi of KPI_KEYS) {
      // de-dup 後 = 束ね習慣1つ分（cardio は1回だけ）
      expect(both.byKpi[kpi].raw).toBeCloseTo(bundleAlone.byKpi[kpi].raw, 6);
      // de-dup 前の単純合算（cardio 2回計上）より小さい（cardio が効く KPI のみ）
      const naiveSum = cardioAlone.byKpi[kpi].raw + bundleAlone.byKpi[kpi].raw;
      if (cardioAlone.byKpi[kpi].raw > 0) {
        expect(both.byKpi[kpi].raw).toBeLessThan(naiveSum);
      }
    }
  });

  it('達成率が異なる場合は最大の達成率を採用する', () => {
    // cardio: rate 1（単体習慣）と rate 0.3（束ね習慣経由）→ 1 を採用
    // walking: rate 0.3（束ね習慣のみ）→ 0.3
    const both = computeDiagnosisV3({
      selections: [
        { presetId: 'test_cardio_only', rate: 1 },
        { presetId: 'test_cardio_walking_bundle', rate: 0.3 },
      ],
      profile: null,
    });
    const cardioFull = computeDiagnosisV3({
      selections: [{ presetId: 'test_cardio_only', rate: 1 }],
      profile: null,
    });
    const walkingPartial = computeDiagnosisV3({
      selections: [{ presetId: 'test_walking_only', rate: 0.3 }],
      profile: null,
    });

    for (const kpi of KPI_KEYS) {
      expect(both.byKpi[kpi].raw).toBeCloseTo(
        cardioFull.byKpi[kpi].raw + walkingPartial.byKpi[kpi].raw,
        6
      );
    }
  });

  it('異なる articleId を参照する習慣同士は従来どおり合算される（デグレなし・受け入れ条件3）', () => {
    // 実プリセット（quit_smoking / daily_cardio は別記事）で既存挙動を確認
    const both = computeDiagnosisV3({
      selections: [
        { presetId: 'quit_smoking_for_health', rate: 1 },
        { presetId: 'daily_cardio_habit', rate: 1 },
      ],
      profile: null,
    });
    const smoking = computeDiagnosisV3({
      selections: [{ presetId: 'quit_smoking_for_health', rate: 1 }],
      profile: null,
    });
    const cardio = computeDiagnosisV3({
      selections: [{ presetId: 'daily_cardio_habit', rate: 1 }],
      profile: null,
    });

    for (const kpi of KPI_KEYS) {
      expect(both.byKpi[kpi].raw).toBeCloseTo(
        smoking.byKpi[kpi].raw + cardio.byKpi[kpi].raw,
        6
      );
    }
    // 既存テスト（diagnosis-v3.test.ts）と同じ具体値も維持される
    expect(both.byKpi.cost_saving.raw).toBe(381_600);
  });
});
