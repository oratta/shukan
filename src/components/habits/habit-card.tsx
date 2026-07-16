'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, ChevronDown, ChevronUp, Maximize2, GripVertical, SkipForward, Undo2, Images } from 'lucide-react';
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
  /** 推定値（ImpactBadge）タップで算出根拠（エビデンス記事）へ 1 タップ到達する導線（issue #39） */
  onOpenArticle?: (articleId: string) => void;
}

function nextStatus(current: DayStatus['status']): 'completed' | 'failed' | 'none' {
  if (current === 'none') return 'completed';
  if (current === 'completed' || current === 'rocket_used') return 'failed';
  return 'none';
}

function DayStatusDot({
  day,
  onTap,
  onImage = false,
}: {
  day: DayStatus;
  onTap: () => void;
  /** 写真バナー上に載る場合は未達/スキップを白系にして視認性を保つ */
  onImage?: boolean;
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
        status === 'failed' && 'bg-danger',
        status === 'none' && (onImage ? 'border border-white/70 bg-white/10' : 'border border-skipped bg-transparent'),
        status === 'skipped' && (onImage ? 'bg-white/45' : 'bg-skipped'),
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
  onImage = false,
}: {
  habit: HabitWithStats;
  onTapToday?: () => void;
  onTapVs?: () => void;
  /** 写真バナー上では未達リング/枠を白系にして視認性を保つ */
  onImage?: boolean;
}) {
  const isQuit = habit.type === 'quit';
  const idleBorder = onImage ? 'border-white/70' : 'border-skipped';
  const trackStroke = onImage ? 'rgba(255,255,255,0.35)' : 'var(--track)';
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
          <div className="flex size-8 items-center justify-center rounded-full bg-danger" />
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
                fill="none" stroke={trackStroke} strokeWidth="2.5"
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
            weeklyDone ? 'bg-success' : cn('border-2', idleBorder),
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
          todayStatus === 'failed' && 'bg-danger',
          todayStatus === 'none' && cn('border-2', idleBorder),
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
  onOpenArticle,
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

  // 折りたたみ行を写真バナー版・通常版で共有する部品。light=写真上（白文字＋影）。
  const dragHandle = (
    <button
      type="button"
      className={cn(
        'touch-none shrink-0 cursor-grab active:cursor-grabbing transition-colors',
        hasEvidenceBg
          ? 'text-white/55 hover:text-white/90'
          : 'text-skipped hover:text-muted-foreground'
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="size-4" />
    </button>
  );

  const statusIndicator = (
    <StatusIndicator
      habit={habit}
      onImage={hasEvidenceBg}
      onTapToday={() => {
        const todayDay = (habit.recentDays ?? [])[0];
        if (todayDay) handleDotTap(todayDay);
      }}
      onTapVs={() => onOpenVsTemptation(habit.id)}
    />
  );

  const chevron = isExpanded ? (
    <ChevronUp className="size-5" />
  ) : (
    <ChevronDown className="size-5" />
  );

  const frequencyLabel = (light: boolean) => {
    const cls = cn('shrink-0 text-[11px]', light ? 'text-white/85 banner-label' : 'text-muted-foreground');
    if (habit.frequency === 'weekly') {
      return <span className={cls}>{t('weeklyProgress', { current: habit.weeklyCompletedCount ?? 0, target: habit.weeklyTarget ?? 1 })}</span>;
    }
    if (habit.frequency === 'weekday') {
      return <span className={cls}>{t('weekday')}</span>;
    }
    if (habit.frequency === 'custom' && habit.customDays && habit.customDays.length > 0) {
      return <span className={cls}>{[...habit.customDays].sort((a, b) => a - b).map((d) => dayLabels[d]).join('・')}</span>;
    }
    return null;
  };

  const dayDotsRow = (light: boolean) => (
    <div className="flex items-center gap-1.5">
      {/* Past days only (skip index 0 = today), left=yesterday, right=oldest */}
      {(habit.recentDays ?? []).slice(1).map((day) => {
        const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'narrow' });
        return (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <span className={cn('text-[9px] leading-none', light ? 'text-white/75 banner-label' : 'text-muted-foreground')}>{dayLabel}</span>
            <DayStatusDot day={day} onTap={() => handleDotTap(day)} onImage={light} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-50 opacity-80')}>
    <Card
      className={cn(
        'gap-0 py-0 overflow-hidden transition-all duration-200',
        hasEvidenceBg && 'relative isolate rounded-2xl border-0 shadow-lg shadow-black/10 ring-1 ring-black/5 dark:ring-white/10'
      )}
    >
      {/* A案（シネマティック・バナー）: エビデンス写真を主役にする。等分割コラージュは
          写真同士が細切れになって濁るためやめ、1枚目をメインに全面へ敷く（枚数は右上バッジ）。
          可読性は全面スクリムではなく、下→上のグラデーション（下濃く・上は写真素通し）＋
          文字影で確保し、写真に「光」を残す。展開時は下地をやや落として下部パネルを読ませる。 */}
      {hasEvidenceBg && (
        <>
          <img
            src={evidenceImages[0]}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* 色相統一のティント（暗くはしない）。可読性の暗さは下の banner-scrim が担う。 */}
          <div aria-hidden className="banner-tint absolute inset-0" />
          <div
            aria-hidden
            className={cn('absolute inset-0', isExpanded ? 'banner-scrim-expanded' : 'banner-scrim')}
          />
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
        {hasEvidenceBg ? (
          /* シネマティック・バナー: 高さのある写真バナー。上段にドラッグ/枚数/開閉、
             下段にステータス丸＋大きく太い白タイトル＋曜日ドットを重ねる。 */
          <div className="relative flex min-h-[118px] flex-col justify-end">
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-2.5">
              {dragHandle}
              <div className="flex items-center gap-2">
                {evidenceImages.length > 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 backdrop-blur-sm">
                    <Images className="size-3 text-white/85" />
                    <span className="text-[10px] font-semibold tabular-nums text-white/90">{evidenceImages.length}</span>
                  </span>
                )}
                <span className="text-white/85">{chevron}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 px-3 pb-3 pt-10">
              {statusIndicator}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className={cn('banner-title truncate text-[21px] font-bold leading-tight tracking-tight text-white', isSkipped && 'text-white/50')}>
                    {habit.name}
                  </span>
                  {frequencyLabel(true)}
                </div>
                <div className="mt-2">{dayDotsRow(true)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3">
            {dragHandle}
            {statusIndicator}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className={cn('text-[15px] font-medium truncate', isSkipped && 'text-muted-foreground')}>
                  {habit.name}
                </span>
                {frequencyLabel(false)}
              </div>
              {dayDotsRow(false)}
            </div>
            <div className="shrink-0 text-muted-foreground">{chevron}</div>
          </div>
        )}
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
                <p className={cn('text-[10px] uppercase tracking-wider font-semibold mb-0.5', hasEvidenceBg ? 'text-white/60' : 'text-muted-foreground')}>
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
              <div className="space-y-3 rounded-xl bg-white/10 p-3 backdrop-blur-md">
                {habit.evidences.length > 0 && (
                  <ImpactBadge
                    evidences={habit.evidences}
                    mode="daily"
                    surface="bare"
                    onTap={
                      onOpenArticle
                        ? () => onOpenArticle(habit.evidences[0].articleId)
                        : undefined
                    }
                  />
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
                  <ImpactBadge
                    evidences={habit.evidences}
                    mode="daily"
                    surface="default"
                    onTap={
                      onOpenArticle
                        ? () => onOpenArticle(habit.evidences[0].articleId)
                        : undefined
                    }
                  />
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
