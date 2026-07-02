// プロフィール入力値から派生値を計算する純粋関数群。
//
// 派生値（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears）は
// DB に保存せず（onboarding-data-model.md §1.1 / design.md D1）、ここで都度計算する。
// 平均余命表・平均年収表は change-A のカタログ（src/data）を参照する（D6）。

import { getLifeExpectancy, type StatGender } from '@/data/life-expectancy';
import { getAverageIncome } from '@/data/average-income';
import { V2_DEFAULT_PROFILE } from '@/types/impact';
import type { UserProfile } from '@/lib/supabase/profiles';

// 計算定数（D5: V2_DEFAULT_PROFILE の整合から逆算）
export const RETIREMENT_AGE = 65;
export const WORKING_DAYS_PER_YEAR = 240;

/** プロフィールから算出される派生値（保存しない） */
export interface DerivedProfileValues {
  age: number;
  remainingLifeExpectancy: number;
  dailyWage: number;
  remainingWorkingYears: number;
}

/**
 * 年齢を算出する（現在年 − birthYear）。
 * birthYear が null のときは V2_DEFAULT_PROFILE.birthYear を既定値として使う。
 */
export function calculateAge(birthYear: number | null): number {
  const year = birthYear ?? V2_DEFAULT_PROFILE.birthYear;
  return new Date().getFullYear() - year;
}

/**
 * 残労働年数を算出する（退職年齢 − age）。
 * 退職年齢以上では負の値にせず 0 を返す。
 */
export function calculateRemainingWorkingYears(age: number): number {
  return Math.max(0, RETIREMENT_AGE - age);
}

/**
 * 残存余命（年）を算出する。平均余命表カタログを age × gender で参照する。
 * カタログは日本のみ（country を引数に取らない＝D6 / change-A のシグネチャに従う）。
 */
export function calculateRemainingLifeExpectancy(
  age: number,
  gender: StatGender
): number {
  return getLifeExpectancy(age, gender);
}

/**
 * 日給を算出する（年収 ÷ 年間労働日数）。
 * annualIncome が null のときは平均年収表（age × gender）でフォールバックする（B-S5）。
 * カタログは日本のみ（country を引数に取らない＝D6）。
 */
export function calculateDailyWage(
  annualIncome: number | null,
  age: number,
  gender: StatGender
): number {
  const income = annualIncome ?? getAverageIncome(age, gender);
  return income / WORKING_DAYS_PER_YEAR;
}

/**
 * プロフィールから全派生値を解決する。
 * プロフィールが null のときは V2_DEFAULT_PROFILE 相当の固定値を返す（B-S6）。
 * V2 フォールバックは現在年に依存しない固定値（age 42 / 残労働 23 / 日給 62,500 / 残存余命 40）。
 */
export function resolveDerivedProfileValues(
  profile: UserProfile | null
): DerivedProfileValues {
  if (!profile) {
    return {
      age: V2_DEFAULT_PROFILE.age,
      remainingLifeExpectancy: V2_DEFAULT_PROFILE.remainingLifeExpectancy,
      dailyWage: V2_DEFAULT_PROFILE.dailyWage,
      remainingWorkingYears: V2_DEFAULT_PROFILE.remainingWorkingYears,
    };
  }

  const age = calculateAge(profile.birthYear);
  return {
    age,
    remainingLifeExpectancy: calculateRemainingLifeExpectancy(age, profile.gender),
    dailyWage: calculateDailyWage(profile.annualIncome, age, profile.gender),
    remainingWorkingYears: calculateRemainingWorkingYears(age),
  };
}
