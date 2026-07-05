'use client';

import { useTranslations } from 'next-intl';
import { PiggyBank, HeartPulse, Wallet, TrendingUp, Smile } from 'lucide-react';
import { formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { cn } from '@/lib/utils';
import type { LifeImpactSavings } from '@/types/impact';

interface SavingsCardProps {
  savings: LifeImpactSavings;
  /**
   * 'default' = 自前の箱（緑地）。'onImage' = 写真上の白ガラス箱。
   * 'bare' = 箱なし（親のガラスボックスに内包・白文字）。既定は 'default'。
   */
  surface?: 'default' | 'onImage' | 'bare';
}

export function SavingsCard({ savings, surface = 'default' }: SavingsCardProps) {
  const t = useTranslations('impact');
  const timeUnits = { min: t('minuteUnit'), hour: t('hourUnit'), day: t('dayUnit') };

  if (savings.completedDays === 0) return null;

  const onImage = surface === 'onImage';
  const bare = surface === 'bare';
  const light = onImage || bare;
  const chrome = bare
    ? ''
    : onImage
      ? 'rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-3.5 py-2.5'
      : 'rounded-xl border border-success/20 bg-success/10 px-3.5 py-2.5';

  return (
    <div className={cn('flex items-center justify-between', chrome)}>
      <div className="flex items-center gap-1.5">
        <PiggyBank className={cn('size-4', light ? 'text-white' : 'text-success')} />
        <span className={cn('text-[11px] font-semibold', light ? 'text-white' : 'text-success')}>
          {t('cumulative')}
        </span>
      </div>
      <div className={cn('flex items-center gap-2.5 text-[11px] font-medium', light ? 'text-white/80' : 'text-[#6D6C6A]')}>
        <span className="flex items-center gap-0.5"><HeartPulse className="size-3" /> {formatHealthMinutes(savings.healthMinutes, timeUnits)}</span>
        <span className="flex items-center gap-0.5"><Wallet className="size-3" /> {formatCurrency(savings.costSaving)}</span>
        <span className="flex items-center gap-0.5"><TrendingUp className="size-3" /> {formatCurrency(savings.incomeGain)}</span>
        {savings.positiveMoodMinutes > 0 && (
          <span className="flex items-center gap-0.5" aria-label={t('dailyPositiveMood')}><Smile className="size-3" /> {formatHealthMinutes(savings.positiveMoodMinutes, timeUnits)}</span>
        )}
      </div>
    </div>
  );
}
