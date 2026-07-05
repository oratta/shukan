'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp, PartyPopper, Smile } from 'lucide-react';
import { calculateDailyImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';

interface DailyImpactSummaryProps {
  habits: HabitWithStats[];
}

export function DailyImpactSummary({ habits }: DailyImpactSummaryProps) {
  const t = useTranslations('impact');

  const { earned, total, isPerfect, hasImpact, fiveDays } = useMemo(() => {
    let totalHealth = 0;
    let totalCost = 0;
    let totalIncome = 0;
    let totalMood = 0;
    let earnedHealth = 0;
    let earnedCost = 0;
    let earnedIncome = 0;
    let earnedMood = 0;
    let fiveDaysHealth = 0;
    let fiveDaysCost = 0;
    let fiveDaysIncome = 0;
    let fiveDaysMood = 0;

    for (const habit of habits) {
      if (habit.evidences.length === 0) continue;
      const daily = calculateDailyImpact(habit.evidences, getArticle);

      // Today's impact (skip excluded)
      if (!habit.skippedToday) {
        totalHealth += daily.healthMinutes;
        totalCost += daily.costSaving;
        totalIncome += daily.incomeGain;
        totalMood += daily.positiveMoodMinutes;
        if (habit.completedToday) {
          earnedHealth += daily.healthMinutes;
          earnedCost += daily.costSaving;
          earnedIncome += daily.incomeGain;
          earnedMood += daily.positiveMoodMinutes;
        }
      }

      // 5 Days impact: count completed/rocket_used days across all recentDays
      const completedDays = (habit.recentDays ?? []).filter(
        (d) => d.status === 'completed' || d.status === 'rocket_used'
      ).length;
      fiveDaysHealth += daily.healthMinutes * completedDays;
      fiveDaysCost += daily.costSaving * completedDays;
      fiveDaysIncome += daily.incomeGain * completedDays;
      fiveDaysMood += daily.positiveMoodMinutes * completedDays;
    }

    const hasImpactValue = totalHealth > 0 || totalCost > 0 || totalIncome > 0 || totalMood > 0;
    const isPerfectValue = hasImpactValue &&
      earnedHealth === totalHealth &&
      earnedCost === totalCost &&
      earnedIncome === totalIncome &&
      earnedMood === totalMood;

    return {
      earned: { healthMinutes: earnedHealth, costSaving: earnedCost, incomeGain: earnedIncome, positiveMoodMinutes: earnedMood },
      total: { healthMinutes: totalHealth, costSaving: totalCost, incomeGain: totalIncome, positiveMoodMinutes: totalMood },
      isPerfect: isPerfectValue,
      hasImpact: hasImpactValue,
      fiveDays: { healthMinutes: fiveDaysHealth, costSaving: fiveDaysCost, incomeGain: fiveDaysIncome, positiveMoodMinutes: fiveDaysMood },
    };
  }, [habits]);

  if (!hasImpact) return null;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 transition-all',
        isPerfect
          ? 'border-success/40 bg-success/10 animate-[perfectPulse_600ms_ease-out]'
          : 'border-border bg-card'
      )}
    >
      <p className={cn(
        'text-xs font-semibold',
        isPerfect ? 'text-success' : 'text-muted-foreground'
      )}>
        {isPerfect ? <><PartyPopper className="mr-1 inline size-3.5" />{t('perfect')}</> : t('todayImpact')}
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1.5">
        {/* Health */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <HeartPulse className="size-3.5 text-success" />
            <span className="text-sm font-bold text-success">
              {isPerfect
                ? `+${formatHealthMinutes(earned.healthMinutes)}`
                : `+${formatHealthMinutes(earned.healthMinutes)}`}
            </span>
            {!isPerfect && (
              <span className="text-xs text-muted-foreground">
                /{formatHealthMinutes(total.healthMinutes)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyHealth')}</span>
        </div>

        {/* Cost */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Wallet className="size-3.5 text-success" />
            <span className="text-sm font-bold text-success">
              {formatCurrency(earned.costSaving, false)}
            </span>
            {!isPerfect && (
              <span className="text-xs text-muted-foreground">
                /{formatCurrency(total.costSaving, false)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyCost')}</span>
        </div>

        {/* Income */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <TrendingUp className="size-3.5 text-success" />
            <span className="text-sm font-bold text-success">
              {formatCurrency(earned.incomeGain, false)}
            </span>
            {!isPerfect && (
              <span className="text-xs text-muted-foreground">
                /{formatCurrency(total.incomeGain, false)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyIncome')}</span>
        </div>

        {/* Positive mood (4th axis) — この画面（DailyImpactSummary）に限り値が0でも常時表示（F10）。
            他の表示箇所（stats/savings-card/impact-badge/記事シート）は「> 0 のみ」を維持する。 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Smile className="size-3.5 text-success" />
            <span className="text-sm font-bold text-success">
              +{formatHealthMinutes(earned.positiveMoodMinutes)}
            </span>
            {!isPerfect && (
              <span className="text-xs text-muted-foreground">
                /{formatHealthMinutes(total.positiveMoodMinutes)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyPositiveMood')}</span>
        </div>
      </div>

      {/* 5 Days Impact */}
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs font-semibold text-muted-foreground">
          {t('fiveDaysImpact')}
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <HeartPulse className="size-3.5 text-success" />
              <span className="text-sm font-bold text-success">
                +{formatHealthMinutes(fiveDays.healthMinutes)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyHealth')}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Wallet className="size-3.5 text-success" />
              <span className="text-sm font-bold text-success">
                {formatCurrency(fiveDays.costSaving, false)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyCost')}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <TrendingUp className="size-3.5 text-success" />
              <span className="text-sm font-bold text-success">
                {formatCurrency(fiveDays.incomeGain, false)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyIncome')}</span>
          </div>
          {/* 4th axis — 今日の表示と揃え、値0でも常時表示（F10） */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Smile className="size-3.5 text-success" />
              <span className="text-sm font-bold text-success">
                +{formatHealthMinutes(fiveDays.positiveMoodMinutes)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-[#9C9B99]">{t('dailyPositiveMood')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
