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
import { getHabitPreset } from '@/data/habit-presets';
import { getArticle } from '@/data/impact-articles';
import type { ArticleId } from '@/types/impact';
import { dedupeByArticleId } from '@/lib/impact';
import { articleKpiPerDay, ONBOARDING_V3_PRESET_IDS } from '@/lib/onboarding';
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

/** 記事単位の集計要素（articleId + その記事に適用する達成率）。 */
interface ArticleRate {
  articleId: ArticleId;
  rate: AchievementRate;
}

/**
 * 選択された習慣群を記事（エビデンス）単位に展開し、同一 articleId は
 * 「1回だけ計上・最大の達成率を採用」で de-dup する（issue #34: エビデンス重複加算の防止）。
 * 複数プリセットが同じ記事を参照していても（例: cardio 系と walking 系の内包関係）、
 * その記事の効果は最も高い達成率の1回分しか数えない。未知プリセットはスキップ。
 */
function dedupeSelectionArticles(selections: readonly HabitSelection[]): ArticleRate[] {
  const expanded: ArticleRate[] = [];
  for (const sel of selections) {
    const preset = getHabitPreset(sel.presetId);
    if (!preset) continue;
    for (const articleId of preset.articleIds) {
      expanded.push({ articleId, rate: sel.rate });
    }
  }
  return dedupeByArticleId(expanded, (a) => a.rate);
}

/**
 * 選択された習慣群 × 達成率から4KPIの未来インパクト（新表示単位）を集計する。
 * 過去項は持たない（MVP=未来のみ）。全選択0%・選択なし・未知プリセットでもエラーにせず0を返す。
 * 集計は記事（エビデンス）単位で行い、同一 articleId は最大達成率の1回だけ計上する（issue #34）。
 */
export function computeDiagnosisV3(input: DiagnosisV3Input): DiagnosisV3Result {
  const derived = resolveDerivedProfileValues(input.profile);
  const articleRates = dedupeSelectionArticles(input.selections);
  const byKpi = {} as Record<KpiKey, KpiDiagnosisValue>;

  for (const kpi of KPI_KEYS) {
    let raw = 0;
    for (const { articleId, rate } of articleRates) {
      const article = getArticle(articleId);
      if (!article) continue;
      raw += kpiRawValue(kpi, articleKpiPerDay(article, kpi), rate, derived);
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

/** ユーザー習慣の per-day 効果（エビデンス重み付き合計）。単位は impact.ts の DailyImpact と同一。 */
export interface HabitPerDayEffect {
  /** 健康寿命 per-day（分/日）。 */
  healthMinutes: number;
  /** 前向きな気持ちの時間 per-day（分/日）。 */
  positiveMoodMinutes: number;
  /** 出費削減 per-day（円/日）。 */
  costSaving: number;
  /** 増える収入 per-day（円/日）。 */
  incomeGain: number;
}

/**
 * established（身についた）習慣の生涯効果を4KPIで算出する（達成率=1・未来のみ）。
 * オンボ[4]の「この習慣が、残りの人生であなたにもたらすこと」と同一の horizon/表示単位を用いる。
 *
 * 診断オンボ（プリセット由来）と異なり、ユーザー習慣は evidences の per-day 効果を渡す。
 * per-day 効果は calculateDailyImpact（impact.ts）で算出したものをそのまま受け取る。
 *
 * @param perDay  習慣の per-day 効果（達成率100%基準）
 * @param profile プロフィール（null は V2 既定値にフォールバック＝残り寿命40年。change-5 で個人化）
 */
export function computeHabitLifetimeEffect(
  perDay: HabitPerDayEffect,
  profile: UserProfile | null = null
): DiagnosisV3Result {
  const derived = resolveDerivedProfileValues(profile);
  const perDayByKpi: Record<KpiKey, number> = {
    health_lifespan: perDay.healthMinutes,
    positive_mood: perDay.positiveMoodMinutes,
    cost_saving: perDay.costSaving,
    earning: perDay.incomeGain,
  };

  const byKpi = {} as Record<KpiKey, KpiDiagnosisValue>;
  for (const kpi of KPI_KEYS) {
    const raw = kpiRawValue(kpi, perDayByKpi[kpi], 1, derived);
    byKpi[kpi] = { raw, ...formatKpiValue(kpi, raw) };
  }
  return { byKpi };
}

// ───────── [6] 習慣選択: 伸びしろランキング ─────────

/** [6] 習慣選択の候補1件（現状達成率＋選んだ KPI への伸びしろ）。 */
export interface PresetGrowthCandidate {
  presetId: string;
  /** 診断で記録した現状の達成率（未回答は 0 扱い）。 */
  rate: AchievementRate;
  /** 選んだ KPI への伸びしろ（未達成分 × ポテンシャル）。新表示単位で整形済み。 */
  growth: KpiDiagnosisValue;
}

/**
 * 選んだ KPI への伸びしろ（(1 - 達成率) × 100%ポテンシャル）が大きい順に候補を返す。
 *   - 達成率 100% の習慣は伸びしろゼロのため除外する
 *   - その KPI に効果のない習慣（伸びしろ 0 以下）も除外する
 *   - 同値は ONBOARDING_V3_PRESET_IDS の表示順を保つ（安定ソート）
 */
export function rankPresetsByGrowth(
  kpi: KpiKey,
  rates: Record<string, AchievementRate>,
  profile: UserProfile | null,
  limit = 5
): PresetGrowthCandidate[] {
  const candidates: PresetGrowthCandidate[] = [];

  for (const presetId of ONBOARDING_V3_PRESET_IDS) {
    const rate = rates[presetId] ?? 0;
    if (rate === 1) continue; // 伸びしろゼロ
    const potential = habitPotentialV3(presetId, profile).byKpi[kpi].raw;
    const growthRaw = (1 - rate) * potential;
    if (growthRaw <= 0) continue; // この KPI に効果なし
    candidates.push({
      presetId,
      rate,
      growth: { raw: growthRaw, ...formatKpiValue(kpi, growthRaw) },
    });
  }

  return candidates.sort((a, b) => b.growth.raw - a.growth.raw).slice(0, limit);
}
