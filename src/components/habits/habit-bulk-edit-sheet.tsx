'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MoreHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RESIST_CHOICES } from '@/components/habits/resist-choices';
import type { DayStatus, HabitWithStats } from '@/types/habit';

type SelectableStatus = 'completed' | 'failed' | 'skipped';

interface HabitBulkEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 行は habit.editablePastDays を描画する（週ドットと同一データで常に1:1。楽観更新にも追従） */
  habit: HabitWithStats | null;
  onSetDayStatus: (
    habitId: string,
    date: string,
    status: 'completed' | 'failed' | 'none' | 'skipped',
    opts?: { resistRate?: number }
  ) => void;
  /** 行末「…」→ その日1日分の既存アクションシート（メモ・我慢率の入れ直し等）へ */
  onOpenDayActions: (habitId: string, date: string) => void;
}

/**
 * 過去日の一括編集シート（issue #107 案1）。週ドット領域のタップで開き、
 * 編集可能枠（過去 EDITABLE_PAST_DAYS 日）の行を並べて「ポンポン」と連続入力できる。
 * ステータスボタンのタップでシートは閉じない。選択済みボタンの再タップは未入力に戻す。
 * quit の「失敗」は即 failed を記録してから行内の我慢率チップを開く
 * （チップを無視しても失敗は記録済み、という順序は1日分シートと同じ仕様）。
 */
export function HabitBulkEditSheet({
  open,
  onOpenChange,
  habit,
  onSetDayStatus,
  onOpenDayActions,
}: HabitBulkEditSheetProps) {
  const t = useTranslations('habits');
  const locale = useLocale();
  // 我慢率チップを展開中の行（quit の失敗タップ直後のみ）
  const [resistTargetDate, setResistTargetDate] = useState<string | null>(null);

  // 開くたびにチップ展開状態をリセットする（habit-action-sheet と同じ idiom）。
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset chip state when (re)opened
      setResistTargetDate(null);
    }
  }, [open]);

  const rows = habit?.editablePastDays ?? [];

  if (!habit) return null;

  const isQuit = habit.type === 'quit';
  const doneLabel = isQuit ? t('bulkEdit.doneQuit') : t('bulkEdit.done');

  const handleStatusTap = (day: DayStatus, tapped: SelectableStatus) => {
    const isActive =
      day.status === tapped ||
      (tapped === 'completed' && day.status === 'rocket_used');
    if (isActive) {
      // 選択済みボタンの再タップ = 未入力に戻す（トグル）
      onSetDayStatus(habit.id, day.date, 'none');
      if (resistTargetDate === day.date) setResistTargetDate(null);
      return;
    }
    onSetDayStatus(habit.id, day.date, tapped);
    if (tapped === 'failed' && isQuit) {
      setResistTargetDate(day.date);
    } else if (resistTargetDate === day.date) {
      setResistTargetDate(null);
    }
  };

  const handleResistChip = (date: string, rate: number) => {
    onSetDayStatus(habit.id, date, 'failed', { resistRate: rate });
    setResistTargetDate(null);
  };

  const statusButtons: {
    status: SelectableStatus;
    label: (day: DayStatus) => string;
    activeClass: string;
  }[] = [
    {
      status: 'completed',
      label: () => doneLabel,
      activeClass: 'border-success bg-success/10 text-success',
    },
    {
      status: 'failed',
      // 我慢率が入っている失敗日は「失敗 75%」のように確認できるようにする
      label: (day) =>
        day.status === 'failed' && day.resistRate !== undefined && day.resistRate > 0
          ? `${t('bulkEdit.failed')} ${day.resistRate}%`
          : t('bulkEdit.failed'),
      // v2: 失敗＝danger トークン（completed の success と対称）。hex 直書きを排除。
      activeClass: 'border-danger bg-danger/10 text-danger',
    },
    {
      status: 'skipped',
      label: () => t('skip'),
      // v2: スキップ＝無彩色（--skipped）。gray-* パレット直書きを排除。
      activeClass: 'border-skipped bg-skipped/15 text-muted-foreground',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-safe">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base">{habit.name}</SheetTitle>
          <SheetDescription>{t('bulkEdit.subtitle')}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2.5 p-4 pt-2">
          {rows.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('bulkEdit.noDays')}
            </p>
          )}
          {rows.map((day) => {
            const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(locale, {
              month: 'numeric',
              day: 'numeric',
              weekday: 'short',
            });
            return (
              <div key={day.date} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm text-muted-foreground">
                    {dateLabel}
                  </span>
                  <div className="flex min-w-0 flex-1 gap-1.5">
                    {statusButtons.map(({ status, label, activeClass }) => {
                      const isActive =
                        day.status === status ||
                        (status === 'completed' && day.status === 'rocket_used');
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusTap(day, status)}
                          className={cn(
                            'min-w-0 flex-1 truncate rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
                            isActive
                              ? activeClass
                              : 'border-muted-foreground/20 text-muted-foreground/70 hover:bg-secondary/60'
                          )}
                        >
                          {label(day)}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDayActions(habit.id, day.date)}
                    aria-label={t('bulkEdit.dayActions')}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>

                {/* quit の失敗タップ直後だけ、その行に我慢率チップを展開する */}
                {resistTargetDate === day.date && day.status === 'failed' && (
                  <div className="pl-[4.5rem] pr-11">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {t('actionSheet.resistPrompt')}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {RESIST_CHOICES.map(({ rate, key }) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleResistChip(day.date, rate)}
                          className="flex items-center justify-between rounded-lg bg-secondary px-2.5 py-2 text-left text-xs font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-secondary/80"
                        >
                          <span className="truncate">{t(`actionSheet.${key}`)}</span>
                          <span className="ml-1 shrink-0 text-[10px] text-muted-foreground">
                            {rate}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
