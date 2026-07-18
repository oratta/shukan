'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TrendingUp, HeartPulse, Wallet, BarChart3, Smile } from 'lucide-react';
import { HabitIcon } from '@/components/ui/habit-icon';
import { useHabits } from '@/hooks/useHabits';
import { isDailyTrackedHabit } from '@/lib/habits';
import { calculateTotalSavings, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { EstimateDisclaimer } from '@/components/habits/estimate-disclaimer';
import { useReviewHistory } from '@/hooks/useReviewHistory';
import { ReviewCalendar } from '@/components/review/ReviewCalendar';
import { HelpButton } from '@/components/help/help-button';

export default function StatsPage() {
  const t = useTranslations();
  const { getStats, loading } = useHabits();
  const reviewHistory = useReviewHistory();

  const stats = useMemo(() => {
    const withStats = getStats();
    // 3場面構造: デイリー系指標（完了率・ストリーク）は active（デイリー追跡）習慣のみで集計する。
    // established（身についた）習慣は生涯効果表示専用のため、統計の分母・ストリークから除外する。
    const activeHabits = withStats.filter(isDailyTrackedHabit);

    const totalCurrentStreak = activeHabits.reduce(
      (sum, h) => sum + h.currentStreak,
      0
    );
    const avgCurrentStreak =
      activeHabits.length > 0
        ? Math.round(totalCurrentStreak / activeHabits.length)
        : 0;

    const longestStreak = Math.max(
      0,
      ...activeHabits.map((h) => h.longestStreak)
    );

    const avgCompletionRate =
      activeHabits.length > 0
        ? activeHabits.reduce((sum, h) => sum + h.completionRate, 0) /
          activeHabits.length
        : 0;

    const totalSavings = calculateTotalSavings(activeHabits);

    return {
      habits: activeHabits,
      avgCurrentStreak,
      longestStreak,
      avgCompletionRate,
      totalHabits: activeHabits.length,
      totalSavings,
    };
  }, [getStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (stats.totalHabits === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-[28px] font-bold leading-tight tracking-tight">
          {t('stats.title')}
        </h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="mb-4 size-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
        </div>
      </div>
    );
  }

  const completionPercent = Math.round(stats.avgCompletionRate * 100);
  const units = {
    min: t('impact.minuteUnit'),
    hour: t('impact.hourUnit'),
    day: t('impact.dayUnit'),
  };

  // 人生インパクト貯金（累積）。ホームの DailyImpactSummary と同じ言語で組む:
  // アイコン=success（積み上げの意味）/ 数値=インク（foreground）/ ラベル=muted。
  const savingsMetrics = [
    { icon: HeartPulse, label: t('impact.dailyHealth'), value: `+${formatHealthMinutes(stats.totalSavings.healthMinutes, units)}` },
    { icon: Wallet, label: t('impact.dailyCost'), value: formatCurrency(stats.totalSavings.costSaving) },
    { icon: TrendingUp, label: t('impact.dailyIncome'), value: formatCurrency(stats.totalSavings.incomeGain) },
  ];
  if (stats.totalSavings.positiveMoodMinutes > 0) {
    savingsMetrics.push({
      icon: Smile,
      label: t('impact.dailyPositiveMood'),
      value: `+${formatHealthMinutes(stats.totalSavings.positiveMoodMinutes, units)}`,
    });
  }

  const impactHabits = stats.habits.filter(
    (h) => h.impactSavings && h.impactSavings.completedDays > 0
  );

  return (
    <div className="space-y-6">
      {/* エッセンス③: 静的タイトル「統計」を一等地に置かず、動的な数値ヒーローを主役にする。
          統計はデータ画面なので、今月の達成率を画面最大タイポ（Geist Mono / tabular-nums）で出す。
          緑は達成＝意味にだけ載せ、単位・ラベルは無彩色。 */}
      <header>
        <div className="flex items-center gap-1">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {t('stats.completionRate')}（{t('stats.thisMonth')}）
          </p>
          <HelpButton topic="completionRate" className="size-4" iconClassName="size-3.5" />
        </div>
        <div className="mt-0.5 flex items-baseline leading-none">
          <span className="font-mono text-[72px] font-semibold leading-[0.85] tracking-tighter tabular-nums text-success">
            {completionPercent}
          </span>
          <span className="font-mono text-[40px] font-medium leading-none tracking-tight tabular-nums text-muted-foreground">
            %
          </span>
        </div>
        {/* 進捗バー: 緑＝達成（ポジティブ）の意味で使用 */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </header>

      {/* 連続日数: 巨大数値＋従属ラベルの2枠。ヘアライン罫線（gap-px + bg-border）で組む。
          連続＝積み上げの意味なので数値は success。旧・炎/トロフィーのハードコード色は撤去。 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
        <div className="flex flex-col gap-1.5 bg-card px-5 py-4">
          <span className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t('stats.currentStreak')}
            <HelpButton topic="streak" className="size-4" iconClassName="size-3.5" />
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[32px] font-semibold leading-none tabular-nums text-success">
              {stats.avgCurrentStreak}
            </span>
            <span className="text-sm text-muted-foreground">{t('stats.days')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 bg-card px-5 py-4">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t('stats.longestStreak')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[32px] font-semibold leading-none tabular-nums text-success">
              {stats.longestStreak}
            </span>
            <span className="text-sm text-muted-foreground">{t('stats.days')}</span>
          </div>
        </div>
      </div>

      {/* 習慣ごとの達成率・連続日数: 罫線区切りのリスト（divide-y）で端正に組む。
          旧・壊れた ProgressRing（0-1 を 0-100 リングに渡していた）と CHART_COLORS 直書きを撤去し、
          達成率は細い緑バーで示す（達成＝緑の規律）。行内の数値はインク。 */}
      <section>
        <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {t('stats.perHabit')}
        </h3>
        <div className="divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
          {stats.habits.map((habit) => {
            const pct = Math.round(habit.completionRate * 100);
            return (
              <div key={habit.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <HabitIcon name={habit.icon} size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{habit.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {habit.currentStreak}
                      {t('stats.days')}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
                    {pct}
                    <span className="ml-0.5 text-[13px] font-medium text-muted-foreground">%</span>
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 人生インパクト貯金（累積）: ホームの今日のインパクトと同じ言語。
          ヘアライン 2×N グリッド、アイコン=success、数値=インク、ラベル=muted。
          旧・全 amber 塗り（text-impact-cost を全軸に適用）を撤去。 */}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {t('impact.totalSavings')}
            <HelpButton topic="impactSavings" className="size-4" iconClassName="size-3.5" />
          </span>
          <span className="flex items-center gap-1 rounded-full bg-success px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-success-foreground">
            {t('impact.cumulative')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px border-y bg-border">
          {savingsMetrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-2 bg-card px-5 py-4">
              <div className="flex items-center gap-1.5">
                <m.icon className="size-3.5 text-success" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {m.label}
                </span>
              </div>
              <span className="font-mono text-[22px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
                {m.value}
              </span>
            </div>
          ))}
          {savingsMetrics.length % 2 === 1 && <div className="bg-card" />}
        </div>
        {/* 景表法・打消し表示対応（issue #39）: 累積推定値と同一ビューポート内の近接注記 */}
        <div className="px-5 py-3">
          <EstimateDisclaimer />
        </div>
      </section>

      {/* 習慣ごとの内訳（インパクト）: 罫線区切りのリスト。軸アイコンは muted、数値は mono インク。 */}
      {impactHabits.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {t('impact.perHabitBreakdown')}
          </h3>
          <div className="divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
            {impactHabits.map((habit) => (
              <div key={habit.id} className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <HabitIcon name={habit.icon} size={18} />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{habit.name}</p>
                </div>
                {/* 数値は自軸のアイコン（muted）＋ mono インクで。名前を潰さないよう次行に折り返す。 */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[26px] font-mono text-[11px] tabular-nums text-foreground">
                  <span className="flex items-center gap-1">
                    <HeartPulse className="size-3 text-muted-foreground" />
                    {formatHealthMinutes(habit.impactSavings!.healthMinutes, units)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="size-3 text-muted-foreground" />
                    {formatCurrency(habit.impactSavings!.costSaving)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="size-3 text-muted-foreground" />
                    {formatCurrency(habit.impactSavings!.incomeGain)}
                  </span>
                  {habit.impactSavings!.positiveMoodMinutes > 0 && (
                    <span className="flex items-center gap-1" aria-label={t('impact.dailyPositiveMood')}>
                      <Smile className="size-3 text-muted-foreground" />
                      {formatHealthMinutes(habit.impactSavings!.positiveMoodMinutes, units)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 振り返り履歴 */}
      <section>
        <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {t('reviewHistory.title')}
        </h3>
        <div className="rounded-xl border border-border bg-card p-4">
          <ReviewCalendar
            displayYear={reviewHistory.displayYear}
            displayMonth={reviewHistory.displayMonth}
            selectedDate={reviewHistory.selectedDate}
            reflections={reviewHistory.reflections}
            completions={reviewHistory.completions}
            isCurrentMonth={reviewHistory.isCurrentMonth}
            loading={reviewHistory.loading}
            onPrevMonth={reviewHistory.goToPrevMonth}
            onNextMonth={reviewHistory.goToNextMonth}
            onDateSelect={reviewHistory.selectDate}
          />
        </div>
      </section>
    </div>
  );
}
