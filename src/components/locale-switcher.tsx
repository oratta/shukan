'use client';

import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

export function LocaleSwitcher() {
  const locale = useLocale();
  // ロケール変更は useSettings 経由（cookie 即反映 ＋ ログイン中は user_settings へ同期 / #24）
  const { saveLocale } = useSettings();

  const toggleLocale = () => {
    void saveLocale(locale === 'en' ? 'ja' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="text-xs font-medium"
    >
      {locale === 'en' ? 'JA' : 'EN'}
    </Button>
  );
}
