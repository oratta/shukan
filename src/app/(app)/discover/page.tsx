'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp } from 'lucide-react';
import { getArticleList } from '@/data/impact-articles';
import { formatCurrency, formatHealthMinutes, calculateAnnualImpact } from '@/lib/impact';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { HabitForm } from '@/components/habits/habit-form';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/types/habit';
import type { ArticleId } from '@/types/impact';

/** Unsplash hero image URLs per article category */
const HERO_IMAGES: Record<string, string> = {
  quit_smoking: 'https://images.unsplash.com/photo-1554548405-74d68637f897?w=400&h=200&fit=crop&q=80',
  quit_alcohol: 'https://images.unsplash.com/photo-1535683577427-740aaac4ec25?w=400&h=200&fit=crop&q=80',
  quit_porn: 'https://images.unsplash.com/photo-1573511860302-28c524319d2a?w=400&h=200&fit=crop&q=80',
  no_youtube: 'https://plus.unsplash.com/premium_photo-1661313613228-88dab4e3d22e?w=400&h=200&fit=crop&q=80',
  daily_cardio: 'https://plus.unsplash.com/premium_photo-1663127773019-2d977286d60a?w=400&h=200&fit=crop&q=80',
  daily_strength: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400&h=200&fit=crop&q=80',
  morning_planning: 'https://plus.unsplash.com/premium_photo-1706028469800-7c719a733e10?w=400&h=200&fit=crop&q=80',
  quit_sugar: 'https://images.unsplash.com/photo-1668141077204-4cb8d28c6f1d?w=400&h=200&fit=crop&q=80',
  quit_junk_food: 'https://images.unsplash.com/photo-1564362411991-472954b39f56?w=400&h=200&fit=crop&q=80',
  quit_social_media: 'https://images.unsplash.com/photo-1675352161865-27816c76141a?w=400&h=200&fit=crop&q=80',
  no_screens_before_bed: 'https://images.unsplash.com/photo-1636101630293-ca3c1518717f?w=400&h=200&fit=crop&q=80',
  no_impulse_buying: 'https://images.unsplash.com/photo-1758525226490-c1553d9f3ad3?w=400&h=200&fit=crop&q=80',
  daily_walking: 'https://images.unsplash.com/photo-1759683730011-c72b69bf7f81?w=400&h=200&fit=crop&q=80',
  daily_stretching: 'https://images.unsplash.com/photo-1758599880489-403f7ae405f3?w=400&h=200&fit=crop&q=80',
  daily_yoga: 'https://images.unsplash.com/photo-1758599879559-efc4a3fb4243?w=400&h=200&fit=crop&q=80',
  cold_shower: 'https://images.unsplash.com/photo-1566969208336-b1af5efae927?w=400&h=200&fit=crop&q=80',
  daily_meditation: 'https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?w=400&h=200&fit=crop&q=80',
  daily_journaling: 'https://images.unsplash.com/photo-1704966029445-82c499aff85e?w=400&h=200&fit=crop&q=80',
  gratitude_practice: 'https://images.unsplash.com/photo-1712229462026-190941c6b083?w=400&h=200&fit=crop&q=80',
  sleep_7hours: 'https://images.unsplash.com/photo-1594296220371-a34da13ff6d4?w=400&h=200&fit=crop&q=80',
  wake_early: 'https://images.unsplash.com/photo-1763037415656-93716b1721f5?w=400&h=200&fit=crop&q=80',
  drink_water: 'https://images.unsplash.com/photo-1760627317288-8cc2b44efb2d?w=400&h=200&fit=crop&q=80',
  eat_vegetables: 'https://images.unsplash.com/photo-1758721218560-aec50748d450?w=400&h=200&fit=crop&q=80',
  intermittent_fasting: 'https://images.unsplash.com/photo-1744194699438-1fca92810d11?w=400&h=200&fit=crop&q=80',
  home_cooking: 'https://images.unsplash.com/photo-1758522489348-6e33d0e14669?w=400&h=200&fit=crop&q=80',
  daily_reading: 'https://images.unsplash.com/photo-1623771702313-39dc4f71d275?w=400&h=200&fit=crop&q=80',
  deep_work: 'https://images.unsplash.com/photo-1633250999791-3134c302139b?w=400&h=200&fit=crop&q=80',
  learn_language: 'https://images.unsplash.com/photo-1673515336416-a859f5b02afa?w=400&h=200&fit=crop&q=80',
  daily_saving: 'https://images.unsplash.com/photo-1561837581-abd854e0ee22?w=400&h=200&fit=crop&q=80',
  time_in_nature: 'https://images.unsplash.com/photo-1620802470382-5799c79143ab?w=400&h=200&fit=crop&q=80',
  morning_tidying: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=200&fit=crop&q=80',
  daily_habit_review: 'https://images.unsplash.com/photo-1643706755543-2d1f7adff211?w=400&h=200&fit=crop&q=80',
  schedule_adherence: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop&q=80',
  pomodoro_technique: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=200&fit=crop&q=80',
  movement_breaks: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&q=80',
};

