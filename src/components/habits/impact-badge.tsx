'use client';

import { useTranslations } from 'next-intl';
import type { LifeImpactArticle } from '@/types/impact';

interface ImpactBadgeProps {
  article: LifeImpactArticle;
  onTap: () => void;
}

export function ImpactBadge({ article, onTap }: ImpactBadgeProps) {
  const t = useTranslations('impact');
  const { dailyHealthMinutes, dailyCostSaving, dailyIncomeGain } =
    article.calculationParams;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      className="w-full rounded-lg bg-[#FFF8F0] p-3 text-left transition-colors hover:bg-[#FFF0E0]"
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#B8860B]">
        {t('title')} {t('perDay')}
      </p>
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1">
          <span>🏥</span>
          <span className="font-medium text-[#B8860B]">+{dailyHealthMinutes}{t('minuteUnit')}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>💰</span>
          <span className="font-medium text-[#B8860B]">¥{dailyCostSaving.toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>📈</span>
          <span className="font-medium text-[#B8860B]">¥{dailyIncomeGain.toLocaleString()}</span>
        </span>
      </div>
    </button>
  );
}
