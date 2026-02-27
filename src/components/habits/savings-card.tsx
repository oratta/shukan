'use client';

import { useTranslations } from 'next-intl';
import { formatHealthMinutes, formatCurrency } from '@/lib/impact';
import type { LifeImpactSavings } from '@/types/impact';

interface SavingsCardProps {
  savings: LifeImpactSavings;
}

export function SavingsCard({ savings }: SavingsCardProps) {
  const t = useTranslations('impact');
  const timeUnits = { min: t('minuteUnit'), hour: t('hourUnit'), day: t('dayUnit') };

  if (savings.completedDays === 0) return null;

  return (
    <div className="rounded-lg bg-[#F0F7F2] p-3">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#3D8A5A]">
        {t('savings')} ({savings.completedDays}{t('daysUnit')})
      </p>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span>🏥</span>
          <span className="font-medium text-[#3D8A5A]">
            {formatHealthMinutes(savings.healthMinutes, timeUnits)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span>💰</span>
          <span className="font-medium text-[#3D8A5A]">
            {formatCurrency(savings.costSaving)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span>📈</span>
          <span className="font-medium text-[#3D8A5A]">
            {formatCurrency(savings.incomeGain)}
          </span>
        </span>
      </div>
    </div>
  );
}
