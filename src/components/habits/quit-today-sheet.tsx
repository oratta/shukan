'use client';

import { useTranslations } from 'next-intl';
import { Flame, CheckCircle2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface QuitTodaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  onUrge: () => void;
  onDailyDone: () => void;
}

export function QuitTodaySheet({
  open,
  onOpenChange,
  habitName,
  onUrge,
  onDailyDone,
}: QuitTodaySheetProps) {
  const t = useTranslations('habits');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{habitName}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 py-4">
          <Button
            variant="outline"
            className="flex items-center gap-3 h-auto py-4 justify-start"
            onClick={() => {
              onOpenChange(false);
              onUrge();
            }}
          >
            <Flame className="size-5 text-orange-500 shrink-0" />
            <div className="text-left">
              <div className="font-medium">{t('urgeButton')}</div>
              <div className="text-xs text-muted-foreground">{t('quitUrgeDesc')}</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-3 h-auto py-4 justify-start"
            onClick={() => {
              onDailyDone();
              onOpenChange(false);
            }}
          >
            <CheckCircle2 className="size-5 text-green-500 shrink-0" />
            <div className="text-left">
              <div className="font-medium">{t('quitDailyOk')}</div>
              <div className="text-xs text-muted-foreground">{t('quitDailyOkDesc')}</div>
            </div>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
