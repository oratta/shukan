// オンボーディング v3 診断計算（未来のみ・達成率係数・新表示単位）— change-B / diagnosis-calc-v3。
//
// v2 の `computeLifetimeImpact`（過去累積＋生涯累計）とは別の、v3 段階タップ診断用の
// 純粋関数群。additive（既存 API は一切変更しない）。
//
// 仕様の正: docs/context/onboarding-v3-effect-model.md §1「表示単位」表 / plan.md 受け入れ条件 #7・#9。
// UI・挙動の正: _longruns/2026-06-28_onboarding-v3-interactive/prototype/onboarding-step2-proto.html。
//
// 中核構造:  効果 = per-day効果 × 達成率 × horizon（未来のみ・過去項なし）
//   per-day効果（calculationParams の合算）は `presetPerTimeEffectValue` を再利用（達成率100%基準）。
//
// KPI 別 horizon と表示単位（effect-model.md §1・混在容認）:
//   健康寿命   … per-day × 残り寿命年 × 365 → 生涯（年・小数1桁。365日未満は「日」）
//   前向き     … per-day（horizon 無し）    → 1日あたり（分/日）
//   出費削減   … per-day × 240（就労日/年）  → 年額（万円/年）
//   増える収入 … per-day × 240              → 年額（万円/年）

import type { KpiKey } from '@/data/kpi/catalog';
import { KPI_KEYS } from '@/data/kpi/catalog';
import { presetPerTimeEffectValue } from '@/lib/onboarding';
import {
  WORKING_DAYS_PER_YEAR,
  resolveDerivedProfileValues,
  type DerivedProfileValues,
} from '@/lib/profile';
import type { UserProfile } from '@/lib/supabase/profiles';

/** 達成率（0=やってない / 0.3=たまに / 0.7=だいたい / 1=完璧に習慣化）。 */
export type AchievementRate = 0 | 0.3 | 0.7 | 1;

/** 段階タップ4択の達成率（降順ではなく昇順の正準表現）。 */
export const ACHIEVEMENT_RATES: readonly AchievementRate[] = [0, 0.3, 0.7, 1] as const;

/** 1年の暦日数（健康寿命 horizon 用）。 */
export const DAYS_PER_YEAR = 365;

/** 1日の分数（分の累計 → 生涯年換算用）。 */
export const MINUTES_PER_DAY = 1440;

/** 1万円（円 → 万円 換算用）。 */
export const YEN_PER_MAN = 10_000;

/** 分の累計 → 年（= 1440 × 365 = 525,600）。 */
const MINUTES_PER_YEAR = MINUTES_PER_DAY * DAYS_PER_YEAR;

/**
 * KPI 1軸の raw 効果量（未来のみ・達成率反映後）を算出する純粋関数。
 * 返り値の単位は KPI で異なる:
 *   health_lifespan … 分（残り人生の累計）
 *   positive_mood   … 分/日
 *   cost_saving / earning … 円/年
 *
 * @param kpi     KPI 軸
 * @param perDay  その KPI の per-day 効果（達成率100%基準・presetPerTimeEffectValue 由来）
 * @param rate    達成率（0/0.3/0.7/1）
 * @param derived プロフィール派生値（remainingLifeExpectancy を使用）
 */
export function kpiRawValue(
  kpi: KpiKey,
  perDay: number,
  rate: number,
  derived: DerivedProfileValues
): number {
  switch (kpi) {
    case 'health_lifespan':
      // 残り人生ぶんの累計（分）。horizon = 残り寿命年 × 365 暦日。
      return perDay * derived.remainingLifeExpectancy * DAYS_PER_YEAR * rate;
    case 'positive_mood':
      // 1日あたり（分/日）。horizon 無し。
      return perDay * rate;
    case 'cost_saving':
    case 'earning':
      // 年額（円/年）。horizon = 240 就労日/年（生涯累計ではない）。
      return perDay * WORKING_DAYS_PER_YEAR * rate;
  }
}

