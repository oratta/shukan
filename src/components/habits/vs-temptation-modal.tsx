'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Check, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/types/habit';

interface VsTemptationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats | null;
  onStartFlow: () => Promise<{ id: string }>;
  onCompleteStep: (logId: string, stepId: string, allDone: boolean) => void;
  onFailed?: () => void;
}

export function VsTemptationModal({
  open,
  onOpenChange,
  habit,
  onStartFlow,
  onCompleteStep,
  onFailed,
}: VsTemptationModalProps) {
  const t = useTranslations('habits');
  const [logId, setLogId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const initializedRef = useRef(false);

  const steps = habit?.copingSteps ?? [];
  const todayCount = habit?.todayUrgeCount ?? 0;
  const dailyTarget = habit?.dailyTarget ?? 1;

  useEffect(() => {
    if (open && !initializedRef.current) {
      initializedRef.current = true;
      setCheckedSteps(new Set());
      setLogId(null);
      setShowSuccess(false);
      onStartFlow().then((log) => setLogId(log.id));
    }
    if (!open) {
      initializedRef.current = false;
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeWithSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      onOpenChange(false);
    }, 1200);
  }, [onOpenChange]);

  const handleCheck = useCallback(
    (stepId: string) => {
      if (!logId || checkedSteps.has(stepId)) return;

      const next = new Set(checkedSteps);
      next.add(stepId);
      setCheckedSteps(next);

      const isAllDone = next.size === steps.length;
      onCompleteStep(logId, stepId, isAllDone);

      if (isAllDone) {
        closeWithSuccess();
      }
    },
    [logId, checkedSteps, steps.length, onCompleteStep, closeWithSuccess]
  );

  const handleResisted = useCallback(() => {
    if (logId) {
      const unchecked = steps.filter((s) => !checkedSteps.has(s.id));
      for (const step of unchecked) {
        onCompleteStep(logId, step.id, step === unchecked[unchecked.length - 1]);
      }
    }
    closeWithSuccess();
  }, [logId, steps, checkedSteps, onCompleteStep, closeWithSuccess]);

  if (!habit) return null;

  const progressCurrent = todayCount + (showSuccess ? 1 : 0);
  const progressPercent = Math.min((progressCurrent / dailyTarget) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">{t('vsTemptation')}</DialogTitle>
        {showSuccess ? (
          <div className="flex flex-col items-center gap-3 py-12 animate-in zoom-in-75 duration-300">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
              <Trophy className="size-8 text-success" />
            </div>
            <p className="text-lg font-bold text-success">
              {t('iResisted')}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#D89575]/15">
                  <Shield className="size-5 text-[#D89575]" />
                </div>
                <span className="text-xl font-bold">{t('vsTemptation')}</span>
              </div>
            </div>

            {/* Habit name subtitle */}
            <p className="px-5 pb-3 text-sm text-muted-foreground">
              {habit.name}
            </p>

            {/* Progress section */}
            <div className="mx-5 mb-4 rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-success">
                  {t('todayResisted', {
                    current: progressCurrent,
                    target: dailyTarget,
                  })}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="mx-5 mb-4 overflow-hidden rounded-lg border">
              {steps.map((step, i) => {
                const checked = checkedSteps.has(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleCheck(step.id)}
                    disabled={checked}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors',
                      i > 0 && 'border-t',
                      checked
                        ? 'bg-green-50/60 dark:bg-green-950/20'
                        : 'hover:bg-accent'
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded',
                        checked
                          ? 'bg-success text-success-foreground'
                          : 'border-2 border-muted-foreground/30'
                      )}
                    >
                      {checked && <Check className="size-3.5" />}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        checked
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* "I Resisted!" button */}
            <div className="px-5 pb-3">
              <button
                type="button"
                onClick={handleResisted}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-success font-semibold text-success-foreground transition-colors hover:bg-success/90 active:bg-success/80"
              >
                <Shield className="size-5" />
                {t('iResisted')}
              </button>
            </div>

            {/* "I gave in..." button */}
            <div className="px-5 pb-1">
              <button
                type="button"
                onClick={() => {
                  onFailed?.();
                  onOpenChange(false);
                }}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('iGaveIn')}
              </button>
            </div>

            {/* Hint text */}
            <p className="px-5 pb-5 text-center text-xs text-muted-foreground">
              {t('vsHint')}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
