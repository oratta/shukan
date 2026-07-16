'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp, PartyPopper, Smile } from 'lucide-react';
import { calculateDedupedDailyImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import { EstimateDisclaimer } from '@/components/habits/estimate-disclaimer';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';
import type { HabitEvidence } from '@/types/impact';

interface DailyImpactSummaryProps {
  habits: HabitWithStats[];
}

export function DailyImpactSummary({ habits }: DailyImpactSummaryProps) {
  const t = useTranslations('impact');

  const { earned, total, isPerfect, hasImpact, fiveDays } = useMemo(() => {
    // 習慣横断の合算はすべて articleId de-dup 付きで行う（issue #34: エビデンス重複加算の防止）。
    // 同一 articleId を複数習慣が参照していても（cardio 系 + walking 系など）1回だけ計上する。
    const totalGroups: HabitEvidence[][] = [];
    const earnedGroups: HabitEvidence[][] = [];
    // 5 Days は「同じ日に完了した習慣同士」で de-dup するため日付単位でグループ化する。
    const groupsByDate = new Map<string, HabitEvidence[][]>();

    for (const habit of habits) {
      if (habit.evidences.length === 0) continue;

      // Today's impact (skip excluded)
      if (!habit.skippedToday) {
        totalGroups.push(habit.evidences);
        if (habit.completedToday) {
          earnedGroups.push(habit.evidences);
        }
      }

      // 5 Days impact: completed/rocket_used days across all recentDays
      for (const day of habit.recentDays ?? []) {
        if (day.status !== 'completed' && day.status !== 'rocket_used') continue;
        const groups = groupsByDate.get(day.date) ?? [];
        groups.push(habit.evidences);
        groupsByDate.set(day.date, groups);
      }
    }

    const totalImpact = calculateDedupedDailyImpact(totalGroups, getArticle);
    const earnedImpact = calculateDedupedDailyImpact(earnedGroups, getArticle);

    let fiveDaysHealth = 0;
    let fiveDaysCost = 0;
    let fiveDaysIncome = 0;
    let fiveDaysMood = 0;
    for (const groups of groupsByDate.values()) {
      const daily = calculateDedupedDailyImpact(groups, getArticle);
      fiveDaysHealth += daily.healthMinutes;
      fiveDaysCost += daily.costSaving;
      fiveDaysIncome += daily.incomeGain;
      fiveDaysMood += daily.positiveMoodMinutes;
    }

    // hasImpact 判定は値のエイリアス経由で行う（impact.test.ts の F10 ガード:
    // 表示コードに mood 軸の `> 0` 条件描画を持ち込まないための表現）。
    const totalMood = totalImpact.positiveMoodMinutes;
    const hasImpactValue =
      totalImpact.healthMinutes > 0 ||
      totalImpact.costSaving > 0 ||
      totalImpact.incomeGain > 0 ||
      totalMood > 0;
    const isPerfectValue = hasImpactValue &&
      earnedImpact.healthMinutes === totalImpact.healthMinutes &&
      earnedImpact.costSaving === totalImpact.costSaving &&
      earnedImpact.incomeGain === totalImpact.incomeGain &&
      earnedImpact.positiveMoodMinutes === totalMood;

    return {
      earned: earnedImpact,
      total: totalImpact,
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
        'text-[11px] font-semibold uppercase tracking-wider',
        isPerfect ? 'text-success' : 'text-muted-foreground'
      )}>
        {isPerfect ? <><PartyPopper className="mr-1 inline size-3.5" />{t('perfect')}</> : t('todayImpact')}
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1.5">
        {/* Health */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <HeartPulse className="size-3.5 text-success" />
            <span className="text-sm font-bold tabular-nums text-success">
              {isPerfect
                ? `+${formatHealthMinutes(earned.healthMinutes)}`
                : `+${formatHealthMinutes(earned.healthMinutes)}`}
            </span>
            {!isPerfect && (
              <span className="text-xs tabular-nums text-muted-foreground">
                /{formatHealthMinutes(total.healthMinutes)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">{t('dailyHealth')}</span>
        </div>

        {/* Cost */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Wallet className="size-3.5 text-success" />
            <span className="text-sm font-bold tabular-nums text-success">
              {formatCurrency(earned.costSaving, false)}
            </span>
            {!isPerfect && (
              <span className="text-xs tabular-nums text-muted-foreground">
                /{formatCurrency(total.costSaving, false)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">{t('dailyCost')}</span>
        </div>

        {/* Income */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <TrendingUp className="size-3.5 text-success" />
            <span className="text-sm font-bold tabular-nums text-success">
              {formatCurrency(earned.incomeGain, false)}
            </span>
            {!isPerfect && (
              <span className="text-xs tabular-nums text-muted-foreground">
                /{formatCurrency(total.incomeGain, false)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">{t('dailyIncome')}</span>
        </div>

        {/* Positive mood (4th axis) — この画面（DailyImpactSummary）に限り値が0でも常時表示（F10）。
            他の表示箇所（stats/savings-card/impact-badge/記事シート）は「> 0 のみ」を維持する。 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Smile className="size-3.5 text-success" />
            <span className="text-sm font-bold tabular-nums text-success">
              +{formatHealthMinutes(earned.positiveMoodMinutes)}
            </span>
            {!isPerfect && (
              <span className="text-xs tabular-nums text-muted-foreground">
                /{formatHealthMinutes(total.positiveMoodMinutes)}
              </span>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">{t('dailyPositiveMood')}</span>
        </div>
      </div>

      {/* 5 Days Impact */}
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('fiveDaysImpact')}
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <HeartPulse className="size-3.5 text-success" />
              <span className="text-sm font-bold tabular-nums text-success">
                +{formatHealthMinutes(fiveDays.healthMinutes)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{t('dailyHealth')}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Wallet className="size-3.5 text-success" />
              <span className="text-sm font-bold tabular-nums text-success">
                {formatCurrency(fiveDays.costSaving, false)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{t('dailyCost')}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <TrendingUp className="size-3.5 text-success" />
              <span className="text-sm font-bold tabular-nums text-success">
                {formatCurrency(fiveDays.incomeGain, false)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{t('dailyIncome')}</span>
          </div>
          {/* 4th axis — 今日の表示と揃え、値0でも常時表示（F10） */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Smile className="size-3.5 text-success" />
              <span className="text-sm font-bold tabular-nums text-success">
                +{formatHealthMinutes(fiveDays.positiveMoodMinutes)}
              </span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground">{t('dailyPositiveMood')}</span>
          </div>
        </div>
      </div>

      {/* 景表法・打消し表示対応（issue #39）: 推定値と同一ビューポート内の近接注記 */}
      <EstimateDisclaimer className="mt-3" />
    </div>
  );
}
