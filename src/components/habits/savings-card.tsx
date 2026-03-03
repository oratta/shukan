'use client';

import { useTranslations } from 'next-intl';
import { PiggyBank } from 'lucide-react';
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
    <div className="flex items-center justify-between rounded-xl border border-[#D4E8DA] bg-[#F0F7F2] px-3.5 py-2.5">
      <div className="flex items-center gap-1.5">
        <PiggyBank className="size-4 text-[#3D8A5A]" />
        <span className="text-[11px] font-semibold text-[#3D8A5A]">
          {t('cumulative')}
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#6D6C6A]">
        <span>🏥 {formatHealthMinutes(savings.healthMinutes, timeUnits)}</span>
        <span>💰 {formatCurrency(savings.costSaving)}</span>
        <span>📈 {formatCurrency(savings.incomeGain)}</span>
      </div>
    </div>
  );
}
