'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { getArticleList } from '@/data/impact-articles';
import { formatCurrency, formatHealthMinutes, calculateAnnualImpact } from '@/lib/impact';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { HabitForm } from '@/components/habits/habit-form';
import { KpiIcon } from '@/components/onboarding/kpi-icon';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';
import type { KpiKey } from '@/data/kpi/catalog';
import type { HabitInsertInput } from '@/types/habit';
import type { ArticleId } from '@/types/impact';

/**
 * Discover の KPI 4軸（オンボと同じ正式名・KpiIcon）。ラベルは impact.* を再利用する
 * （impact.dailyHealth 等が「健康寿命/出費削減/増える収入/前向きな気持ちの時間」の正式名）。
 * param は並び替え（F13）に使う calculationParams のキー。
 */
const DISCOVER_KPIS: {
  key: KpiKey;
  icon: string;
  labelKey: string;
  param: 'dailyHealthMinutes' | 'dailyPositiveMoodMinutes' | 'dailyCostSaving' | 'dailyIncomeGain';
}[] = [
  { key: 'health_lifespan', icon: 'heart-pulse', labelKey: 'impact.dailyHealth', param: 'dailyHealthMinutes' },
  { key: 'positive_mood', icon: 'smile', labelKey: 'impact.dailyPositiveMood', param: 'dailyPositiveMoodMinutes' },
  { key: 'cost_saving', icon: 'piggy-bank', labelKey: 'impact.dailyCost', param: 'dailyCostSaving' },
  { key: 'earning', icon: 'trending-up', labelKey: 'impact.dailyIncome', param: 'dailyIncomeGain' },
];

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

