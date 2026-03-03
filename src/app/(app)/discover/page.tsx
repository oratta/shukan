'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getArticleList } from '@/data/impact-articles';
import { formatCurrency, formatHealthMinutes } from '@/lib/impact';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { HabitForm } from '@/components/habits/habit-form';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/types/habit';
import type { ArticleId } from '@/types/impact';

/** Gradient color map per article category */
const GRADIENT_MAP: Record<string, string> = {
  quit_smoking: 'from-gray-400 to-gray-600',
  quit_alcohol: 'from-amber-400 to-amber-600',
  quit_porn: 'from-purple-400 to-purple-600',
  no_youtube: 'from-red-400 to-red-600',
  daily_cardio: 'from-orange-400 to-orange-600',
  daily_strength: 'from-rose-500 to-red-600',
  morning_planning: 'from-sky-400 to-blue-600',
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
      perDay: t('discover.perDay'),
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
                icon={article.defaultIcon}
                name={article.name}
                healthMinutes={article.calculationParams.dailyHealthMinutes}
                costSaving={article.calculationParams.dailyCostSaving}
                incomeGain={article.calculationParams.dailyIncomeGain}
                confidenceLevel={article.confidenceLevel}
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
                icon={article.defaultIcon}
                name={article.name}
                healthMinutes={article.calculationParams.dailyHealthMinutes}
                costSaving={article.calculationParams.dailyCostSaving}
                incomeGain={article.calculationParams.dailyIncomeGain}
                confidenceLevel={article.confidenceLevel}
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
  icon: string;
  name: string;
  healthMinutes: number;
  costSaving: number;
  incomeGain: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  gradient: string;
  timeUnits: { min: string; hour: string; day: string; perDay: string };
  confidenceLabel: string;
  onTap: (id: ArticleId) => void;
}

function ArticleCard({
  articleId,
  icon,
  name,
  healthMinutes,
  costSaving,
  incomeGain,
  confidenceLevel,
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
      {/* Hero gradient with icon */}
      <div
        className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}
      >
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
            {name}
          </span>
        </div>

        {/* Impact metrics */}
        <div className="text-[11px] text-muted-foreground space-y-0.5 mb-2">
          <div>
            <span>🏥</span>{' '}
            <span>+{formatHealthMinutes(healthMinutes, timeUnits)}</span>
          </div>
          <div>
            <span>💰</span>{' '}
            <span>{formatCurrency(costSaving, false)}</span>
          </div>
          <div>
            <span>📈</span>{' '}
            <span>{formatCurrency(incomeGain, false)}{timeUnits.perDay}</span>
          </div>
        </div>

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
