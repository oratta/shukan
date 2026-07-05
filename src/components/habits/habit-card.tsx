'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Maximize2, GripVertical, SkipForward, Undo2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getTodayString } from '@/lib/habits';
import { ImpactBadge } from '@/components/habits/impact-badge';
import { SavingsCard } from '@/components/habits/savings-card';
import { getEvidenceHeroImage } from '@/data/evidence-hero-images';
import type { DayStatus, HabitWithStats } from '@/types/habit';

// F15: デイリー習慣カード背景に敷くエビデンス画像コラージュの最大枚数。
// 5枚以上ある習慣は先頭4枚のみ（等分割が細くなりすぎて見た目が破綻するため打ち切り）。
const MAX_COLLAGE_IMAGES = 4;

interface HabitCardProps {
  habit: HabitWithStats;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none' | 'skipped') => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
  onSkipToday: (id: string) => void;
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
        (status === 'completed' || status === 'rocket_used') && 'bg-success',
        status === 'failed' && 'bg-[#D08068]',
        status === 'none' && 'border border-gray-300 bg-transparent',
        status === 'skipped' && 'bg-gray-300',
      )}
    />
  );
}

const CELEBRATION_COLORS = ['#4CAF76', '#5BAF7A', '#A8D5BA', '#D4AF37', '#E8C97A', '#7AB89B'];

function CelebrationEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {CELEBRATION_COLORS.map((color, i) => {
        const angle = (i / CELEBRATION_COLORS.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * 28;
        const ty = Math.sin(rad) * 28;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[celebration_600ms_ease-out_forwards]"
            style={{
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          >
            <span
              className="block size-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          </span>
        );
      })}
    </div>
  );
}