export default function DiscoverPage() {
  const t = useTranslations();
  const { addHabit } = useHabits();
  const [selectedArticleId, setSelectedArticleId] = useState<ArticleId | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [prefilledEvidences, setPrefilledEvidences] = useState<{ articleId: string; weight: number }[]>([]);
  const [prefilledName, setPrefilledName] = useState('');
  // F13: 上部で選んだ KPI（既定は健康寿命）。この KPI への効果が大きい順にカードを並べる。
  const [selectedKpi, setSelectedKpi] = useState<KpiKey>('health_lifespan');

  const articles = useMemo(() => getArticleList(), []);

  // F13: 選んだ KPI の per-day 効果が大きい順（安定ソート＝同値は元の並びを保持）。
  const sortedArticles = useMemo(() => {
    const param = DISCOVER_KPIS.find((k) => k.key === selectedKpi)!.param;
    return [...articles].sort(
      (a, b) => b.calculationParams[param] - a.calculationParams[param]
    );
  }, [articles, selectedKpi]);

  const timeUnits = useMemo(
    () => ({
      min: t('impact.minuteUnit'),
      hour: t('impact.hourUnit'),
      day: t('impact.dayUnit'),
    }),
    [t]
  );

  const perYear = t('discover.perYear');

  // KPI 正式名（アクセシビリティラベル用）。impact.* を再利用。
  const kpiNames = useMemo(
    () =>
      Object.fromEntries(DISCOVER_KPIS.map((k) => [k.key, t(k.labelKey)])) as Record<KpiKey, string>,
    [t]
  );

  const handleAddFromArticle = useCallback((articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    setPrefilledEvidences([{ articleId, weight: 100 }]);
    setPrefilledName(article?.name ?? '');
    setSelectedArticleId(null);
    setFormOpen(true);
  }, [articles]);

  // F14: ゼロから習慣を組み立てる（既存 HabitForm の新規作成モード・プレフィルなし）。
  const handleCreateFromScratch = useCallback(() => {
    setPrefilledEvidences([]);
    setPrefilledName('');
    setSelectedArticleId(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (
      data: HabitInsertInput,
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

      {/* F14: ゼロから習慣をつくる（大きな＋ボタン） */}
      <button
        type="button"
        onClick={handleCreateFromScratch}
        className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-left transition-colors hover:border-primary hover:bg-primary/10 active:scale-[0.99]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Plus className="size-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold">{t('discover.createFromScratch')}</span>
          <span className="block text-xs text-muted-foreground">
            {t('discover.createFromScratchSub')}
          </span>
        </span>
      </button>

      {/* F11/F13: KPI 選択（4軸）→ その KPI への効果順にソート */}
      <div className="mb-4">
        <p className="mb-2 text-xs text-muted-foreground">{t('discover.sortLead')}</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {DISCOVER_KPIS.map((k) => {
            const selected = selectedKpi === k.key;
            return (
              <button
                key={k.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedKpi(k.key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                )}
              >
                <KpiIcon
                  name={k.icon}
                  className={cn('size-3.5', selected ? 'text-primary' : 'text-muted-foreground')}
                />
                {t(k.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* F12: 写真主役のコンパクトカード（2カラム）・選んだ KPI 効果順 */}
      <div className="grid grid-cols-2 gap-3">
        {sortedArticles.map((article) => (
          <ArticleCard
            key={article.id}
            articleId={article.id}
            name={article.name}
            calculationParams={article.calculationParams}
            heroImage={HERO_IMAGES[article.id]}
            gradient={GRADIENT_MAP[article.id] ?? 'from-gray-400 to-gray-600'}
            confidenceLabel={t(`discover.confidence.${article.confidenceLevel}`)}
            timeUnits={timeUnits}
            perYear={perYear}
            kpiNames={kpiNames}
            selectedKpi={selectedKpi}
            onTap={setSelectedArticleId}
          />
        ))}
      </div>

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
  calculationParams: {
    dailyHealthMinutes: number;
    dailyCostSaving: number;
    dailyIncomeGain: number;
    dailyPositiveMoodMinutes: number;
  };
  heroImage?: string;
  gradient: string;
  confidenceLabel: string;
  timeUnits: { min: string; hour: string; day: string };
  perYear: string;
  kpiNames: Record<KpiKey, string>;
  selectedKpi: KpiKey;
  onTap: (id: ArticleId) => void;
}

function ArticleCard({
  articleId,
  name,
  calculationParams,
  heroImage,
  gradient,
  confidenceLabel,
  timeUnits,
  perYear,
  kpiNames,
  selectedKpi,
  onTap,
}: ArticleCardProps) {
  const annual = calculateAnnualImpact({
    healthMinutes: calculationParams.dailyHealthMinutes,
    costSaving: calculationParams.dailyCostSaving,
    incomeGain: calculationParams.dailyIncomeGain,
    positiveMoodMinutes: calculationParams.dailyPositiveMoodMinutes,
  });

  // 各 KPI のコンパクト表記（値0は出さない・オンボ[4]と同じ「アイコン＋+数字」トーン）。
  const chips = DISCOVER_KPIS.map((k) => {
    let value: string | null = null;
    switch (k.key) {
      case 'health_lifespan':
        value = annual.healthMinutes > 0
          ? `+${formatHealthMinutes(annual.healthMinutes, timeUnits)}${perYear}`
          : null;
        break;
      case 'positive_mood':
        value = annual.positiveMoodMinutes > 0
          ? `+${formatHealthMinutes(annual.positiveMoodMinutes, timeUnits)}${perYear}`
          : null;
        break;
      case 'cost_saving':
        value = annual.costSaving > 0 ? `${formatCurrency(annual.costSaving)}${perYear}` : null;
        break;
      case 'earning':
        value = annual.incomeGain > 0 ? `${formatCurrency(annual.incomeGain)}${perYear}` : null;
        break;
    }
    return { ...k, value };
  }).filter((c) => c.value !== null);

  return (
    <button
      type="button"
      onClick={() => onTap(articleId)}
      className="group relative flex h-44 w-full flex-col justify-end overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-border/40 transition-transform active:scale-[0.97]"
    >
      {/* 背景写真（無ければグラデーション） */}
      {heroImage ? (
        <img
          src={heroImage}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
      )}

      {/* 可読性のためのグラデーションオーバーレイ（写真を主役に、テキストを重ねる） */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

      {/* 信頼度バッジ（写真上・半透明） */}
      <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
        {confidenceLabel}
      </span>

      {/* テキスト（下部・白） */}
      <div className="relative z-10 p-3">
        <p className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-sm">
          {name}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {chips.map((c) => {
            const isSelected = c.key === selectedKpi;
            return (
              <span
                key={c.key}
                aria-label={kpiNames[c.key]}
                className={cn(
                  'flex items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums',
                  isSelected ? 'rounded bg-white/20 px-1 text-white' : 'text-white/75'
                )}
              >
                <KpiIcon name={c.icon} className="size-3" />
                {c.value}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
