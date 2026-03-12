'use client';

import { useMemo, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, HeartPulse, Wallet, TrendingUp, ChevronDown, ThumbsDown, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getArticle } from '@/data/impact-articles';
import { renderArticle, calculateAnnualImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import type { ArticleId, CalcStep } from '@/types/impact';
import { submitBadMark, removeBadMark, submitComment, getUserFeedback } from '@/lib/supabase/feedbacks';

/** Convert **bold** markers in text to <strong> elements */
function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

/** Unsplash hero images per article */
const HERO_IMAGES: Record<string, string> = {
  quit_smoking: 'https://images.unsplash.com/photo-1554548405-74d68637f897?w=800&h=400&fit=crop&q=80',
  quit_alcohol: 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=800&h=400&fit=crop&q=80',
  quit_porn: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?w=800&h=400&fit=crop&q=80',
  no_youtube: 'https://plus.unsplash.com/premium_photo-1661313613228-88dab4e3d22e?w=800&h=400&fit=crop&q=80',
  daily_cardio: 'https://plus.unsplash.com/premium_photo-1663127773019-2d977286d60a?w=800&h=400&fit=crop&q=80',
  daily_strength: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&h=400&fit=crop&q=80',
  morning_planning: 'https://plus.unsplash.com/premium_photo-1706028469800-7c719a733e10?w=800&h=400&fit=crop&q=80',
  quit_sugar: 'https://images.unsplash.com/photo-1668141077204-4cb8d28c6f1d?w=800&h=400&fit=crop&q=80',
  quit_junk_food: 'https://images.unsplash.com/photo-1564362411991-472954b39f56?w=800&h=400&fit=crop&q=80',
  quit_social_media: 'https://images.unsplash.com/photo-1675352161865-27816c76141a?w=800&h=400&fit=crop&q=80',
  no_screens_before_bed: 'https://images.unsplash.com/photo-1636101630293-ca3c1518717f?w=800&h=400&fit=crop&q=80',
  no_impulse_buying: 'https://images.unsplash.com/photo-1758525226490-c1553d9f3ad3?w=800&h=400&fit=crop&q=80',
  daily_walking: 'https://images.unsplash.com/photo-1759683730011-c72b69bf7f81?w=800&h=400&fit=crop&q=80',
  daily_stretching: 'https://images.unsplash.com/photo-1758599880489-403f7ae405f3?w=800&h=400&fit=crop&q=80',
  daily_yoga: 'https://images.unsplash.com/photo-1758599879559-efc4a3fb4243?w=800&h=400&fit=crop&q=80',
  cold_shower: 'https://images.unsplash.com/photo-1566969208336-b1af5efae927?w=800&h=400&fit=crop&q=80',
  daily_meditation: 'https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?w=800&h=400&fit=crop&q=80',
  daily_journaling: 'https://images.unsplash.com/photo-1704966029445-82c499aff85e?w=800&h=400&fit=crop&q=80',
  gratitude_practice: 'https://images.unsplash.com/photo-1712229462026-190941c6b083?w=800&h=400&fit=crop&q=80',
  sleep_7hours: 'https://images.unsplash.com/photo-1594296220371-a34da13ff6d4?w=800&h=400&fit=crop&q=80',
  wake_early: 'https://images.unsplash.com/photo-1763037415656-93716b1721f5?w=800&h=400&fit=crop&q=80',
  drink_water: 'https://images.unsplash.com/photo-1760627317288-8cc2b44efb2d?w=800&h=400&fit=crop&q=80',
  eat_vegetables: 'https://images.unsplash.com/photo-1758721218560-aec50748d450?w=800&h=400&fit=crop&q=80',
  intermittent_fasting: 'https://images.unsplash.com/photo-1744194699438-1fca92810d11?w=800&h=400&fit=crop&q=80',
  home_cooking: 'https://images.unsplash.com/photo-1758522489348-6e33d0e14669?w=800&h=400&fit=crop&q=80',
  daily_reading: 'https://images.unsplash.com/photo-1623771702313-39dc4f71d275?w=800&h=400&fit=crop&q=80',
  deep_work: 'https://images.unsplash.com/photo-1633250999791-3134c302139b?w=800&h=400&fit=crop&q=80',
  learn_language: 'https://images.unsplash.com/photo-1673515336416-a859f5b02afa?w=800&h=400&fit=crop&q=80',
  daily_saving: 'https://images.unsplash.com/photo-1561837581-abd854e0ee22?w=800&h=400&fit=crop&q=80',
  time_in_nature: 'https://images.unsplash.com/photo-1620802470382-5799c79143ab?w=800&h=400&fit=crop&q=80',
  morning_tidying: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=400&fit=crop&q=80',
  daily_habit_review: 'https://images.unsplash.com/photo-1643706755543-2d1f7adff211?w=800&h=400&fit=crop&q=80',
  schedule_adherence: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop&q=80',
  pomodoro_technique: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop&q=80',
  movement_breaks: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&q=80',
};

/** Fallback gradient color palette */
const HERO_GRADIENTS: Record<string, string> = {
  quit_smoking: 'from-red-400 to-orange-300',
  quit_porn: 'from-purple-400 to-pink-300',
  quit_alcohol: 'from-amber-400 to-yellow-300',
  no_youtube: 'from-rose-400 to-red-300',
  morning_planning: 'from-sky-400 to-blue-300',
  daily_cardio: 'from-green-400 to-emerald-300',
  daily_strength: 'from-indigo-400 to-violet-300',
  quit_sugar: 'from-pink-400 to-pink-300',
  quit_junk_food: 'from-yellow-400 to-orange-300',
  quit_social_media: 'from-blue-400 to-indigo-300',
  no_screens_before_bed: 'from-indigo-400 to-purple-300',
  no_impulse_buying: 'from-emerald-400 to-teal-300',
  daily_walking: 'from-green-400 to-emerald-300',
  daily_stretching: 'from-cyan-400 to-teal-300',
  daily_yoga: 'from-violet-400 to-purple-300',
  cold_shower: 'from-cyan-400 to-blue-300',
  daily_meditation: 'from-indigo-400 to-violet-300',
  daily_journaling: 'from-amber-400 to-orange-300',
  gratitude_practice: 'from-yellow-400 to-amber-300',
  sleep_7hours: 'from-blue-400 to-indigo-300',
  wake_early: 'from-amber-400 to-orange-300',
  drink_water: 'from-sky-400 to-cyan-300',
  eat_vegetables: 'from-green-400 to-lime-300',
  intermittent_fasting: 'from-slate-400 to-gray-300',
  home_cooking: 'from-orange-400 to-red-300',
  daily_reading: 'from-amber-400 to-yellow-300',
  deep_work: 'from-blue-400 to-slate-300',
  learn_language: 'from-teal-400 to-cyan-300',
  daily_saving: 'from-emerald-400 to-green-300',
  time_in_nature: 'from-green-400 to-teal-300',
  morning_tidying: 'from-sky-400 to-cyan-300',
  daily_habit_review: 'from-violet-400 to-indigo-300',
  schedule_adherence: 'from-blue-400 to-slate-300',
  pomodoro_technique: 'from-red-400 to-orange-300',
  movement_breaks: 'from-green-400 to-teal-300',
};

const DEFAULT_GRADIENT = 'from-teal-400 to-cyan-300';

interface EvidenceArticleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string | null;
  showAddButton?: boolean;
  onAddHabit?: (articleId: string) => void;
}

