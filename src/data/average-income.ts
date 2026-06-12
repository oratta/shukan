// 平均年収表（静的・日本のみ・5歳刻み）
//
// プロフィールで年収が未入力のときのフォールバック値。出費削減/稼ぐ能力 KPI の
// 日給計算に使う。オンボーディングの概算計算用であり、統計的厳密さは不要。
// 出典・参照年を明記し、差し替え可能にする。
//
// 出典: 国税庁「令和4年分（2022年）民間給与実態統計調査」の年齢階層別・男女別
//   平均給与（年・円）の近似値。
//   https://www.nta.go.jp/publication/statistics/kokuzeicho/minkan2022/
// 注: 国別対応は将来拡張。本ファイルは日本データのみとし、関数シグネチャに country は持たない（YAGNI）。

import type { StatGender } from './life-expectancy';

export interface AverageIncomeBracket {
  /** 年齢ブラケット下限（含む） */
  ageMin: number;
  /** 年齢ブラケット上限（含む） */
  ageMax: number;
  /** 男性の平均年収（円） */
  male: number;
  /** 女性の平均年収（円） */
  female: number;
}

// 民間給与実態統計調査の年齢階層別平均給与（万円）を円に換算した近似値。
export const AVERAGE_INCOME_TABLE: readonly AverageIncomeBracket[] = [
  { ageMin: 20, ageMax: 24, male: 2_910_000, female: 2_530_000 },
  { ageMin: 25, ageMax: 29, male: 4_200_000, female: 3_490_000 },
  { ageMin: 30, ageMax: 34, male: 4_850_000, female: 3_370_000 },
  { ageMin: 35, ageMax: 39, male: 5_490_000, female: 3_360_000 },
  { ageMin: 40, ageMax: 44, male: 6_020_000, female: 3_350_000 },
  { ageMin: 45, ageMax: 49, male: 6_430_000, female: 3_350_000 },
  { ageMin: 50, ageMax: 54, male: 6_840_000, female: 3_310_000 },
  { ageMin: 55, ageMax: 59, male: 7_020_000, female: 3_160_000 },
  { ageMin: 60, ageMax: 64, male: 5_690_000, female: 2_790_000 },
  { ageMin: 65, ageMax: 69, male: 4_280_000, female: 2_270_000 },
  { ageMin: 70, ageMax: 74, male: 3_670_000, female: 2_150_000 },
] as const;

/**
 * 年齢に最も近い（または該当する）ブラケットを返す。
 * 範囲外の年齢は最近傍ブラケット（最年少/最年長）にフォールバックし、エラーにしない。
 */
function findBracket(age: number): AverageIncomeBracket {
  const table = AVERAGE_INCOME_TABLE;
  for (const b of table) {
    if (age >= b.ageMin && age <= b.ageMax) return b;
  }
  if (age < table[0].ageMin) return table[0];
  return table[table.length - 1];
}

/**
 * 平均年収（円）を引き当てる。
 * - gender 'other' / 'unspecified' は男女平均にフォールバック
 * - 範囲外年齢は最近傍ブラケットにフォールバック
 * 年収未入力時の日給計算が NaN にならないよう、常に有限の正の数値を返す。
 */
export function getAverageIncome(age: number, gender: StatGender): number {
  const b = findBracket(age);
  if (gender === 'male') return b.male;
  if (gender === 'female') return b.female;
  return (b.male + b.female) / 2;
}
