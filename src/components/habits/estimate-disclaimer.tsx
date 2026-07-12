'use client';

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimateDisclaimerProps {
  /**
   * 'default' = 通常面（中立の muted 色）。'onImage' = 写真/ガラス面の上（白系）。
   * 注記は中立情報なので緑（ポジティブ専用色）は使わない。
   */
  surface?: 'default' | 'onImage';
  /** true なら「AI による推定を含む」旨を併記する（LLM 生成の推論段落がある画面用） */
  withAiNote?: boolean;
  className?: string;
}

/**
 * 推定値の近接注記（景表法・打消し表示対応 / issue #39）。
 * 「研究の集団平均に基づく試算であり、個人の結果を保証するものではない（個人差がある）」を
 * 推定値と同一ビューポート内に表示するための共通コンポーネント。
 * 文言は messages（impact.estimateDisclaimer / impact.aiEstimateNote）経由で ja/en 対応。
 */
export function EstimateDisclaimer({
  surface = 'default',
  withAiNote = false,
  className,
}: EstimateDisclaimerProps) {
  const t = useTranslations('impact');
  const light = surface === 'onImage';

  return (
    <p
      className={cn(
        'flex items-start gap-1 text-[10px] leading-relaxed',
        light ? 'text-white/70' : 'text-muted-foreground',
        className
      )}
    >
      <Info className="mt-[1px] size-3 shrink-0" aria-hidden />
      <span>
        {t('estimateDisclaimer')}
        {withAiNote && <> {t('aiEstimateNote')}</>}
      </span>
    </p>
  );
}
