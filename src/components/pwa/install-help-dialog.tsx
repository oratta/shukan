'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { detectPlatform, type PwaPlatform } from '@/lib/pwa/platform';
import type { BeforeInstallPromptEvent } from '@/lib/pwa/types';
import { IosInstallInstructions } from './ios-install-instructions';
import { AndroidInstallButton } from './android-install-button';

interface InstallHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Settings-screen dialog reusing the same guidance as the banner.
 * Always reachable (no completion-trigger / dismiss suppression).
 * Standalone → shows "already added".
 */
export function InstallHelpDialog({ open, onOpenChange }: InstallHelpDialogProps) {
  const t = useTranslations('pwa');
  const [platform, setPlatform] = useState<PwaPlatform>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setPlatform(detectPlatform(ua, !!isStandalone));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" aria-hidden="true" />
            {t('help.dialogTitle')}
          </DialogTitle>
          {platform === 'standalone' && (
            <DialogDescription>{t('help.installed')}</DialogDescription>
          )}
        </DialogHeader>
        {platform === 'ios-safari' && <IosInstallInstructions />}
        {platform === 'android-chrome' && (
          <AndroidInstallButton
            deferredPrompt={deferredPrompt}
            onPrompted={() => setDeferredPrompt(null)}
          />
        )}
        {platform === 'other' && (
          <p className="text-sm text-muted-foreground">{t('help.unsupported')}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
