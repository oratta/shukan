import { describe, it, expect } from 'vitest';
import {
  isDailyTrackedHabit,
  isEstablishedHabit,
} from '@/lib/habits';
import { computeHabitLifetimeEffect } from '@/lib/diagnosis-v3';
import type { Habit } from '@/types/habit';

// --- Helpers ---
function makeHabit(overrides: Partial<Habit> & { id: string }): Habit {
  return {
    name: 'Test Habit',
    icon: 'target',
    frequency: 'everyday',
    type: 'positive',
    dailyTarget: 1,
    createdAt: '2026-01-01',
    archived: false,
    evidences: [],
    sortOrder: 0,
    status: 'active',
    ...overrides,
  };
}

// ============================================================
// 3場面分類（active=デイリー / established=生涯効果）
// ============================================================

describe('isDailyTrackedHabit', () => {
  it('active habit is tracked in daily metrics', () => {
    expect(isDailyTrackedHabit(makeHabit({ id: 'h1', status: 'active' }))).toBe(true);
  });

  it('established habit is excluded from daily metrics', () => {
    expect(isDailyTrackedHabit(makeHabit({ id: 'h1', status: 'established' }))).toBe(false);
  });

  it('archived habit is excluded even if active', () => {
    expect(isDailyTrackedHabit(makeHabit({ id: 'h1', status: 'active', archived: true }))).toBe(false);
  });
});

describe('isEstablishedHabit', () => {
  it('established, non-archived habit belongs to the established section', () => {
    expect(isEstablishedHabit(makeHabit({ id: 'h1', status: 'established' }))).toBe(true);
  });

  it('active habit does not belong to the established section', () => {
    expect(isEstablishedHabit(makeHabit({ id: 'h1', status: 'active' }))).toBe(false);
  });

  it('archived established habit is not shown in the established section', () => {
    expect(isEstablishedHabit(makeHabit({ id: 'h1', status: 'established', archived: true }))).toBe(false);
  });

  it('active and established are mutually exclusive for the same non-archived habit', () => {
    const active = makeHabit({ id: 'a', status: 'active' });
    const established = makeHabit({ id: 'e', status: 'established' });
    expect(isDailyTrackedHabit(active) && isEstablishedHabit(active)).toBe(false);
    expect(isDailyTrackedHabit(established) && isEstablishedHabit(established)).toBe(false);
  });
});

// ============================================================
// established の生涯効果（この習慣が残りの人生であなたにもたらすこと）
// ============================================================

describe('computeHabitLifetimeEffect', () => {
  it('projects per-day effect over the remaining life horizon at rate=1 (default profile)', () => {
    // profile null → V2 default: remainingLifeExpectancy=40年 / WORKING_DAYS_PER_YEAR=240
    const result = computeHabitLifetimeEffect(
      { healthMinutes: 60, positiveMoodMinutes: 20, costSaving: 500, incomeGain: 100 },
      null
    );

    // health_lifespan: 60 * 40 * 365 = 876,000 分 → 876000/525600 = 1.666... 年
    expect(result.byKpi.health_lifespan.raw).toBe(876_000);
    expect(result.byKpi.health_lifespan.unit).toBe('年');
    expect(result.byKpi.health_lifespan.display).toBe('1.7');

    // positive_mood: 20 分/日（horizon 無し）
    expect(result.byKpi.positive_mood.raw).toBe(20);
    expect(result.byKpi.positive_mood.unit).toBe('分/日');

    // cost_saving: 500 * 240 = 120,000 円/年 → 12 万円/年
    expect(result.byKpi.cost_saving.raw).toBe(120_000);
    expect(result.byKpi.cost_saving.display).toBe('12');

    // earning: 100 * 240 = 24,000 円/年 → 2 万円/年（四捨五入）
    expect(result.byKpi.earning.raw).toBe(24_000);
  });

  it('returns zeros for a habit with no per-day effect', () => {
    const result = computeHabitLifetimeEffect(
      { healthMinutes: 0, positiveMoodMinutes: 0, costSaving: 0, incomeGain: 0 },
      null
    );
    expect(result.byKpi.health_lifespan.raw).toBe(0);
    expect(result.byKpi.positive_mood.raw).toBe(0);
    expect(result.byKpi.cost_saving.raw).toBe(0);
    expect(result.byKpi.earning.raw).toBe(0);
  });
});
