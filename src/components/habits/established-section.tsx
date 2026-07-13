'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { HeartPulse, Wallet, TrendingUp, Smile, CheckCircle2 } from 'lucide-react';
import { HabitIcon } from '@/components/ui/habit-icon';
import { Card } from '@/components/ui/card';
import { calculateDailyImpact } from '@/lib/impact';
import { computeHabitLifetimeEffect } from '@/lib/diagnosis-v3';
import { getArticle } from '@/data/impact-articles';
import { EstimateDisclaimer } from '@/components/habits/estimate-disclaimer';
import type { KpiKey } from '@/data/kpi/catalog';
import type { UserProfile } from '@/lib/supabase/profiles';
import type { Habit } from '@/types/habit';

// 表示順（stats の並びに合わせる: 健康寿命 → 出費削減 → 増える収入 → 前向きな気持ちの時間）。
const KPI_DISPLAY_ORDER: KpiKey[] = ['health_lifespan', 'cost_saving', 'earning', 'positive_mood'];

const KPI_META: Record<KpiKey, { labelKey: string; Icon: typeof HeartPulse }> = {
  health_lifespan: { labelKey: 'impact.dailyHealth', Icon: HeartPulse },
  cost_saving: { labelKey: 'impact.dailyCost', Icon: Wallet },
  earning: { labelKey: 'impact.dailyIncome', Icon: TrendingUp },
  positive_mood: { labelKey: 'impact.dailyPositiveMood', Icon: Smile },
};

interface EstablishedSectionProps {
  habits: Habit[];
  /** プロフィール（未設定は既定値でフォールバック。change-5 で個人化）。 */
  profile?: UserProfile | null;
}

/**
 * 「身についた習慣」セクション（3場面構造の established 場面）。
 * チェックボックスなし。各習慣が「残りの人生にもたらすこと」＝生涯効果（4KPI・達成率100%）を表示する。
 */
export function EstablishedSection({ habits, profile = null }: EstablishedSectionProps) {
  const t = useTranslations();

  const items = useMemo(
    () =>
      habits.map((habit) => {
        const perDay = calculateDailyImpact(habit.evidences, getArticle);
        const lifetime = computeHabitLifetimeEffect(perDay, profile);
        return { habit, lifetime };
      }),
    [habits, profile]
  );

  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-success" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t('habits.establishedSectionTitle')}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('habits.establishedSectionDesc')}</p>

      <div className="space-y-3">
        {items.map(({ habit, lifetime }) => (
          <Card key={habit.id} className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <HabitIcon name={habit.icon} size={20} />
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{habit.name}</p>
            </div>

            <p className="text-xs font-medium text-muted-foreground">
              {t('habits.lifetimeEffectHeading')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {KPI_DISPLAY_ORDER.map((kpi) => {
                const value = lifetime.byKpi[kpi];
                // 効果 0 の軸（未設定の positive_mood 等）は表示しない。
                if (value.raw <= 0) return null;
                const { labelKey, Icon } = KPI_META[kpi];
                return (
                  <div
                    key={kpi}
                    className="flex items-center gap-2 rounded-lg bg-impact-bg px-3 py-2"
                  >
                    <Icon className="size-4 shrink-0 text-impact-cost" />
                    <div className="min-w-0">
                      <div className="truncate text-[10px] text-impact-cost/70">
                        {t(labelKey)}
                      </div>
                      <div className="text-sm font-bold text-impact-cost">
                        {value.display}
                        <span className="ml-0.5 text-[10px] font-medium">{value.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 景表法・打消し表示対応（issue #39）: 生涯効果の推定値直下の近接注記 */}
            <EstimateDisclaimer />
          </Card>
        ))}
      </div>
    </section>
  );
}
