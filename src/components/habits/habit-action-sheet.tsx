'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, XCircle, SkipForward, Undo2, StickyNote, Eraser } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
import type { HabitWithStats } from '@/types/habit';

/** 我慢率4択チップ（issue #104）。0-100 の int で保存し、刻みは表示側の都合でしかない。 */
const RESIST_CHOICES = [
  { rate: 0, key: 'resist0' },
  { rate: 25, key: 'resist25' },
  { rate: 50, key: 'resist50' },
  { rate: 75, key: 'resist75' },
] as const;

interface HabitActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: HabitWithStats | null;
  /** 対象日（YYYY-MM-DD）。今日だけでなく週ドット長押しの過去日も来る。 */
  date: string | null;
  /** 対象日の現在ステータス（スキップ⇔解除の出し分けに使う） */
  currentStatus: 'completed' | 'failed' | 'none' | 'rocket_used' | 'skipped';
  /** 対象日の既存メモ（プリフィル用） */
  currentNote: string;
  onSetStatus: (
    status: 'completed' | 'failed' | 'none' | 'skipped',
    opts?: { resistRate?: number }
  ) => void;
  onSaveNote: (note: string) => void;
}

/**
 * 共通アクションシート（issue #104）。今日はステータスボタンの長押し、
 * 過去日は週ドットのタップで開く（案A: 小ターゲットに精密操作を要求せず、
 * 達成/失敗/スキップ/メモをシート内の大きなボタンで完結させる）。
 * quit の「失敗した」は即 failed を記録してから我慢率チップに切り替える
 * （チップを無視して閉じても失敗は記録済み、という順序が仕様）。
 */
export function HabitActionSheet({
  open,
  onOpenChange,
  habit,
  date,
  currentStatus,
  currentNote,
  onSetStatus,
  onSaveNote,
}: HabitActionSheetProps) {
  const t = useTranslations('habits');
  const locale = useLocale();
  const [view, setView] = useState<'menu' | 'resist' | 'memo'>('menu');
  const [noteDraft, setNoteDraft] = useState('');

  // 開くたびにメニューへリセットし、メモは対象日の既存値をプリフィルする。
  // prop 変化時に意図的に state へリセットするパターンのため同期 setState が必要（habit-form と同じ idiom）。
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset sheet view when (re)opened
      setView('menu');
      setNoteDraft(currentNote);
    }
  }, [open, currentNote]);

  if (!habit || !date) return null;

  const isQuit = habit.type === 'quit';
  const isSkippedDay = currentStatus === 'skipped';
  const isToday = date === getTodayString();
  const dateLabel = isToday
    ? t('actionSheet.today')
    : new Date(date + 'T00:00:00').toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });

  const handleFailed = () => {
    // 先に failed を確定させる。チップはあくまで追記入力（閉じても失敗は残る）
    onSetStatus('failed');
    if (isQuit) {
      setView('resist');
    } else {
      onOpenChange(false);
    }
  };

  const handleResistChip = (rate: number) => {
    onSetStatus('failed', { resistRate: rate });
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSetStatus(isSkippedDay ? 'none' : 'skipped');
    onOpenChange(false);
  };

  const handleSaveNote = () => {
    onSaveNote(noteDraft);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-base">{habit.name}</SheetTitle>
          <SheetDescription>{dateLabel}</SheetDescription>
        </SheetHeader>

        {view === 'menu' && (
          <div className="flex flex-col gap-2 p-4 pt-2">
            {/* 達成: 緑＝達成専用カラー。既に達成済みの日には出さない */}
            {currentStatus !== 'completed' && currentStatus !== 'rocket_used' && (
              <button
                type="button"
                onClick={() => {
                  onSetStatus('completed');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-3.5 text-left text-sm font-medium text-success ring-1 ring-success/30 transition-colors hover:bg-success/20"
              >
                <CheckCircle2 className="size-5 shrink-0" />
                {t('actionSheet.markDone')}
              </button>
            )}
            <button
              type="button"
              onClick={handleFailed}
              className="flex items-center gap-3 rounded-xl bg-danger/10 px-4 py-3.5 text-left text-sm font-medium text-danger ring-1 ring-danger/30 transition-colors hover:bg-danger/20"
            >
              <XCircle className="size-5 shrink-0" />
              {t('actionSheet.markFailed')}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium ring-1 transition-colors',
                isSkippedDay
                  ? 'bg-muted text-muted-foreground ring-border hover:bg-muted/80'
                  : 'bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20'
              )}
            >
              {isSkippedDay ? (
                <Undo2 className="size-5 shrink-0" />
              ) : (
                <SkipForward className="size-5 shrink-0" />
              )}
              {isSkippedDay ? t('unskip') : t('skip')}
            </button>
            {/* note は habit_completions の UPDATE なので、レコードの無い日（none）では出さない */}
            {currentStatus !== 'none' && (
              <button
                type="button"
                onClick={() => setView('memo')}
                className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3.5 text-left text-sm font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-secondary/80"
              >
                <StickyNote className="size-5 shrink-0" />
                {t('actionSheet.memo')}
              </button>
            )}
            {/* 取り消し: 何か記録がある日だけ。誤記録をシートから戻せるように */}
            {currentStatus !== 'none' && (
              <button
                type="button"
                onClick={() => {
                  onSetStatus('none');
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-secondary/60"
              >
                <Eraser className="size-5 shrink-0" />
                {t('actionSheet.clearStatus')}
              </button>
            )}
          </div>
        )}

        {view === 'resist' && (
          <div className="flex flex-col gap-2 p-4 pt-2">
            <p className="mb-1 text-sm font-medium">{t('actionSheet.resistPrompt')}</p>
            {RESIST_CHOICES.map(({ rate, key }) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleResistChip(rate)}
                className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-left text-sm font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-secondary/80"
              >
                <span>{t(`actionSheet.${key}`)}</span>
                <span className="text-xs text-muted-foreground">{rate}%</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-1 py-2 text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              {t('actionSheet.closeWithoutAnswer')}
            </button>
          </div>
        )}

        {view === 'memo' && (
          <div className="flex flex-col gap-3 p-4 pt-2">
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={t('actionSheet.memoPlaceholder')}
              rows={3}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('save')}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
