// 一生インパクト計算（過去累積＋未来一生分）— change-B / lifetime-impact-calc。
//
// KPI4軸ごとに { past, future } を返す合算計算 API。
//   future（未来一生分） = active 習慣のみ。per-time 効果 × 未来 horizon 日数。
//   past（過去累積）     = established 習慣のみ。per-time 効果 × 過去 horizon 日数。
// 過去・未来は期間が排他なので相互の二重計上はない。
//
// 設計（plan.md change-B / decisions.md D1・D3・D7）:
//   - 既存に「remaining余命×日次効果の集計関数」は無いため新規実装する。
//     建材は presetPerTimeEffectValue（1回あたり効果）と resolveDerivedProfileValues（horizon 派生値）。
//   - horizon は未来と過去で KPI 種別ごとに対称にする（暦日を全 KPI 一律にしない）:
//       health_lifespan / positive_mood … （余命 or 経過年）× 365 暦日
//       cost_saving / earning           … （残労働年 or 経過年）× WORKING_DAYS_PER_YEAR(240) 営業日
//     これで earning/cost_saving の過大計上（≒1.5倍）と未来との非整合を防ぐ。
//   - onboarding プリセットは everyday（頻度=1/日）前提のため頻度乗数は持たない（未来計算と対称）。
//   - 健康寿命・前向きな気持ちの時間は分→年に換算して返す（端数丸め）。
//   - 過去累積は推定値。pastIsEstimated フラグで UI が「推定」と明示できるようにする。

import type { KpiKey } from '@/data/kpi/catalog';
import { KPI_KEYS } from '@/data/kpi/catalog';
import { presetPerTimeEffectValue } from '@/lib/onboarding';
import {
  WORKING_DAYS_PER_YEAR,
  resolveDerivedProfileValues,
  type DerivedProfileValues,
} from '@/lib/profile';
import type { UserProfile } from '@/lib/supabase/profiles';

/** 1年 = 525,600 分（分系 KPI の分→年換算用）。 */
export const MINUTES_PER_YEAR = 525_600;

/** ユリウス年（経過年数の算出用）。 */
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** 分（時間量）系 KPI か。true なら horizon に暦日(365)を使い、結果は分→年換算する。 */
function isMinuteKpi(kpi: KpiKey): boolean {
  return kpi === 'health_lifespan' || kpi === 'positive_mood';
}

/**
 * 未来 horizon（日数）を KPI 種別ごとに返す。
 *   health_lifespan / positive_mood … remainingLifeExpectancy × 365
 *   cost_saving / earning           … remainingWorkingYears × WORKING_DAYS_PER_YEAR(240)
 */
export function futureHorizonDays(kpi: KpiKey, derived: DerivedProfileValues): number {
  if (isMinuteKpi(kpi)) return derived.remainingLifeExpectancy * 365;
  return derived.remainingWorkingYears * WORKING_DAYS_PER_YEAR;
}

/**
 * 過去 horizon（日数）を KPI 種別ごとに返す（未来と対称）。
 *   health_lifespan / positive_mood … elapsedYears × 365
 *   cost_saving / earning           … elapsedYears（=elapsedWorkingYears）× WORKING_DAYS_PER_YEAR(240)
 * 負の elapsedYears は 0 にクランプする。
 */
export function pastHorizonDays(kpi: KpiKey, elapsedYears: number): number {
  const yrs = Math.max(0, elapsedYears);
  if (isMinuteKpi(kpi)) return yrs * 365;
  return yrs * WORKING_DAYS_PER_YEAR;
}

/**
 * established_since（YYYY-MM-DD）から今日までの経過年数（小数・0以上）を返す。
 * 未来日 / 不正日付は 0（負にしない・NaN を漏らさない）。D7 の境界に対応。
 */
export function elapsedYearsSince(establishedSince: string, now: Date = new Date()): number {
  const start = new Date(establishedSince).getTime();
  if (Number.isNaN(start)) return 0;
  const elapsedMs = now.getTime() - start;
  return Math.max(0, elapsedMs / MS_PER_YEAR);
}

/** 過去 established 習慣 1件（プリセット由来 + 開始日）。 */
export interface EstablishedHabitInput {
  presetId: string;
  /** 身についた開始日（YYYY-MM-DD）。 */
  establishedSince: string;
}

export interface LifetimeImpactInput {
  /** 未来分の母集団: これから始める active 習慣のプリセットID。 */
  activePresetIds: string[];
  /** 過去分の母集団: 既に身についた established 習慣（開始日付き）。 */
  establishedHabits: EstablishedHabitInput[];
  /** プロフィール（null は V2 既定にフォールバック）。 */
  profile: UserProfile | null;
  /** テスト用の現在時刻（省略時 new Date()）。past の経過年算出に使う。 */
  now?: Date;
}

/** KPI 1軸の過去/未来インパクト。分系は年、金額系は円。いずれも丸め済み・非負の大きさ。 */
export interface KpiImpact {
  /** 過去累積（established 習慣のみ）。 */
  past: number;
  /** 未来一生分（active 習慣のみ）。 */
  future: number;
}

export interface LifetimeImpactResult {
  /** KPI4軸それぞれの { past, future }。 */
  byKpi: Record<KpiKey, KpiImpact>;
  /**
   * 過去累積が推定値である（＝表示する established 由来の past が存在する）ことを示すフラグ。
   * established 習慣が1件以上のとき true。UI は過去ブロックに「推定」と明示できる。
   */
  pastIsEstimated: boolean;
}

/** 分系 KPI は分→年（端数丸め）、金額系はそのまま丸めて返す。 */
function convertAndRound(kpi: KpiKey, totalRaw: number): number {
  if (isMinuteKpi(kpi)) return Math.round(totalRaw / MINUTES_PER_YEAR);
  return Math.round(totalRaw);
}

/**
 * 一生インパクト（過去累積＋未来一生分）を KPI4軸ごとに算出する。
 *   future = active 習慣のみ（per-time 効果 × 未来 horizon）
 *   past   = established 習慣のみ（per-time 効果 × 過去 horizon[established_since 由来]）
 * per-time 効果は presetPerTimeEffectValue を future/past で共通利用する。
 */
export function computeLifetimeImpact(input: LifetimeImpactInput): LifetimeImpactResult {
  const derived = resolveDerivedProfileValues(input.profile);
  const byKpi = {} as Record<KpiKey, KpiImpact>;

  for (const kpi of KPI_KEYS) {
    // 未来（active 習慣のみ）
    const fHorizon = futureHorizonDays(kpi, derived);
    let futureRaw = 0;
    for (const presetId of input.activePresetIds) {
      const eff = presetPerTimeEffectValue(presetId, kpi);
      if (!eff) continue;
      futureRaw += eff.value * fHorizon;
    }

    // 過去（established 習慣のみ・期間は排他なので未来と二重計上しない）
    let pastRaw = 0;
    for (const h of input.establishedHabits) {
      const eff = presetPerTimeEffectValue(h.presetId, kpi);
      if (!eff) continue;
      const elapsed = elapsedYearsSince(h.establishedSince, input.now);
      pastRaw += eff.value * pastHorizonDays(kpi, elapsed);
    }

    byKpi[kpi] = {
      past: convertAndRound(kpi, pastRaw),
      future: convertAndRound(kpi, futureRaw),
    };
  }

  return {
    byKpi,
    pastIsEstimated: input.establishedHabits.length > 0,
  };
}
