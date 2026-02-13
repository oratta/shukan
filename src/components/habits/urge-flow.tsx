'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Flame } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HabitWithStats, UrgeLog } from '@/types/habit';

interface UrgeFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats;
  onStartFlow: () => Promise<UrgeLog>;
  onCompleteStep: (
    logId: string,
    stepId: string,
    allDone: boolean
  ) => Promise<void>;
}

export function UrgeFlow({
  open,
  onOpenChange,
  habit,
  onStartFlow,
  onCompleteStep,
}: UrgeFlowProps) {
  const t = useTranslations('habits');
  const [currentLog, setCurrentLog] = useState<UrgeLog | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [allDone, setAllDone] = useState(false);
  const [dailyDone, setDailyDone] = useState(false);

  const steps = habit.copingSteps ?? [];
  const todayCount = habit.todayUrgeCount ?? 0;
  const initializedRef = useRef(false);

  useEffect(() => {
    if (open && !initializedRef.current) {
      initializedRef.current = true;
      setCheckedSteps(new Set());
      setAllDone(false);
      setDailyDone(false);
      onStartFlow().then((log) => setCurrentLog(log));
    }
    if (!open) {
      initializedRef.current = false;
      setCurrentLog(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck = async (stepId: string) => {
    if (!currentLog || checkedSteps.has(stepId)) return;

    const next = new Set(checkedSteps);
    next.add(stepId);
    setCheckedSteps(next);

    const isAllDone = next.size === steps.length;
    await onCompleteStep(currentLog.id, stepId, isAllDone);

    if (isAllDone) {
      setAllDone(true);
      const newCount = todayCount + 1;
      if (newCount >= habit.dailyTarget) {
        setDailyDone(true);
      }
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-orange-500" />
            <SheetTitle>{habit.name}</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">{t('urgeFlow')}</p>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 py-4">
          {allDone ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="size-16 text-green-500 animate-in zoom-in-50 duration-300" />
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {t('urgeComplete')}
              </p>
              {dailyDone && (
                <p className="text-sm font-medium text-green-500">
                  {t('urgeDailyDone')}
                </p>
              )}
            </div>
          ) : (
            steps.map((step) => {
              const checked = checkedSteps.has(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleCheck(step.id)}
                  disabled={checked}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                    checked
                      ? 'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20'
                      : 'hover:bg-accent'
                  )}
                >
                  <Checkbox checked={checked} tabIndex={-1} />
                  <span
                    className={cn(
                      'text-sm',
                      checked &&
                        'line-through text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <SheetFooter>
          <Badge variant="secondary" className="mx-auto">
            {t('urgeProgress', {
              current: todayCount + (allDone ? 1 : 0),
              target: habit.dailyTarget,
            })}
          </Badge>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
