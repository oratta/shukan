'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp, PartyPopper, Smile } from 'lucide-react';
import { calculateDedupedDailyImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import { EstimateDisclaimer } from '@/components/habits/estimate-disclaimer';
import { ImpactKpiGrid } from '@/components/habits/impact-kpi-grid';
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

  // B案「静かな精密さ」: 新聞のデータ面のように、獲得値を Geist Mono の大きな tabular 数値で
  // 静かに堂々と見せる。緑は「獲得＝積み上げ（ポジティブ）」の意味だけに使い、分母・ラベルは中立。
  const todayMetrics = [
    { icon: HeartPulse, label: t('dailyHealth'), value: `+${formatHealthMinutes(earned.healthMinutes)}`, sub: `/ ${formatHealthMinutes(total.healthMinutes)}` },
    { icon: Wallet, label: t('dailyCost'), value: formatCurrency(earned.costSaving, false), sub: `/ ${formatCurrency(total.costSaving, false)}` },
    { icon: TrendingUp, label: t('dailyIncome'), value: formatCurrency(earned.incomeGain, false), sub: `/ ${formatCurrency(total.incomeGain, false)}` },
    { icon: Smile, label: t('dailyPositiveMood'), value: `+${formatHealthMinutes(earned.positiveMoodMinutes)}`, sub: `/ ${formatHealthMinutes(total.positiveMoodMinutes)}` },
  ];

  const fiveDaysMetrics = [
    { icon: HeartPulse, label: t('dailyHealth'), value: `+${formatHealthMinutes(fiveDays.healthMinutes)}` },
    { icon: Wallet, label: t('dailyCost'), value: formatCurrency(fiveDays.costSaving, false) },
    { icon: TrendingUp, label: t('dailyIncome'), value: formatCurrency(fiveDays.incomeGain, false) },
    { icon: Smile, label: t('dailyPositiveMood'), value: `+${formatHealthMinutes(fiveDays.positiveMoodMinutes)}` },
  ];

  return (
    <section
      className={cn(
        // エッセンス⑤: 影で写真に対抗しない。--elev-2 を外し、罫線＋余白＋タイポ差だけで
        // 階層を作る（Airbnb 方式）。写真バナーの島より一段「静か」な面にする。
        'quiet-rise overflow-hidden rounded-xl border bg-card',
        isPerfect && 'border-success/40 animate-[perfectPulse_600ms_ease-out]'
      )}
    >
      {/* ヘッダー: mono の細いトラッキングでラベルを組む。達成時は右に success バッジ。 */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {t('todayImpact')}
        </span>
        {isPerfect && (
          <span className="flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-success">
            <PartyPopper className="size-3.5" />
            {t('perfect')}
          </span>
        )}
      </div>

      {/* 今日のインパクト: 2×2 のヘアライン罫線グリッド（ImpactKpiGrid 共通部品）。
          border-y でヘッダー／5日間セクションと挟む。習慣詳細ビューと同じ構造を共有する。 */}
      <ImpactKpiGrid metrics={todayMetrics} accent={isPerfect} className="border-y" />

      {/* 5日間のインパクト: 二次情報。ラベル左・数値右の罫線区切り行リストで、
          長い日本語の値（+13時間12分 等）も折り返さず端正に組む。 */}
      <div className="px-5 py-4">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t('fiveDaysImpact')}
        </span>
        <div className="mt-2 divide-y divide-border/60">
          {fiveDaysMetrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <m.icon className="size-3 shrink-0" />
                {m.label}
              </span>
              <span className="font-mono text-[13px] font-medium tabular-nums text-foreground">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 景表法・打消し表示対応（issue #39）: 推定値と同一ビューポート内の近接注記 */}
      <div className="border-t px-5 py-3">
        <EstimateDisclaimer />
      </div>
    </section>
  );
}
