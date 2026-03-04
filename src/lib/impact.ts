import type { HabitCompletion, HabitWithStats } from '@/types/habit';
import type { HabitEvidence, LifeImpactArticle, LifeImpactSavings } from '@/types/impact';

/**
 * 1日あたりのインパクト値（重み付き合計）
 */
export interface DailyImpact {
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
}

/**
 * 年間インパクト値
 */
export interface AnnualImpact {
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
}

const DAYS_PER_YEAR = 365;

/**
 * 日次インパクトを年間に変換
 */
export function calculateAnnualImpact(daily: DailyImpact): AnnualImpact {
  return {
    healthMinutes: daily.healthMinutes * DAYS_PER_YEAR,
    costSaving: daily.costSaving * DAYS_PER_YEAR,
    incomeGain: daily.incomeGain * DAYS_PER_YEAR,
  };
}

/**
 * 複数エビデンスの重み付き合計で日次インパクトを計算
 */
export function calculateDailyImpact(
  evidences: HabitEvidence[],
  getArticleFn: (id: HabitEvidence['articleId']) => LifeImpactArticle | undefined
): DailyImpact {
  let healthMinutes = 0;
  let costSaving = 0;
  let incomeGain = 0;
  for (const ev of evidences) {
    const article = getArticleFn(ev.articleId);
    if (!article) continue;
    const w = ev.weight / 100;
    healthMinutes += article.calculationParams.dailyHealthMinutes * w;
    costSaving += article.calculationParams.dailyCostSaving * w;
    incomeGain += article.calculationParams.dailyIncomeGain * w;
  }
  return { healthMinutes, costSaving, incomeGain };
}

/**
 * 1つの習慣のインパクト貯金を計算（multi-evidence対応）
 */
export function calculateImpactSavings(
  habitId: string,
  completions: HabitCompletion[],
  article: LifeImpactArticle
): LifeImpactSavings {
  const completedDays = completions.filter(
    (c) => c.habitId === habitId &&
           (c.status === 'completed' || c.status === 'rocket_used')
  ).length;

  return {
    completedDays,
    healthMinutes: completedDays * article.calculationParams.dailyHealthMinutes,
    costSaving: completedDays * article.calculationParams.dailyCostSaving,
    incomeGain: completedDays * article.calculationParams.dailyIncomeGain,
  };
}

/**
 * 複数エビデンスからインパクト貯金を計算
 */
export function calculateMultiEvidenceImpact(
  habitId: string,
  completions: HabitCompletion[],
  evidences: HabitEvidence[],
  getArticleFn: (id: HabitEvidence['articleId']) => LifeImpactArticle | undefined
): LifeImpactSavings {
  const completedDays = completions.filter(
    (c) => c.habitId === habitId &&
           (c.status === 'completed' || c.status === 'rocket_used')
  ).length;

  const daily = calculateDailyImpact(evidences, getArticleFn);
  return {
    completedDays,
    healthMinutes: completedDays * daily.healthMinutes,
    costSaving: completedDays * daily.costSaving,
    incomeGain: completedDays * daily.incomeGain,
  };
}

/**
 * 全習慣の合計インパクト貯金
 */
export function calculateTotalSavings(
  habits: HabitWithStats[]
): LifeImpactSavings {
  const initial: LifeImpactSavings = {
    completedDays: 0,
    healthMinutes: 0,
    costSaving: 0,
    incomeGain: 0,
  };
  return habits.reduce((total, habit) => {
    if (!habit.impactSavings) return total;
    return {
      completedDays: total.completedDays + habit.impactSavings.completedDays,
      healthMinutes: total.healthMinutes + habit.impactSavings.healthMinutes,
      costSaving: total.costSaving + habit.impactSavings.costSaving,
      incomeGain: total.incomeGain + habit.impactSavings.incomeGain,
    };
  }, initial);
}

/**
 * researchBody + inferences を結合して完成記事を生成
 */
export function renderArticle(article: LifeImpactArticle): string {
  const replacements: Record<string, string> = {
    health_inference: article.inferences.health,
    cost_inference: article.inferences.cost,
    income_inference: article.inferences.income,
    cumulative: article.inferences.cumulative,
  };

  return article.article.researchBody.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => replacements[key] ?? `{{${key}}}`
  );
}

export interface TimeUnits {
  min: string;
  hour: string;
  day: string;
}

/**
 * 分を人間が読める形式に変換
 */
export function formatHealthMinutes(
  totalMinutes: number,
  units: TimeUnits = { min: '分', hour: '時間', day: '日' }
): string {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded}${units.min}`;
  if (rounded < 1440) {
    const h = Math.floor(rounded / 60);
    const m = rounded % 60;
    if (m === 0) return `${h}${units.hour}`;
    return `${h}${units.hour}${m}${units.min}`;
  }
  const days = Math.floor(rounded / 1440);
  const hours = Math.floor((rounded % 1440) / 60);
  if (hours === 0) return `${days}${units.day}`;
  return `${days}${units.day}${hours}${units.hour}`;
}

/**
 * 金額をフォーマット（V2: JPYのみ）
 */
export function formatCurrency(amount: number, useMan = true): string {
  if (useMan && amount >= 100_000) return `¥${Math.floor(amount / 10000)}万`;
  if (useMan && amount >= 10_000) return `¥${(amount / 10000).toFixed(1)}万`;
  return `¥${Math.round(amount).toLocaleString()}`;
}