/** Renders a single CalcStep row */
function CalcStepRow({ step, index }: { step: CalcStep; index: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-xs font-medium text-foreground/70">
        {index + 1}. {step.label}
      </div>
      {step.value && (
        <div className="mt-0.5 text-xs text-muted-foreground">{step.value}</div>
      )}
      {step.formula && (
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">{step.formula}</div>
      )}
      {step.result && (
        <div className="mt-0.5 text-xs font-semibold text-foreground">= {step.result}</div>
      )}
    </div>
  );
}

export function EvidenceArticleSheet({
  open,
  onOpenChange,
  articleId,
  showAddButton = false,
  onAddHabit,
}: EvidenceArticleSheetProps) {
  const t = useTranslations('impact');
  const tEvidence = useTranslations('evidence');

  const article = useMemo(
    () => (articleId ? getArticle(articleId as ArticleId) : undefined),
    [articleId]
  );

  const renderedBody = useMemo(
    () => (article ? renderArticle(article) : ''),
    [article]
  );

  // Calculation logic collapsible state
  const [calcExpanded, setCalcExpanded] = useState(false);

  // Feedback state
  const [hasBadMark, setHasBadMark] = useState(false);
  const [badMarkLoading, setBadMarkLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSending, setCommentSending] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  // Load feedback state when sheet opens (SCENARIO-AF-09)
  useEffect(() => {
    if (!open || !articleId) return;
    setCalcExpanded(false);
    setCommentText('');
    setShowThanks(false);
    getUserFeedback(articleId).then(({ hasBadMark: has }) => setHasBadMark(has));
  }, [open, articleId]);

  // Bad mark toggle (SCENARIO-AF-01, AF-02, AF-08)
  const handleBadMarkToggle = useCallback(async () => {
    if (!articleId || badMarkLoading) return;
    const prev = hasBadMark;
    setHasBadMark(!prev); // optimistic
    setBadMarkLoading(true);
    try {
      if (prev) {
        await removeBadMark(articleId);
      } else {
        await submitBadMark(articleId);
      }
    } catch (err) {
      console.error('Bad mark toggle failed:', err);
      setHasBadMark(prev); // rollback
    } finally {
      setBadMarkLoading(false);
    }
  }, [articleId, hasBadMark, badMarkLoading]);

  // Comment submit (SCENARIO-AF-04)
  const handleCommentSubmit = useCallback(async () => {
    if (!articleId || !commentText.trim() || commentSending) return;
    setCommentSending(true);
    try {
      await submitComment(articleId, commentText.trim());
      setCommentText('');
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 3000);
    } catch (err) {
      console.error('Comment submit failed:', err);
    } finally {
      setCommentSending(false);
    }
  }, [articleId, commentText, commentSending]);

  if (!article || !articleId) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" showCloseButton={false} className="h-0 p-0">
          <SheetTitle className="sr-only">Loading</SheetTitle>
        </SheetContent>
      </Sheet>
    );
  }

  const { dailyHealthMinutes, dailyCostSaving, dailyIncomeGain } =
    article.calculationParams;
  const annual = calculateAnnualImpact({
    healthMinutes: dailyHealthMinutes,
    costSaving: dailyCostSaving,
    incomeGain: dailyIncomeGain,
  });

  const confidenceLabel = t(`confidence.${article.confidenceLevel}`);
  const gradient = HERO_GRADIENTS[articleId] ?? DEFAULT_GRADIENT;

  const confidenceBadgeClass = (() => {
    switch (article.confidenceLevel) {
      case 'high':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[95vh] flex-col rounded-t-2xl p-0"
      >
        <SheetTitle className="sr-only">{article.habitName}</SheetTitle>

        {/* Scrollable area */}
        <div className={cn('flex-1 overflow-y-auto', showAddButton && 'pb-20')}>
          {/* Hero image area */}
          <div
            className={cn(
              'relative h-48',
              !HERO_IMAGES[articleId] && `bg-gradient-to-br ${gradient}`
            )}
          >
            {HERO_IMAGES[articleId] && (
              <img
                src={HERO_IMAGES[articleId]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            )}
            {/* Back button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
            >
              <ArrowLeft className="size-5" />
            </button>
          </div>

          {/* Article title + meta */}
          <div className="px-4 pt-4">
            <h2 className="text-xl font-bold">{article.habitName}</h2>

            {/* Impact badges row (annual) */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <HeartPulse className="size-3.5" /> +{formatHealthMinutes(annual.healthMinutes)}{t('perYear')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <Wallet className="size-3.5" /> {formatCurrency(annual.costSaving, false)}{t('perYear')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-xs font-medium text-[#B8860B]">
                <TrendingUp className="size-3.5" /> {formatCurrency(annual.incomeGain, false)}{t('perYear')}
              </span>
            </div>

            {/* Confidence badge */}
            <div className="mt-2">
              <span
                className={cn(
                  'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                  confidenceBadgeClass
                )}
              >
                {confidenceLabel}
              </span>
            </div>
          </div>

          {/* Article body */}
          <div className="px-4 pb-4 pt-4">
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {parseBold(renderedBody)}
            </div>

            {/* Sources */}
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('sources')}
              </h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                {article.article.sources.map((source) => (
                  <li key={source.id} className="leading-relaxed">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        {source.text}
                      </a>
                    ) : (
                      source.text
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Calculation Logic (collapsible) — REQ-CL-04 */}
            {article.calculationLogic && (
              <div className="mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setCalcExpanded(!calcExpanded)}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {tEvidence('calculationLogic')}
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform',
                      calcExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {calcExpanded && (
                  <div className="mt-3 space-y-4">
                    {/* Health */}
                    <div>
                      <h4 className="mb-1.5 text-xs font-medium text-foreground/70">
                        <HeartPulse className="mr-1 inline size-3.5" />
                        {tEvidence('feedbackHealth')}
                      </h4>
                      <div className="space-y-1.5">
                        {article.calculationLogic.health.map((step, i) => (
                          <CalcStepRow key={i} step={step} index={i} />
                        ))}
                      </div>
                    </div>

                    {/* Cost */}
                    <div>
                      <h4 className="mb-1.5 text-xs font-medium text-foreground/70">
                        <Wallet className="mr-1 inline size-3.5" />
                        {tEvidence('feedbackCost')}
                      </h4>
                      <div className="space-y-1.5">
                        {article.calculationLogic.cost.map((step, i) => (
                          <CalcStepRow key={i} step={step} index={i} />
                        ))}
                      </div>
                    </div>

                    {/* Income */}
                    <div>
                      <h4 className="mb-1.5 text-xs font-medium text-foreground/70">
                        <TrendingUp className="mr-1 inline size-3.5" />
                        {tEvidence('feedbackIncome')}
                      </h4>
                      <div className="space-y-1.5">
                        {article.calculationLogic.income.map((step, i) => (
                          <CalcStepRow key={i} step={step} index={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feedback section — REQ-AF-04, AF-06 */}
            <div className="mt-4 border-t pt-4 pb-4">
              <p className="text-xs text-muted-foreground">
                {tEvidence('feedbackQuestion')}
              </p>
              <button
                type="button"
                onClick={handleBadMarkToggle}
                disabled={badMarkLoading}
                className={cn(
                  'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  hasBadMark
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <ThumbsDown className="size-3.5" />
                {tEvidence('feedbackBadMark')}
              </button>

              {/* Comment input (SCENARIO-AF-03: visible when bad mark is active) */}
              {hasBadMark && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={tEvidence('feedbackCommentPlaceholder')}
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={!commentText.trim() || commentSending}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground transition-opacity disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Thank you toast */}
              {showThanks && (
                <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
                  {tEvidence('feedbackThanks')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed CTA bar at bottom */}
        {showAddButton && onAddHabit && (
          <div className="absolute inset-x-0 bottom-0 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => onAddHabit(articleId)}
              className="w-full"
              size="lg"
            >
              {tEvidence('addThisHabit')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
