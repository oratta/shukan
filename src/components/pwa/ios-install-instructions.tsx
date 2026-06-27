'use client';

import { useTranslations } from 'next-intl';
import { Share, SquarePlus } from 'lucide-react';

/**
 * iOS Safari: 2-step illustrated "Add to Home Screen" guide.
 * Pure presentation — no branching logic.
 */
export function IosInstallInstructions() {
  const t = useTranslations('pwa');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('ios.intro')}</p>
      <ol className="space-y-2">
        <li className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            1
          </span>
          <Share className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm">{t('ios.step1')}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            2
          </span>
          <SquarePlus className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm">{t('ios.step2')}</span>
        </li>
      </ol>
    </div>
  );
}
