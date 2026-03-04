'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Shield, Maximize2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
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
}

function nextStatus(current: DayStatus['status']): 'completed' | 'failed' | 'none' {
  if (current === 'none') return 'completed';
  if (current === 'completed' || current === 'rocket_used') return 'failed';
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
        (status === 'completed' || status === 'rocket_used') && 'bg-[#3D8A5A]',
        status === 'failed' && 'bg-[#D08068]',
        status === 'none' && 'border border-gray-300 bg-transparent',
      )}
    />
  );
}

const CELEBRATION_PARTICLES = ['🎉', '✨', '🎊', '⭐', '💫', '🌟'];

function CelebrationEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {CELEBRATION_PARTICLES.map((emoji, i) => {
        const angle = (i / CELEBRATION_PARTICLES.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * 28;
        const ty = Math.sin(rad) * 28;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm animate-[celebration_600ms_ease-out_forwards]"
            style={{
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          >
            {emoji}
          </span>
        );
      })}
    </div>
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
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const todayStatus = habit.recentDays?.[0]?.status ?? 'none';

  useEffect(() => {
    if (
      prevStatusRef.current !== null &&
      prevStatusRef.current !== 'completed' &&
      prevStatusRef.current !== 'rocket_used' &&
      (todayStatus === 'completed' || todayStatus === 'rocket_used')
    ) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 700);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = todayStatus;
  }, [todayStatus]);

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
  return (
    <div className="relative flex size-8 shrink-0 items-center justify-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTapToday?.();
        }}
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full transition-all',
          (todayStatus === 'completed' || todayStatus === 'rocket_used') && 'bg-[#3D8A5A]',
          todayStatus === 'failed' && 'bg-[#D08068]',
          todayStatus === 'none' && 'border-2 border-gray-300',
        )}
      >
        {(todayStatus === 'completed' || todayStatus === 'rocket_used') && (
          <Check className="size-4 text-white" strokeWidth={3} />
        )}
      </button>
      {showCelebration && <CelebrationEffect />}
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
}: HabitCardProps) {
  const t = useTranslations('habits');
  const tStats = useTranslations('stats');
  const isQuit = habit.type === 'quit';
  const today = getTodayString();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDotTap = (day: DayStatus) => {
    onDayStatusChange(habit.id, day.date, nextStatus(day.status));
  };

  const streakPercent = Math.min(Math.round((habit.currentStreak / 30) * 100), 100);

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-50 opacity-80')}>
    <Card className="gap-0 py-0 overflow-hidden transition-all duration-200">
      {/* Collapsed row - always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(habit.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleExpand(habit.id); }}
        className="flex cursor-pointer items-center gap-3 p-3 w-full text-left"
      >
        {/* Drag handle */}
        <button
          type="button"
          className="touch-none shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

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
            {habit.evidences.length > 0 && (
              <ImpactBadge evidences={habit.evidences} mode="daily" />
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

            {/* Detail button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(habit.id);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3D8A5A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#346F4B]"
            >
              <Maximize2 className="size-4" />
              {t('detail')}
            </button>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}
