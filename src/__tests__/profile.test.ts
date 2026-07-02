import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  RETIREMENT_AGE,
  WORKING_DAYS_PER_YEAR,
  calculateAge,
  calculateRemainingWorkingYears,
  calculateRemainingLifeExpectancy,
  calculateDailyWage,
  resolveDerivedProfileValues,
} from '@/lib/profile';
import { getLifeExpectancy } from '@/data/life-expectancy';
import { getAverageIncome } from '@/data/average-income';
import { V2_DEFAULT_PROFILE } from '@/types/impact';
import type { UserProfile } from '@/lib/supabase/profiles';

const CURRENT_YEAR = new Date().getFullYear();

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'u1',
    birthYear: 1984,
    gender: 'male',
    country: 'JP',
    annualIncome: 15_000_000,
    currency: 'JPY',
    trackedKpis: ['cost_saving'],
    createdAt: '2026-06-12T00:00:00.000Z',
    updatedAt: '2026-06-12T00:00:00.000Z',
    ...overrides,
  };
}

describe('constants (D5)', () => {
  it('RETIREMENT_AGE は 65', () => {
    expect(RETIREMENT_AGE).toBe(65);
  });
  it('WORKING_DAYS_PER_YEAR は 240', () => {
    expect(WORKING_DAYS_PER_YEAR).toBe(240);
  });
});

describe('calculateAge', () => {
  it('現在年 − birthYear で算出する', () => {
    expect(calculateAge(1984)).toBe(CURRENT_YEAR - 1984);
  });
  it('birthYear が null のときは V2_DEFAULT_PROFILE.age に近い値（現在年 − default birthYear）にフォールバック', () => {
    expect(calculateAge(null)).toBe(CURRENT_YEAR - V2_DEFAULT_PROFILE.birthYear);
  });
});

describe('calculateRemainingWorkingYears', () => {
  it('退職年齢未満は 退職年齢 − age', () => {
    expect(calculateRemainingWorkingYears(42)).toBe(RETIREMENT_AGE - 42);
  });
  it('退職年齢ちょうどは 0', () => {
    expect(calculateRemainingWorkingYears(65)).toBe(0);
  });
  it('退職年齢超過でも負にならず 0', () => {
    expect(calculateRemainingWorkingYears(70)).toBe(0);
  });
  it('境界 64 歳は 1 年', () => {
    expect(calculateRemainingWorkingYears(64)).toBe(1);
  });
});

describe('calculateRemainingLifeExpectancy', () => {
  it('平均余命表から age × gender で引いた値を返す', () => {
    // age 42 male → 40〜44 ブラケット
    expect(calculateRemainingLifeExpectancy(42, 'male')).toBe(
      getLifeExpectancy(42, 'male')
    );
  });
  it('gender unspecified は男女平均（表のフォールバック）', () => {
    expect(calculateRemainingLifeExpectancy(42, 'unspecified')).toBe(
      getLifeExpectancy(42, 'unspecified')
    );
  });
});

describe('calculateDailyWage', () => {
  it('年収入力済みは 年収 ÷ 年間労働日数（B-S4: 15,000,000 ÷ 240 = 62,500）', () => {
    expect(calculateDailyWage(15_000_000, 42, 'male')).toBe(62_500);
  });

  it('B-S5: 年収 null は平均年収表（age × gender）÷ 労働日数で算出、NaN にならない', () => {
    const age = CURRENT_YEAR - 1990; // female プロフィール想定
    const expected = getAverageIncome(age, 'female') / WORKING_DAYS_PER_YEAR;
    const wage = calculateDailyWage(null, age, 'female');
    expect(wage).toBe(expected);
    expect(Number.isNaN(wage)).toBe(false);
    expect(wage).toBeGreaterThan(0);
  });
});

describe('resolveDerivedProfileValues', () => {
  it('B-S4: プロフィール入りで全派生値を返す', () => {
    const age = CURRENT_YEAR - 1984;
    const d = resolveDerivedProfileValues(makeProfile({ birthYear: 1984 }));
    expect(d.age).toBe(age);
    expect(d.remainingWorkingYears).toBe(RETIREMENT_AGE - age);
    expect(d.remainingLifeExpectancy).toBe(getLifeExpectancy(age, 'male'));
    expect(d.dailyWage).toBe(62_500);
  });

  it('B-S5: 年収未入力プロフィールでも dailyWage が平均年収から算出され NaN でない', () => {
    const d = resolveDerivedProfileValues(
      makeProfile({ birthYear: 1990, gender: 'female', annualIncome: null })
    );
    const age = CURRENT_YEAR - 1990;
    expect(d.dailyWage).toBe(getAverageIncome(age, 'female') / WORKING_DAYS_PER_YEAR);
    expect(Number.isNaN(d.dailyWage)).toBe(false);
  });

  it('B-S6: プロフィール null は V2_DEFAULT_PROFILE 相当の派生値を返す', () => {
    const d = resolveDerivedProfileValues(null);
    expect(d.age).toBe(V2_DEFAULT_PROFILE.age);
    expect(d.dailyWage).toBe(V2_DEFAULT_PROFILE.dailyWage);
    expect(d.remainingLifeExpectancy).toBe(V2_DEFAULT_PROFILE.remainingLifeExpectancy);
    expect(d.remainingWorkingYears).toBe(V2_DEFAULT_PROFILE.remainingWorkingYears);
  });
});

describe('B-S6: V2_DEFAULT_PROFILE 整合（age は現在年に依存しない固定フォールバック）', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('別の年でも null フォールバックは V2 の固定値を返す（age 42 / 残労働 23）', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'));
    const d = resolveDerivedProfileValues(null);
    expect(d.age).toBe(42);
    expect(d.remainingWorkingYears).toBe(23);
    expect(d.dailyWage).toBe(62_500);
    expect(d.remainingLifeExpectancy).toBe(40);
  });
});