function StatusIndicator({
  habit,
  onTapToday,
  onTapVs,
}: {
  habit: HabitWithStats;
  onTapToday?: () => void;
  onTapVs?: () => void;
}) {
  const isQuit = habit.type === 'quit';
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const todayStatus = habit.recentDays?.[0]?.status ?? 'none';

  // 未完了→完了への遷移を検知して祝福演出を一度だけ表示する意図的パターン。
  useEffect(() => {
    if (
      prevStatusRef.current !== null &&
      prevStatusRef.current !== 'completed' &&
      prevStatusRef.current !== 'rocket_used' &&
      (todayStatus === 'completed' || todayStatus === 'rocket_used')
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- celebration triggered on status transition
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 700);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = todayStatus;
  }, [todayStatus]);

  // Quit habits: show urge progress ring (tappable to open VS modal)
  if (isQuit) {
    const current = habit.todayUrgeCount ?? 0;
    const target = habit.dailyTarget;
    const progress = target > 0 ? current / target : 0;
    const radius = 13;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
    const isFailed = todayStatus === 'failed';
    const isCompleted = todayStatus === 'completed' || todayStatus === 'rocket_used';
    const isDone = progress >= 1;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTapVs?.();
        }}
        className="relative flex size-8 shrink-0 items-center justify-center cursor-pointer active:scale-90 transition-transform"
      >
        {isFailed ? (
          /* Failed: solid red circle, no progress arc */
          <div className="flex size-8 items-center justify-center rounded-full bg-[#D08068]" />
        ) : (isCompleted || isDone) ? (
          /* Completed: solid green circle */
          <div className="flex size-8 items-center justify-center rounded-full bg-success">
            <span className="text-[9px] font-bold text-white">
              {current}/{target}
            </span>
          </div>
        ) : (
          /* In progress: gray bg ring + green progress arc */
          <>
            <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90">
              <circle
                cx="16" cy="16" r={radius}
                fill="none" stroke="#E5E7EB" strokeWidth="2.5"
              />
              <circle
                cx="16" cy="16" r={radius}
                fill="none" stroke="var(--success)" strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-success">
              {current}/{target}
            </span>
          </>
        )}
      </button>
    );
  }

  // Weekly positive habits: status based on weekly target achievement
  if (!isQuit && habit.frequency === 'weekly') {
    const weeklyDone = (habit.weeklyCompletedCount ?? 0) >= (habit.weeklyTarget ?? 1);

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
            weeklyDone ? 'bg-success' : 'border-2 border-gray-300',
          )}
        >
          {weeklyDone && (
            <Check className="size-4 text-white" strokeWidth={3} />
          )}
        </button>
        {showCelebration && <CelebrationEffect />}
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
          (todayStatus === 'completed' || todayStatus === 'rocket_used') && 'bg-success',
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
  onSkipToday,
}: HabitCardProps) {
  const t = useTranslations('habits');
  const tDays = useTranslations('days');
  const tStats = useTranslations('stats');
  const locale = useLocale();
  const isQuit = habit.type === 'quit';
  const isSkipped = habit.skippedToday;
  const today = getTodayString();
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const dayLabels = dayKeys.map((k) => tDays(k));

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

  // F15: 紐づくエビデンス記事の画像を等分割コラージュ背景に使う（画像を持つ記事のみ・最大4枚）。
  // 画像を1枚も持たない習慣（ゼロから作ったカスタム習慣等）は従来の通常カード表示にフォールバック。
  const evidenceImages = (habit.evidences ?? [])
    .map((ev) => getEvidenceHeroImage(ev.articleId))
    .filter((url): url is string => !!url)
    .slice(0, MAX_COLLAGE_IMAGES);
  const hasEvidenceBg = evidenceImages.length > 0;

  // 継続日数（ストリーク）の中身（箱なし）。写真ガラス内では light=true で白文字にする。
  // 緑は「積み上げ＝ポジティブ」の意味を持つ進捗バーにのみ使う（数値・ラベルは中立の白/緑）。
  const streakInner = (light: boolean) => (
    <>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', light ? 'text-white' : 'text-success')}>
          {habit.currentStreak}
        </span>
        <span className={cn('text-sm', light ? 'text-white/70' : 'text-success/70')}>
          {tStats('days')}
        </span>
        <span className={cn('ml-auto text-xs', light ? 'text-white/60' : 'text-success/60')}>
          {t('streakGoal', { percent: streakPercent })}
        </span>
      </div>
      {/* 進捗バー: 緑＝積み上げ（ポジティブ）の意味で使用 */}
      <div className={cn('mt-2 h-1.5 rounded-full', light ? 'bg-white/25' : 'bg-white')}>
        <div
          className="h-full rounded-full bg-success transition-all duration-300"
          style={{ width: `${streakPercent}%` }}
        />
      </div>
    </>
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-50 opacity-80')}>
    <Card
      className={cn(
        'gap-0 py-0 overflow-hidden transition-all duration-200',
        hasEvidenceBg && 'relative border-0'
      )}
    >
      {/* F15/F17: エビデンス画像の等分割コラージュを「カード全体」の背景に敷く（展開時も維持）。
          可読性スクリムを重ね、緑の枠（Card border）は border-0 で外す。画像を持つ習慣のみ。 */}
      {hasEvidenceBg && (
        <>
          <div className="absolute inset-0 flex" aria-hidden>
            {evidenceImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                loading="lazy"
                className="h-full min-w-0 flex-1 object-cover"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-black/60" aria-hidden />
        </>
      )}

      {/* Collapsed row - always visible */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggleExpand(habit.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleExpand(habit.id); }}
        className="relative z-10 w-full cursor-pointer text-left"
      >
        <div className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <button
          type="button"
          className={cn(
            'touch-none shrink-0 cursor-grab active:cursor-grabbing',
            hasEvidenceBg
              ? 'text-white/50 hover:text-white/80'
              : 'text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400'
          )}
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
          onTapVs={() => onOpenVsTemptation(habit.id)}
        />

        {/* Center: Name + frequency label + past day dots */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-baseline gap-2 min-w-0">
            <span
              className={cn(
                'text-[15px] font-medium truncate',
                hasEvidenceBg
                  ? cn('text-white drop-shadow-sm', isSkipped && 'text-white/50')
                  : isSkipped && 'text-muted-foreground'
              )}
            >
              {habit.name}
            </span>
            {habit.frequency === 'weekly' && (
              <span className={cn('shrink-0 text-[11px]', hasEvidenceBg ? 'text-white/80' : 'text-muted-foreground')}>
                {t('weeklyProgress', { current: habit.weeklyCompletedCount ?? 0, target: habit.weeklyTarget ?? 1 })}
              </span>
            )}
            {habit.frequency === 'weekday' && (
              <span className={cn('shrink-0 text-[11px]', hasEvidenceBg ? 'text-white/80' : 'text-muted-foreground')}>
                {t('weekday')}
              </span>
            )}
            {habit.frequency === 'custom' && habit.customDays && habit.customDays.length > 0 && (
              <span className={cn('shrink-0 text-[11px]', hasEvidenceBg ? 'text-white/80' : 'text-muted-foreground')}>
                {[...habit.customDays].sort((a, b) => a - b).map((d) => dayLabels[d]).join('・')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Past days only (skip index 0 = today), left=yesterday, right=oldest */}
            {(habit.recentDays ?? []).slice(1).map((day) => {
              const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'narrow' });
              return (
                <div key={day.date} className="flex flex-col items-center gap-0.5">
                  <span className={cn('text-[9px] leading-none', hasEvidenceBg ? 'text-white/70' : 'text-muted-foreground')}>{dayLabel}</span>
                  <DayStatusDot day={day} onTap={() => handleDotTap(day)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Chevron */}
        <div className={cn('shrink-0', hasEvidenceBg ? 'text-white/80' : 'text-gray-400')}>
          {isExpanded ? (
            <ChevronUp className="size-5" />
          ) : (
            <ChevronDown className="size-5" />
          )}
        </div>
        </div>
      </div>

      {/* Expanded body - smooth height transition via grid trick */}
      <div
        className={cn(
          'relative z-10 grid transition-[grid-template-rows] duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 pt-0 space-y-3">
            {/* Life Significance */}
            {habit.lifeSignificance && (
              <div>
                <p className={cn('text-[10px] uppercase tracking-wider font-semibold mb-0.5', hasEvidenceBg ? 'text-white/60' : 'text-gray-400')}>
                  {t('lifeSignificance')}
                </p>
                <p className={cn('text-sm', hasEvidenceBg ? 'text-white/90' : 'text-foreground/80')}>
                  {habit.lifeSignificance}
                </p>
              </div>
            )}

            {/* F18: 写真カードでは KPI影響・継続日数・累積を「1つのガラスボックス」に内包する。
                外周ボーダーはなし。区切りはごく薄いディバイダ。隙間から背景が見える状態を解消。
                写真なしカードは従来どおり個別の箱で表示する。 */}
            {hasEvidenceBg ? (
              <div className="space-y-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                {habit.evidences.length > 0 && (
                  <ImpactBadge evidences={habit.evidences} mode="daily" surface="bare" />
                )}
                {habit.evidences.length > 0 && <div className="h-px bg-white/15" />}
                <div>{streakInner(true)}</div>
                {habit.impactSavings && <div className="h-px bg-white/15" />}
                {habit.impactSavings && (
                  <SavingsCard savings={habit.impactSavings} surface="bare" />
                )}
              </div>
            ) : (
              <>
                {/* Impact Badge */}
                {habit.evidences.length > 0 && (
                  <ImpactBadge evidences={habit.evidences} mode="daily" surface="default" />
                )}
                {/* Streak card */}
                <div className="rounded-lg bg-success/15 p-3">{streakInner(false)}</div>
                {/* Savings Card */}
                {habit.impactSavings && (
                  <SavingsCard savings={habit.impactSavings} surface="default" />
                )}
              </>
            )}

            {/* Detail + Skip/Unskip buttons */}
            <div className="flex gap-2">
              {/* F20: 詳細はポジティブな意味を持たないため緑をやめ、中立色に。
                  写真上は白ガラス、通常時は secondary。押せる affordance は維持。 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(habit.id);
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  hasEvidenceBg
                    ? 'bg-white/90 text-gray-900 hover:bg-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <Maximize2 className="size-4" />
                {t('detail')}
              </button>
              {/* F19: スキップは中立操作。緑以外の中立アクセント（primary=スレート/白ガラス）＋
                  リングで押せる affordance を明示。skipped 中は amber。 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkipToday(habit.id);
                }}
                className={cn(
                  'flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium ring-1 transition-colors',
                  isSkipped
                    ? 'bg-amber-100 text-amber-700 ring-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900/40 dark:hover:bg-amber-900/50'
                    : hasEvidenceBg
                      ? 'bg-white/15 text-white ring-white/30 hover:bg-white/25'
                      : 'bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20'
                )}
              >
                {isSkipped ? (
                  <>
                    <Undo2 className="size-4" />
                    {t('unskip')}
                  </>
                ) : (
                  <>
                    <SkipForward className="size-4" />
                    {t('skip')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}
