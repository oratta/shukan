'use client';

import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Shield, Rocket, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
import type { DayStatus, HabitWithStats } from '@/types/habit';

interface HabitCardProps {
  habit: HabitWithStats;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
  onActions: (id: string) => void;
}

function nextStatus(current: 'completed' | 'failed' | 'none'): 'completed' | 'failed' | 'none' {
  if (current === 'none') return 'completed';
  if (current === 'completed') return 'failed';
  return 'none';
}

function DayStatusDot({
  day,
  isToday,
  onTap,
}: {
  day: DayStatus;
  isToday: boolean;
  onTap: () => void;
}) {
  const status = day.status as string;

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
        status === 'rocket_used' && 'bg-[#C8F0D8]',
        status === 'none' && 'border border-gray-300 bg-transparent',
        isToday && 'ring-2 ring-offset-1 ring-offset-background ring-[#3D8A5A]/40',
      )}
    />
  );
}

function StatusIndicator({ habit }: { habit: HabitWithStats }) {
  const isQuit = habit.type === 'quit';

  if (habit.completedToday && !isQuit) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#3D8A5A]">
        <Check className="size-4 text-white" strokeWidth={3} />
      </div>
    );
  }

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

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
      <span className="sr-only">pending</span>
    </div>
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
}: HabitCardProps) {
  const t = useTranslations('habits');
  const tStats = useTranslations('stats');
  const isQuit = habit.type === 'quit';
  const today = getTodayString();

  const handleDotTap = (day: DayStatus) => {
    onDayStatusChange(habit.id, day.date, nextStatus(day.status));
  };

  const streakPercent = Math.min(Math.round((habit.currentStreak / 30) * 100), 100);

  return (
    <Card className="gap-0 py-0 overflow-hidden transition-all duration-200">
      {/* Collapsed row - always visible */}
      <button
        type="button"
        onClick={() => onToggleExpand(habit.id)}
        className="flex items-center gap-3 p-3 w-full text-left"
      >
        {/* Left: Status indicator */}
        <StatusIndicator habit={habit} />

        {/* Center: Name + dots (vertical stack) */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[15px] font-medium truncate">
            {habit.name}
          </span>
          <div className="flex items-center gap-1.5">
            {(habit.recentDays ?? []).map((day) => (
              <DayStatusDot
                key={day.date}
                day={day}
                isToday={day.date === today}
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
      </button>

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
