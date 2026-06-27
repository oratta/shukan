import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  MINUTES_PER_YEAR,
  elapsedYearsSince,
  futureHorizonDays,
  pastHorizonDays,
  computeLifetimeImpact,
} from '@/lib/lifetime-impact';
import { presetPerTimeEffectValue } from '@/lib/onboarding';
import {
  WORKING_DAYS_PER_YEAR,
  resolveDerivedProfileValues,
  type DerivedProfileValues,
} from '@/lib/profile';
import { getLifeExpectancy } from '@/data/life-expectancy';
import type { UserProfile } from '@/lib/supabase/profiles';
import type { KpiKey } from '@/data/kpi/catalog';

// age 42 male（remainingLifeExpectancy=42.1 / remainingWorkingYears=23）を固定するための時刻
const FIXED_NOW = new Date('2026-06-27T00:00:00.000Z');

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'u1',
    birthYear: 1984, // FIXED_NOW で age=42
    gender: 'male',
    country: 'JP',
    annualIncome: 15_000_000,
    currency: 'JPY',
    trackedKpis: ['health_lifespan', 'positive_mood', 'cost_saving', 'earning'],
    createdAt: '2026-06-12T00:00:00.000Z',
    updatedAt: '2026-06-12T00:00:00.000Z',
    ...overrides,
  };
}

function derivedFor42Male(): DerivedProfileValues {
  // FIXED_NOW 前提（age=42）。プロフィール由来で計算する派生値。
  return {
    age: 42,
    remainingLifeExpectancy: getLifeExpectancy(42, 'male'), // 42.1
    dailyWage: 62_500,
    remainingWorkingYears: 23,
  };
}

const MINUTE_KPIS: KpiKey[] = ['health_lifespan', 'positive_mood'];
const MONEY_KPIS: KpiKey[] = ['cost_saving', 'earning'];

describe('MINUTES_PER_YEAR', () => {
  it('1年=525,600分', () => {
    expect(MINUTES_PER_YEAR).toBe(525_600);
  });
});

// --- B-S3 / AC#8b: 未来 horizon が KPI 種別で正しい ---
describe('futureHorizonDays', () => {
  const derived = derivedFor42Male();

  it('health_lifespan / positive_mood は remainingLifeExpectancy×365', () => {
    for (const kpi of MINUTE_KPIS) {
      expect(futureHorizonDays(kpi, derived)).toBe(derived.remainingLifeExpectancy * 365);
    }
  });

  it('cost_saving / earning は remainingWorkingYears×WORKING_DAYS_PER_YEAR(240)', () => {
    for (const kpi of MONEY_KPIS) {
      expect(futureHorizonDays(kpi, derived)).toBe(
        derived.remainingWorkingYears * WORKING_DAYS_PER_YEAR
      );
    }
  });
});

// --- B-S1 / AC#7: 過去 horizon は未来と KPI 種別で対称 ---
describe('pastHorizonDays', () => {
  it('health_lifespan / positive_mood は elapsedYears×365', () => {
    for (const kpi of MINUTE_KPIS) {
      expect(pastHorizonDays(kpi, 10)).toBe(10 * 365);
    }
  });

  it('cost_saving / earning は elapsedWorkingYears×240（暦日一律でない）', () => {
    for (const kpi of MONEY_KPIS) {
      expect(pastHorizonDays(kpi, 10)).toBe(10 * WORKING_DAYS_PER_YEAR);
    }
    // 暦日一律（×365）でないことを明示: money 系は health 系の 240/365 倍
    expect(pastHorizonDays('earning', 10)).toBeLessThan(pastHorizonDays('health_lifespan', 10));
  });

  it('負の elapsedYears は 0 にクランプ', () => {
    expect(pastHorizonDays('health_lifespan', -5)).toBe(0);
    expect(pastHorizonDays('earning', -5)).toBe(0);
  });
});

// --- B-S5 / D7: elapsedYearsSince の境界 ---
describe('elapsedYearsSince（境界）', () => {
  it('約10年前は ~10年', () => {
    expect(elapsedYearsSince('2016-06-27', FIXED_NOW)).toBeCloseTo(10, 0);
  });

  it('未来日は 0（負にしない）', () => {
    expect(elapsedYearsSince('2030-01-01', FIXED_NOW)).toBe(0);
  });

  it('当日（0年）は 0 付近（負でない）', () => {
    const v = elapsedYearsSince('2026-06-27', FIXED_NOW);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(0.01);
  });

  it('極端な長期（50年）は大きな正の値', () => {
    expect(elapsedYearsSince('1976-06-27', FIXED_NOW)).toBeCloseTo(50, 0);
  });

  it('不正な日付文字列は 0', () => {
    expect(elapsedYearsSince('not-a-date', FIXED_NOW)).toBe(0);
  });
});

