'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/habits/progress-ring';
import { useHabits } from '@/hooks/useHabits';
import { getHabitsWithStats } from '@/lib/habits';

export default function StatsPage() {
  const t = useTranslations();
  const { habits, completions, loading } = useHabits();

  const stats = useMemo(() => {
    const withStats = getHabitsWithStats(habits, completions);
    const activeHabits = withStats.filter((h) => !h.archived);

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

    return {
      habits: activeHabits,
      avgCurrentStreak,
      longestStreak,
      avgCompletionRate,
      totalHabits: activeHabits.length,
    };
  }, [habits, completions]);

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
        <h2 className="text-2xl font-bold tracking-tight">
          {t('stats.title')}
        </h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('stats.title')}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center gap-2 p-4 text-center">
          <Flame className="size-5 text-orange-500" />
          <div className="text-2xl font-bold">{stats.avgCurrentStreak}</div>
          <div className="text-xs text-muted-foreground">
            {t('stats.currentStreak')}
          </div>
        </Card>

        <Card className="flex flex-col items-center gap-2 p-4 text-center">
          <Trophy className="size-5 text-yellow-500" />
          <div className="text-2xl font-bold">{stats.longestStreak}</div>
          <div className="text-xs text-muted-foreground">
            {t('stats.longestStreak')}
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-4 p-4">
        <ProgressRing
          progress={stats.avgCompletionRate}
          size={64}
          strokeWidth={5}
          color="oklch(0.6 0.18 145)"
        />
        <div>
          <div className="text-lg font-bold">
            {Math.round(stats.avgCompletionRate * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">
            {t('stats.completionRate')} ({t('stats.thisMonth')})
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Per Habit
        </h3>
        <div className="space-y-2">
          {stats.habits.map((habit) => (
            <Card
              key={habit.id}
              className="flex items-center gap-3 p-3"
            >
              <span className="text-xl">{habit.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{habit.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="size-3 text-orange-400" />
                    {habit.currentStreak} {t('stats.days')}
                  </span>
                  <span>
                    <TrendingUp className="mr-1 inline size-3" />
                    {Math.round(habit.completionRate * 100)}%
                  </span>
                </div>
              </div>
              <ProgressRing
                progress={habit.completionRate}
                size={40}
                strokeWidth={3}
                color={habit.color || 'oklch(0.6 0.2 260)'}
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
