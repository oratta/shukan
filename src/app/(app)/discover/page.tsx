'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { getArticleList } from '@/data/impact-articles';
import { formatCurrency, formatHealthMinutes, calculateAnnualImpact } from '@/lib/impact';
import { EvidenceArticleSheet } from '@/components/habits/evidence-article-sheet';
import { HabitForm } from '@/components/habits/habit-form';
import { KpiIcon } from '@/components/onboarding/kpi-icon';
import { EVIDENCE_HERO_IMAGES as HERO_IMAGES, getEvidenceHeroGradient } from '@/data/evidence-hero-images';
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
            gradient={getEvidenceHeroGradient(article.id) ?? 'from-gray-400 to-gray-600'}
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
