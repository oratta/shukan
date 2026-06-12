'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BeforeInstallPromptEvent } from '@/lib/pwa/types';

interface AndroidInstallButtonProps {
  /** Captured beforeinstallprompt event, or null if not yet fired. */
  deferredPrompt: BeforeInstallPromptEvent | null;
  /** Called after prompt() resolves, so the parent can clear the consumed event. */
  onPrompted?: () => void;
}

/**
 * Android Chrome: a single "Add to Home Screen" button that fires the native
 * install prompt. Pure presentation — the only behavior is calling prompt() on
 * the event handed in by the parent. Disabled until the event is captured.
 */
export function AndroidInstallButton({ deferredPrompt, onPrompted }: AndroidInstallButtonProps) {
  const t = useTranslations('pwa');

  const handleClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    onPrompted?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('android.intro')}</p>
      <Button onClick={handleClick} disabled={!deferredPrompt} className="w-full">
        <Download className="mr-2 size-4" />
        {t('android.button')}
      </Button>
    </div>
  );
}