/** 表示用にフォーマットした KPI 値（数値文字列＋単位）。 */
export interface FormattedKpiValue {
  /** 表示する数値の文字列（丸め・桁区切り・小数処理済み）。 */
  display: string;
  /** 単位ラベル（年 / 日 / 分/日 / 万円/年）。 */
  unit: string;
}

/**
 * raw 効果量を KPI 別の表示単位へ整形する（プロト fmt と同一挙動）。
 *   health_lifespan … 365日以上は「年」小数1桁、未満は「日」四捨五入
 *   positive_mood   … 「分/日」四捨五入
 *   cost_saving / earning … 「万円/年」（円→万円・四捨五入）
 */
export function formatKpiValue(kpi: KpiKey, raw: number): FormattedKpiValue {
  switch (kpi) {
    case 'health_lifespan': {
      const days = raw / MINUTES_PER_DAY;
      if (days >= DAYS_PER_YEAR) {
        return { display: (raw / MINUTES_PER_YEAR).toFixed(1), unit: '年' };
      }
      return { display: Math.round(days).toLocaleString('ja-JP'), unit: '日' };
    }
    case 'positive_mood':
      return { display: Math.round(raw).toLocaleString('ja-JP'), unit: '分/日' };
    case 'cost_saving':
    case 'earning':
      return { display: Math.round(raw / YEN_PER_MAN).toLocaleString('ja-JP'), unit: '万円/年' };
  }
}

/** 習慣1件の選択（プリセットID＋達成率）。 */
export interface HabitSelection {
  presetId: string;
  rate: AchievementRate;
}

export interface DiagnosisV3Input {
  /** 段階タップで選ばれた習慣＋達成率のリスト。 */
  selections: HabitSelection[];
  /** プロフィール（null は V2 既定値にフォールバック＝残り寿命40年など）。 */
  profile: UserProfile | null;
}

/** KPI 1軸の診断結果（raw ＋整形済み表示）。 */
export interface KpiDiagnosisValue extends FormattedKpiValue {
  /** 集計後の raw 効果量（アニメーション補間などに使う）。 */
  raw: number;
}

export interface DiagnosisV3Result {
  /** KPI4軸それぞれの診断結果。 */
  byKpi: Record<KpiKey, KpiDiagnosisValue>;
}

/** プリセットの per-day 効果（達成率100%基準）を取得する。未知・効果0は 0。 */
function presetPerDay(presetId: string, kpi: KpiKey): number {
  const eff = presetPerTimeEffectValue(presetId, kpi);
  return eff ? eff.value : 0;
}

/**
 * 選択された習慣群 × 達成率から4KPIの未来インパクト（新表示単位）を集計する。
 * 過去項は持たない（MVP=未来のみ）。全選択0%・選択なし・未知プリセットでもエラーにせず0を返す。
 */
export function computeDiagnosisV3(input: DiagnosisV3Input): DiagnosisV3Result {
  const derived = resolveDerivedProfileValues(input.profile);
  const byKpi = {} as Record<KpiKey, KpiDiagnosisValue>;

  for (const kpi of KPI_KEYS) {
    let raw = 0;
    for (const sel of input.selections) {
      raw += kpiRawValue(kpi, presetPerDay(sel.presetId, kpi), sel.rate, derived);
    }
    byKpi[kpi] = { raw, ...formatKpiValue(kpi, raw) };
  }

  return { byKpi };
}

/**
 * その習慣を「達成率100%」でやったときの生涯ポテンシャル（未来分の4KPI値）。
 * [2] 各カードの「この習慣が、残りの人生であなたにもたらすこと」個別インパクト表示に使う。
 */
export function habitPotentialV3(presetId: string, profile: UserProfile | null): DiagnosisV3Result {
  return computeDiagnosisV3({ selections: [{ presetId, rate: 1 }], profile });
}