/** Fallback gradient color map */
const GRADIENT_MAP: Record<string, string> = {
  quit_smoking: 'from-gray-400 to-gray-600',
  quit_alcohol: 'from-amber-400 to-amber-600',
  quit_porn: 'from-purple-400 to-purple-600',
  no_youtube: 'from-red-400 to-red-600',
  daily_cardio: 'from-orange-400 to-orange-600',
  daily_strength: 'from-rose-500 to-red-600',
  morning_planning: 'from-sky-400 to-blue-600',
  quit_sugar: 'from-pink-400 to-pink-600',
  quit_junk_food: 'from-yellow-400 to-orange-600',
  quit_social_media: 'from-blue-400 to-indigo-600',
  no_screens_before_bed: 'from-indigo-400 to-purple-600',
  no_impulse_buying: 'from-emerald-400 to-teal-600',
  daily_walking: 'from-green-400 to-emerald-600',
  daily_stretching: 'from-cyan-400 to-teal-600',
  daily_yoga: 'from-violet-400 to-purple-600',
  cold_shower: 'from-cyan-400 to-blue-600',
  daily_meditation: 'from-indigo-400 to-violet-600',
  daily_journaling: 'from-amber-400 to-orange-600',
  gratitude_practice: 'from-yellow-400 to-amber-600',
  sleep_7hours: 'from-blue-400 to-indigo-600',
  wake_early: 'from-amber-400 to-orange-600',
  drink_water: 'from-sky-400 to-cyan-600',
  eat_vegetables: 'from-green-400 to-lime-600',
  intermittent_fasting: 'from-slate-400 to-gray-600',
  home_cooking: 'from-orange-400 to-red-600',
  daily_reading: 'from-amber-400 to-yellow-600',
  deep_work: 'from-blue-400 to-slate-600',
  learn_language: 'from-teal-400 to-cyan-600',
  daily_saving: 'from-emerald-400 to-green-600',
  time_in_nature: 'from-green-400 to-teal-600',
  morning_tidying: 'from-sky-400 to-cyan-600',
  daily_habit_review: 'from-violet-400 to-indigo-600',
  schedule_adherence: 'from-blue-400 to-slate-600',
  pomodoro_technique: 'from-red-400 to-orange-600',
  movement_breaks: 'from-green-400 to-teal-600',
};

