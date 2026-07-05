'use client';

import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp, Smile } from 'lucide-react';
import { calculateDailyImpact, calculateAnnualImpact, formatHealthMinutes, formatCurrency, type DailyImpact } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import { cn } from '@/lib/utils';
import type { HabitEvidence, LifeImpactArticle } from '@/types/impact';

interface ImpactBadgeFromArticleProps {
  article: LifeImpactArticle;
  mode?: 'daily' | 'annual';
  useMan?: boolean;
  onTap?: () => void;
  /** 'onImage' は写真背景の上に載せる用（緑ボーダーを廃し白ガラス＋白文字）。既定は 'default'。 */
  surface?: 'default' | 'onImage';
}

interface ImpactBadgeFromEvidencesProps {
  evidences: HabitEvidence[];
  mode?: 'daily' | 'annual';
  useMan?: boolean;
  onTap?: () => void;
  /** 'onImage' は写真背景の上に載せる用（緑ボーダーを廃し白ガラス＋白文字）。既定は 'default'。 */
  surface?: 'default' | 'onImage';
}

interface ImpactBadgeFromValuesProps {
  daily: DailyImpact;
  mode?: 'daily' | 'annual';
  useMan?: boolean;
  onTap?: () => void;
  /** 'onImage' は写真背景の上に載せる用（緑ボーダーを廃し白ガラス＋白文字）。既定は 'default'。 */
  surface?: 'default' | 'onImage';
}

type ImpactBadgeProps =
  | ImpactBadgeFromArticleProps
  | ImpactBadgeFromEvidencesProps
  | ImpactBadgeFromValuesProps;

function getDailyValues(props: ImpactBadgeProps): DailyImpact | null {
  if ('daily' in props) return props.daily;
  if ('evidences' in props) {
    if (props.evidences.length === 0) return null;
    return calculateDailyImpact(props.evidences, getArticle);
  }
  if ('article' in props) {
    const p = props.article.calculationParams;
    return {
      healthMinutes: p.dailyHealthMinutes,
      costSaving: p.dailyCostSaving,
      incomeGain: p.dailyIncomeGain,
      positiveMoodMinutes: p.dailyPositiveMoodMinutes,
    };
  }
  return null;
}

export function ImpactBadge(props: ImpactBadgeProps) {
  const t = useTranslations('impact');
  const daily = getDailyValues(props);
  if (!daily) return null;

  const mode = props.mode ?? 'annual';
  const values = mode === 'annual' ? calculateAnnualImpact(daily) : daily;
  const periodLabel = mode === 'annual' ? t('perYear') : t('perDay');
  const useMan = props.useMan ?? true;

  // 写真背景の上（onImage）では緑ボーダー/緑地をやめ、白ガラス＋白文字で馴染ませる（F17）。
  const onImage = props.surface === 'onImage';
  const wrapperSurface = onImage
    ? 'border-white/20 bg-white/10 backdrop-blur-sm'
    : 'border-success/20 bg-success/5';
  const iconClass = onImage ? 'text-white' : 'text-success';
  const valueClass = onImage ? 'text-white' : 'text-success';
  const labelClass = onImage ? 'text-white/70' : 'text-[#9C9B99]';

  const Wrapper = props.onTap ? 'button' : 'div';
  const wrapperProps = props.onTap
    ? {
        type: 'button' as const,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          props.onTap?.();
        },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left',
        wrapperSurface
      )}
    >
      <div className="flex flex-col items-center gap-0.5">
        <HeartPulse className={cn('size-4', iconClass)} />
        <span className={cn('text-sm font-bold', valueClass)}>
          +{formatHealthMinutes(values.healthMinutes)}
        </span>
        <span className={cn('text-[9px] font-medium', labelClass)}>
          {t('dailyHealth')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <Wallet className={cn('size-4', iconClass)} />
        <span className={cn('text-sm font-bold', valueClass)}>
          {formatCurrency(values.costSaving, useMan)}
        </span>
        <span className={cn('text-[9px] font-medium', labelClass)}>
          {t('dailyCost')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <TrendingUp className={cn('size-4', iconClass)} />
        <span className={cn('text-sm font-bold', valueClass)}>
          {formatCurrency(values.incomeGain, useMan)}
        </span>
        <span className={cn('text-[9px] font-medium', labelClass)}>
          {t('dailyIncome')}
        </span>
      </div>
      {/* 4軸目「前向きな気持ちの時間」: この習慣インパクト表示（ホーム展開／習慣詳細）では
          値0でも常時表示し他3軸と揃える（F16・F10 と同方針）。 */}
      <div className="flex flex-col items-center gap-0.5">
        <Smile className={cn('size-4', iconClass)} />
        <span className={cn('text-sm font-bold', valueClass)}>
          +{formatHealthMinutes(values.positiveMoodMinutes)}
        </span>
        <span className={cn('text-[9px] font-medium', labelClass)}>
          {t('dailyPositiveMood')}
        </span>
      </div>
      <span className={cn('text-xs font-medium', labelClass)}>{periodLabel}</span>
    </Wrapper>
  );
}
