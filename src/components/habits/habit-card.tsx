'use client';

import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Shield, Rocket, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
import { getArticle } from '@/data/impact-articles';
import { ImpactBadge } from '@/components/habits/impact-badge';
import { SavingsCard } from '@/components/habits/savings-card';
import type { DayStatus, HabitWithStats } from '@/types/habit';

interface HabitCardProps {
  habit: HabitWithStats;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
  onActions: (id: string) => void;
  onOpenArticle: (id: string) => void;
}

function nextStatus(current: 'completed' | 'failed' | 'none'): 'completed' | 'failed' | 'none' {
  if (current === 'none') return 'completed';
  if (current === 'completed') return 'failed';
  return 'none';
}

function DayStatusDot({
  day,
  onTap,
}: {
  day: DayStatus;
  onTap: () => void;
}) {
  const { status } = day;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className={cn(
        'flex items-center justify-center rounded-full size-3 transition-all',
        status === 'completed' && 'bg-[#3D8A5A]',
        status === 'failed' && 'bg-[#D08068]',
        status === 'none' && 'border border-gray-300 bg-transparent',
      )}
    />
  );
}

function StatusIndicator({
  habit,
  onTapToday,
}: {
  habit: HabitWithStats;
  onTapToday?: () => void;
}) {
  const isQuit = habit.type === 'quit';

  // Quit habits: show urge progress ring (not tappable for status toggle)
  if (isQuit) {
    const current = habit.todayUrgeCount ?? 0;
    const target = habit.dailyTarget;
    const progress = target > 0 ? current / target : 0;
    const radius = 13;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

    return (
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
          <circle
            cx="16" cy="16" r={radius}
            fill="none" stroke="#E5E7EB" strokeWidth="2.5"
          />
          <circle
            cx="16" cy="16" r={radius}
            fill="none" stroke="#D08068" strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-[#D08068]">
          {current}/{target}
        </span>
      </div>
    );
  }

  // Positive habits: tappable circle that toggles today's status
  const todayStatus = habit.recentDays?.[0]?.status ?? 'none';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTapToday?.();
      }}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full transition-all',
        todayStatus === 'completed' && 'bg-[#3D8A5A]',
        todayStatus === 'failed' && 'bg-[#D08068]',
        todayStatus === 'none' && 'border-2 border-gray-300',
      )}
    >
      {todayStatus === 'completed' && (
        <Check className="size-4 text-white" strokeWidth={3} />
      )}
    </button>
  );
}

export function HabitCard({
  habit,
  isExpanded,
  onToggleExpand,
  onDayStatusChange,
  onOpenDetail,
  onOpenVsTemptation,
  onActions,
  onOpenArticle,
}: HabitCardProps) {
  const t = useTranslations('habits');
  const tStats = useTranslations('stats');
  const tImpact = useTranslations('impact');
  const isQuit = habit.type === 'quit';
  const today = getTodayString();
  const article = habit.impactArticleId ? getArticle(habit.impactArticleId) : undefined;

  const handleDotTap = (day: DayStatus) => {
    onDayStatusChange(habit.id, day.date, nextStatus(day.status));
  };

  const streakPercent = Math.min(Math.round((habit.currentStreak / 30) * 100), 100);

  return (
    <Card className="gap-0 py-0 overflow-hidden transition-all duration-200">
      {/* Collapsed row - always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(habit.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleExpand(habit.id); }}
        className="flex cursor-pointer items-center gap-3 p-3 w-full text-left"
      >
        {/* Left: Status indicator (tappable for today's toggle) */}
        <StatusIndicator
          habit={habit}
          onTapToday={() => {
            const todayDay = (habit.recentDays ?? [])[0];
            if (todayDay) handleDotTap(todayDay);
          }}
        />

        {/* Center: Name + past day dots */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[15px] font-medium truncate">
            {habit.name}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Past days only (skip index 0 = today), left=yesterday, right=oldest */}
            {(habit.recentDays ?? []).slice(1).map((day) => (
              <DayStatusDot
                key={day.date}
                day={day}
                onTap={() => handleDotTap(day)}
              />
            ))}
          </div>
        </div>

        {/* VS button for quit habits */}
        {isQuit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenVsTemptation(habit.id);
            }}
            className="flex items-center gap-1 rounded-full bg-[#D08068] px-2.5 py-1 text-white text-xs font-semibold shrink-0"
          >
            <Shield className="size-3" />
            VS
          </button>
        )}

        {/* Right: Chevron */}
        <div className="shrink-0 text-gray-400">
          {isExpanded ? (
            <ChevronUp className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </div>
      </div>

      {/* Expanded body - smooth height transition via grid trick */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-0 space-y-3">
            {/* Life Significance */}
            {habit.lifeSignificance && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">
                  {t('lifeSignificance')}
                </p>
                <p className="text-sm text-foreground/80">
                  {habit.lifeSignificance}
                </p>
              </div>
            )}

            {/* Impact Badge */}
            {article && (
              <ImpactBadge
                article={article}
                onTap={() => onOpenArticle(habit.id)}
              />
            )}

            {/* Streak card */}
            <div className="rounded-lg bg-[#C8F0D8] p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#3D8A5A]">
                  {habit.currentStreak}
                </span>
                <span className="text-sm text-[#3D8A5A]/70">
                  {tStats('days')}
                </span>
                <span className="ml-auto text-xs text-[#3D8A5A]/60">
                  {t('streakGoal', { percent: streakPercent })}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#3D8A5A] transition-all duration-300"
                  style={{ width: `${streakPercent}%` }}
                />
              </div>
            </div>

            {/* Savings Card */}
            {habit.impactSavings && (
              <SavingsCard savings={habit.impactSavings} />
            )}

            {/* Button row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onActions(habit.id);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  habit.rockets > 0
                    ? 'bg-[#D08068] text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                )}
              >
                <Rocket className="size-4" />
                {habit.rockets}
              </button>
              {article && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenArticle(habit.id);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#B8860B]/10 px-3 py-2 text-sm font-medium text-[#B8860B] transition-colors hover:bg-[#B8860B]/20"
                >
                  {tImpact('readArticle')}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(habit.id);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[#3D8A5A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#346F4B]"
              >
                <Maximize2 className="size-4" />
                {t('detail')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
