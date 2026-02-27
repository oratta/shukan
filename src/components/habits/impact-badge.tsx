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
      <div className="flex items-end gap-4 text-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-[#B8860B]">+{dailyHealthMinutes}{t('minuteUnit')}</span>
          <span className="text-[10px] text-[#B8860B]/60">{t('dailyHealth')}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[#B8860B]">¥{dailyCostSaving.toLocaleString()}</span>
          <span className="text-[10px] text-[#B8860B]/60">{t('dailyCost')}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[#B8860B]">¥{dailyIncomeGain.toLocaleString()}</span>
          <span className="text-[10px] text-[#B8860B]/60">{t('dailyIncome')}</span>
        </div>
        <span className="ml-auto text-xs text-[#B8860B]/50">{t('perDay')}</span>
      </div>
    </button>
  );
}
