'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp } from 'lucide-react';
import { calculateDailyImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';

interface DailyImpactSummaryProps {
  habits: HabitWithStats[];
}

export function DailyImpactSummary({ habits }: DailyImpactSummaryProps) {
  const t = useTranslations('impact');

  const { earned, total, isPerfect, hasImpact } = useMemo(() => {
    let totalHealth = 0;
    let totalCost = 0;
    let totalIncome = 0;
    let earnedHealth = 0;
    let earnedCost = 0;
    let earnedIncome = 0;

    for (const habit of habits) {
      if (habit.evidences.length === 0) continue;
      const daily = calculateDailyImpact(habit.evidences, getArticle);
      totalHealth += daily.healthMinutes;
      totalCost += daily.costSaving;
      totalIncome += daily.incomeGain;
      if (habit.completedToday) {
        earnedHealth += daily.healthMinutes;
        earnedCost += daily.costSaving;
        earnedIncome += daily.incomeGain;
      }
    }

    const hasImpactValue = totalHealth > 0 || totalCost > 0 || totalIncome > 0;
    const isPerfectValue = hasImpactValue &&
      earnedHealth === totalHealth &&
      earnedCost === totalCost &&
      earnedIncome === totalIncome;

    return {
      earned: { healthMinutes: earnedHealth, costSaving: earnedCost, incomeGain: earnedIncome },
      total: { healthMinutes: totalHealth, costSaving: totalCost, incomeGain: totalIncome },
      isPerfect: isPerfectValue,
      hasImpact: hasImpactValue,
    };
  }, [habits]);

  if (!hasImpact) return null;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 transition-all',
        isPerfect
          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30 animate-[perfectPulse_600ms_ease-out]'
          : 'border-border bg-card'
      )}
    >
      <p className={cn(
        'text-xs font-semibold',
        isPerfect ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
      )}>
        {isPerfect ? `🎉 ${t('perfect')}` : t('todayImpact')}
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1.5">
        {/* Health */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <HeartPulse className="size-3.5 text-[#3D8A5A]" />
            <span className="text-sm font-bold text-[#3D8A5A]">
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
            <Wallet className="size-3.5 text-[#3D8A5A]" />
            <span className="text-sm font-bold text-[#3D8A5A]">
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
            <TrendingUp className="size-3.5 text-[#3D8A5A]" />
            <span className="text-sm font-bold text-[#3D8A5A]">
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
      </div>
    </div>
  );
}
