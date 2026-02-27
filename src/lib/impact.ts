import type { HabitCompletion, HabitWithStats } from '@/types/habit';
import type { LifeImpactArticle, LifeImpactSavings } from '@/types/impact';

/**
 * 1つの習慣のインパクト貯金を計算
 * completions数（達成日数）× 1日あたりの値
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
