'use client';

import { useTranslations } from 'next-intl';
import { calculateDailyImpact, type DailyImpact } from '@/lib/impact';
import { getArticle } from '@/data/impact-articles';
import type { HabitEvidence, LifeImpactArticle } from '@/types/impact';

interface ImpactBadgeFromArticleProps {
  article: LifeImpactArticle;
  onTap?: () => void;
}

interface ImpactBadgeFromEvidencesProps {
  evidences: HabitEvidence[];
  onTap?: () => void;
}

interface ImpactBadgeFromValuesProps {
  daily: DailyImpact;
  onTap?: () => void;
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
    };
  }
  return null;
}

export function ImpactBadge(props: ImpactBadgeProps) {
  const t = useTranslations('impact');
  const daily = getDailyValues(props);
  if (!daily) return null;

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
      className="flex w-full items-center justify-between rounded-xl border border-[#D4E8DA] bg-[#F8FBF9] px-3.5 py-3 text-left"
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base">🏥</span>
        <span className="text-sm font-bold text-[#3D8A5A]">
          +{Math.round(daily.healthMinutes)}{t('minuteUnit')}
        </span>
        <span className="text-[9px] font-medium text-[#9C9B99]">
          {t('dailyHealth')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base">💰</span>
        <span className="text-sm font-bold text-[#3D8A5A]">
          ¥{Math.round(daily.costSaving).toLocaleString()}
        </span>
        <span className="text-[9px] font-medium text-[#9C9B99]">
          {t('dailyCost')}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-base">📈</span>
        <span className="text-sm font-bold text-[#3D8A5A]">
          ¥{Math.round(daily.incomeGain).toLocaleString()}
        </span>
        <span className="text-[9px] font-medium text-[#9C9B99]">
          {t('dailyIncome')}
        </span>
      </div>
      <span className="text-xs font-medium text-[#9C9B99]">{t('perDay')}</span>
    </Wrapper>
  );
}
