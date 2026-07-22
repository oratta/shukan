'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CircleHelp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { splitHelpBody, type HelpTopicId } from '@/data/help-topics';

interface HelpButtonProps {
  /** 表示するヘルプトピック。マスターは src/data/help-topics.ts と messages の help.topics.* */
  topic: HelpTopicId;
  /** ボタンの外側余白などの調整用。見た目自体を差し替える場合は既定クラスごと上書きされる */
  className?: string;
  /** アイコンサイズの調整用（既定 size-4） */
  iconClassName?: string;
}

/**
 * はてなボタン＋共通説明モーダル。
 *
 * ラベルや見出しの隣に置くと、タップでそのトピックの説明モーダルを開く。
 * クリック可能なカードの内側でも安全（stopPropagation 済み）。
 * 使い方: <HelpButton topic="streak" />
 */
export function HelpButton({ topic, className, iconClassName }: HelpButtonProps) {
  const t = useTranslations('help');
  const [open, setOpen] = useState(false);

  const title = t(`topics.${topic}.title`);
  const paragraphs = splitHelpBody(t(`topics.${topic}.body`));

  return (
    <>
      <button
        type="button"
        aria-label={t('ariaLabel', { title })}
        aria-haspopup="dialog"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className
        )}
      >
        <CircleHelp className={cn('size-4', iconClassName)} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {paragraphs.map((paragraph, i) =>
              i === 0 ? (
                <DialogDescription key={i} className="leading-relaxed">
                  {paragraph}
                </DialogDescription>
              ) : (
                <p key={i}>{paragraph}</p>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