/** Confidence badge colors */
const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function DiscoverPage() {
  const t = useTranslations();
  const { addHabit } = useHabits();
  const [selectedArticleId, setSelectedArticleId] = useState<ArticleId | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [prefilledEvidences, setPrefilledEvidences] = useState<{ articleId: string; weight: number }[]>([]);
  const [prefilledName, setPrefilledName] = useState('');

  const articles = useMemo(() => getArticleList(), []);

  const quitArticles = useMemo(
    () => articles.filter((a) => a.defaultHabitType === 'quit'),
    [articles]
  );

  const buildArticles = useMemo(
    () => articles.filter((a) => a.defaultHabitType === 'positive'),
    [articles]
  );

  const timeUnits = useMemo(
    () => ({
      min: t('impact.minuteUnit'),
      hour: t('impact.hourUnit'),
      day: t('impact.dayUnit'),
      perYear: t('discover.perYear'),
    }),
    [t]
  );

  const handleAddFromArticle = useCallback((articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    setPrefilledEvidences([{ articleId, weight: 100 }]);
    setPrefilledName(article?.name ?? '');
    setSelectedArticleId(null);
    setFormOpen(true);
  }, [articles]);

  const handleFormSubmit = useCallback(
    (
      data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'>,
      copingSteps?: { title: string; sortOrder: number }[],
      initialEvidences?: { articleId: string; weight: number }[]
    ) => {
      addHabit(data, copingSteps, initialEvidences);
    },
    [addHabit]
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('discover.title')}
        </h2>
      </div>

      {/* Quit Section */}
      {quitArticles.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {t('discover.quit')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quitArticles.map((article) => (
              <ArticleCard
                key={article.id}
                articleId={article.id}

                name={article.name}
                healthMinutes={article.calculationParams.dailyHealthMinutes}
                costSaving={article.calculationParams.dailyCostSaving}
                incomeGain={article.calculationParams.dailyIncomeGain}
                confidenceLevel={article.confidenceLevel}
                heroImage={HERO_IMAGES[article.id]}
                gradient={GRADIENT_MAP[article.id] ?? 'from-gray-400 to-gray-600'}
                timeUnits={timeUnits}
                confidenceLabel={t(`discover.confidence.${article.confidenceLevel}`)}
                onTap={setSelectedArticleId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Build Section */}
      {buildArticles.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {t('discover.build')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {buildArticles.map((article) => (
              <ArticleCard
                key={article.id}
                articleId={article.id}

                name={article.name}
                healthMinutes={article.calculationParams.dailyHealthMinutes}
                costSaving={article.calculationParams.dailyCostSaving}
                incomeGain={article.calculationParams.dailyIncomeGain}
                confidenceLevel={article.confidenceLevel}
                heroImage={HERO_IMAGES[article.id]}
                gradient={GRADIENT_MAP[article.id] ?? 'from-gray-400 to-gray-600'}
                timeUnits={timeUnits}
                confidenceLabel={t(`discover.confidence.${article.confidenceLevel}`)}
                onTap={setSelectedArticleId}
              />
            ))}
          </div>
        </section>
      )}

      <EvidenceArticleSheet
        open={!!selectedArticleId}
        onOpenChange={(open) => !open && setSelectedArticleId(null)}
        articleId={selectedArticleId}
        showAddButton
        onAddHabit={handleAddFromArticle}
      />

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initialData={{ name: prefilledName }}
        prefilledEvidences={prefilledEvidences}
      />
    </div>
  );
}

interface ArticleCardProps {
  articleId: ArticleId;
  name: string;
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  heroImage?: string;
  gradient: string;
  timeUnits: { min: string; hour: string; day: string; perYear: string };
  confidenceLabel: string;
  onTap: (id: ArticleId) => void;
}

function ArticleCard({
  articleId,
  name,
  healthMinutes,
  costSaving,
  incomeGain,
  confidenceLevel,
  heroImage,
  gradient,
  timeUnits,
  confidenceLabel,
  onTap,
}: ArticleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onTap(articleId)}
      className="bg-card rounded-xl shadow-sm overflow-hidden text-left transition-transform active:scale-[0.97] w-full"
    >
      {/* Hero image */}
      <div
        className={`relative h-28 ${heroImage ? '' : `bg-gradient-to-br ${gradient}`}`}
      >
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
            {name}
          </span>
        </div>

        {/* Impact metrics (annual) */}
        {(() => {
          const annual = calculateAnnualImpact({
            healthMinutes,
            costSaving,
            incomeGain,
          });
          return (
            <div className="text-[11px] text-muted-foreground space-y-0.5 mb-2">
              <div className="flex items-center gap-1">
                <HeartPulse className="size-3" />
                <span>+{formatHealthMinutes(annual.healthMinutes, timeUnits)}{timeUnits.perYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Wallet className="size-3" />
                <span>{formatCurrency(annual.costSaving)}{timeUnits.perYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                <span>{formatCurrency(annual.incomeGain)}{timeUnits.perYear}</span>
              </div>
            </div>
          );
        })()}

        {/* Confidence badge */}
        <span
          className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${CONFIDENCE_COLORS[confidenceLevel] ?? CONFIDENCE_COLORS.low}`}
        >
          {confidenceLabel}
        </span>
      </div>
    </button>
  );
}
