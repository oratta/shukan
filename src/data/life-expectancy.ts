// 平均余命表（静的・日本のみ・5歳刻み）
//
// KPI 計算（残存余命の按分等）の入力。オンボーディングの概算計算用であり、
// 医学的・統計的厳密さは不要。出典・参照年を明記し、差し替え可能にする。
//
// 出典: 厚生労働省「令和4年（2022年）簡易生命表」の平均余命（年）の近似値。
//   https://www.mhlw.go.jp/toukei/saikin/hw/life/life22/
//   ある年齢の人が、平均してあと何年生きられるかの期待値（remaining life expectancy）。
// 注: 国別対応は将来拡張。本ファイルは日本データのみとし、関数シグネチャに country は持たない（YAGNI）。

export interface LifeExpectancyBracket {
  /** 年齢ブラケット下限（含む） */
  ageMin: number;
  /** 年齢ブラケット上限（含む） */
  ageMax: number;
  /** 男性の平均余命（年） */
  male: number;
  /** 女性の平均余命（年） */
  female: number;
}

// 各ブラケットの代表年齢（下限）における簡易生命表の平均余命を近似値として採用。
// 値の単位は「年」。
export const LIFE_EXPECTANCY_TABLE: readonly LifeExpectancyBracket[] = [
  { ageMin: 20, ageMax: 24, male: 61.4, female: 67.4 },
  { ageMin: 25, ageMax: 29, male: 56.5, female: 62.5 },
  { ageMin: 30, ageMax: 34, male: 51.7, female: 57.6 },
  { ageMin: 35, ageMax: 39, male: 46.9, female: 52.7 },
  { ageMin: 40, ageMax: 44, male: 42.1, female: 47.9 },
  { ageMin: 45, ageMax: 49, male: 37.4, female: 43.1 },
  { ageMin: 50, ageMax: 54, male: 32.9, female: 38.4 },
  { ageMin: 55, ageMax: 59, male: 28.6, female: 33.8 },
  { ageMin: 60, ageMax: 64, male: 24.5, female: 29.3 },
  { ageMin: 65, ageMax: 69, male: 20.7, female: 25.0 },
  { ageMin: 70, ageMax: 74, male: 16.8, female: 20.8 },
  { ageMin: 75, ageMax: 79, male: 13.1, female: 16.7 },
  { ageMin: 80, ageMax: 84, male: 9.8, female: 12.8 },
  { ageMin: 85, ageMax: 89, male: 7.0, female: 9.3 },
] as const;

export type StatGender = 'male' | 'female' | 'other' | 'unspecified';

/**
 * 年齢に最も近い（または該当する）ブラケットを返す。
 * 範囲外の年齢は最近傍ブラケット（最年少/最年長）にフォールバックし、エラーにしない。
 */
function findBracket(age: number): LifeExpectancyBracket {
  const table = LIFE_EXPECTANCY_TABLE;
  for (const b of table) {
    if (age >= b.ageMin && age <= b.ageMax) return b;
  }
  // 範囲外: 最近傍ブラケットへフォールバック
  if (age < table[0].ageMin) return table[0];
  return table[table.length - 1];
}

/**
 * 平均余命（年）を引き当てる。
 * - gender 'other' / 'unspecified' は男女平均にフォールバック
 * - 範囲外年齢は最近傍ブラケットにフォールバック
 * プロフィール入力を計算不能（NaN）にしないため、常に有限の数値を返す。
 */
export function getLifeExpectancy(age: number, gender: StatGender): number {
  const b = findBracket(age);
  if (gender === 'male') return b.male;
  if (gender === 'female') return b.female;
  // other / unspecified: 男女平均
  return (b.male + b.female) / 2;
}
