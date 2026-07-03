'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { KpiIcon } from '@/components/onboarding/kpi-icon';
import { resolveTrackedKpiDefinitions } from '@/lib/profile-settings';
import type { UserProfile } from '@/lib/supabase/profiles';

interface TrackedKpisCardProps {
  /** プロフィール（未設定は全4 KPI にフォールバック）。 */
  profile?: UserProfile | null;
}

/**
 * ホーム上部に「あなたが大切にしていること」＝オンボで選んだ KPI（tracked_kpis）を表示する（change-5 / AC#12）。
 * KPI 名は正準 onboarding.kpi.*.name を参照する（造語を作らない）。
 */
export function TrackedKpisCard({ profile = null }: TrackedKpisCardProps) {
  const t = useTranslations();

  const kpis = useMemo(
    () => resolveTrackedKpiDefinitions(profile?.trackedKpis),
    [profile]
  );

  if (kpis.length === 0) return null;

  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('habits.trackedKpisTitle')}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {kpis.map((kpi) => (
          <li
            key={kpi.key}
            className="flex items-center gap-1.5 rounded-full bg-impact-bg px-3 py-1.5 text-xs font-medium text-impact-cost"
          >
            <KpiIcon name={kpi.icon} className="size-3.5 shrink-0" />
            {t(`onboarding.kpi.${kpi.key}.name`)}
          </li>
        ))}
      </ul>
    </Card>
  );
}
