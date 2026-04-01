'use client';

import { useTranslations } from 'next-intl';
import { PiggyBank, HeartPulse, Wallet, TrendingUp } from 'lucide-react';
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
    <div className="flex items-center justify-between rounded-xl border border-success/20 bg-success/10 px-3.5 py-2.5">
      <div className="flex items-center gap-1.5">
        <PiggyBank className="size-4 text-success" />
        <span className="text-[11px] font-semibold text-success">
          {t('cumulative')}
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-[11px] font-medium text-[#6D6C6A]">
        <span className="flex items-center gap-0.5"><HeartPulse className="size-3" /> {formatHealthMinutes(savings.healthMinutes, timeUnits)}</span>
        <span className="flex items-center gap-0.5"><Wallet className="size-3" /> {formatCurrency(savings.costSaving)}</span>
        <span className="flex items-center gap-0.5"><TrendingUp className="size-3" /> {formatCurrency(savings.incomeGain)}</span>
      </div>
    </div>
  );
}