describe('computeLifetimeImpact', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('B-S2 / AC#8: KPI4軸それぞれに {past, future} を返す', () => {
    const result = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2016-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    for (const kpi of ['health_lifespan', 'positive_mood', 'cost_saving', 'earning'] as KpiKey[]) {
      expect(result.byKpi[kpi]).toHaveProperty('past');
      expect(result.byKpi[kpi]).toHaveProperty('future');
    }
  });

  it('B-S2 / AC#8: future は active 習慣のみ、past は established 習慣のみで集計', () => {
    // active のみ → past=0
    const activeOnly = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(activeOnly.byKpi.earning.future).toBeGreaterThan(0);
    expect(activeOnly.byKpi.earning.past).toBe(0);

    // established のみ → future=0
    const establishedOnly = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'deep_focus_work', establishedSince: '2016-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(establishedOnly.byKpi.earning.past).toBeGreaterThan(0);
    expect(establishedOnly.byKpi.earning.future).toBe(0);
  });

  it('B-S2 / AC#8: future earning = perTime値 × remainingWorkingYears × 240（丸め）', () => {
    const eff = presetPerTimeEffectValue('deep_focus_work', 'earning');
    expect(eff).not.toBeNull();
    const derived = derivedFor42Male();
    const expected = Math.round(
      eff!.value * derived.remainingWorkingYears * WORKING_DAYS_PER_YEAR
    );
    const result = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.earning.future).toBe(expected);
  });

  it('B-S4 / AC#9: health_lifespan / positive_mood は分→年換算（端数丸め）', () => {
    const result = computeLifetimeImpact({
      activePresetIds: ['daily_cardio_habit'],
      establishedHabits: [],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    const eff = presetPerTimeEffectValue('daily_cardio_habit', 'health_lifespan');
    expect(eff).not.toBeNull();
    const derived = derivedFor42Male();
    const totalMinutes = eff!.value * derived.remainingLifeExpectancy * 365;
    const expectedYears = Math.round(totalMinutes / MINUTES_PER_YEAR);
    expect(result.byKpi.health_lifespan.future).toBe(expectedYears);
  });

  it('B-S1 / AC#7: 過去累積は perTime値 × 過去horizon（established_since 由来）', () => {
    const elapsed = elapsedYearsSince('2016-06-27', FIXED_NOW);
    const eff = presetPerTimeEffectValue('quit_drinking', 'cost_saving');
    expect(eff).not.toBeNull();
    const expected = Math.round(eff!.value * elapsed * WORKING_DAYS_PER_YEAR);
    const result = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2016-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.cost_saving.past).toBe(expected);
  });

  it('B-S5 / D7: established_since が未来日のとき past=0', () => {
    const result = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2030-01-01' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.cost_saving.past).toBe(0);
  });

  it('B-S5 / D7: established_since が当日（0年）のとき past≈0', () => {
    const result = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2026-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.cost_saving.past).toBe(0);
  });

  it('B-S5 / D7: 極端な長期（50年）は大きな past', () => {
    const result = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '1976-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.cost_saving.past).toBeGreaterThan(0);
    // 50年 ≒ 10年の約5倍（線形）
    const tenYears = computeLifetimeImpact({
      activePresetIds: [],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2016-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(result.byKpi.cost_saving.past).toBeGreaterThan(tenYears.byKpi.cost_saving.past * 4);
  });

  it('AC#7: established 習慣があると pastIsEstimated=true（推定フラグ）', () => {
    const withEstablished = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [{ presetId: 'quit_drinking', establishedSince: '2016-06-27' }],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(withEstablished.pastIsEstimated).toBe(true);

    const withoutEstablished = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [],
      profile: makeProfile(),
      now: FIXED_NOW,
    });
    expect(withoutEstablished.pastIsEstimated).toBe(false);
  });

  it('profile=null は V2 既定プロフィールにフォールバックし NaN を出さない', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    const result = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [],
      profile: null,
    });
    for (const kpi of ['health_lifespan', 'positive_mood', 'cost_saving', 'earning'] as KpiKey[]) {
      expect(Number.isNaN(result.byKpi[kpi].future)).toBe(false);
      expect(Number.isNaN(result.byKpi[kpi].past)).toBe(false);
    }
  });

  it('同一プロフィールでは resolveDerivedProfileValues と整合（future earning）', () => {
    const profile = makeProfile();
    const derived = resolveDerivedProfileValues(profile);
    const eff = presetPerTimeEffectValue('deep_focus_work', 'earning');
    const expected = Math.round(
      eff!.value * derived.remainingWorkingYears * WORKING_DAYS_PER_YEAR
    );
    const result = computeLifetimeImpact({
      activePresetIds: ['deep_focus_work'],
      establishedHabits: [],
      profile,
      now: FIXED_NOW,
    });
    expect(result.byKpi.earning.future).toBe(expected);
  });
});
