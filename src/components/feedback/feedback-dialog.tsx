'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquarePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_BODY_MAX_LENGTH,
  canSubmitFeedback,
  type FeedbackCategory,
} from '@/lib/feedback';
import { submitAppFeedback } from '@/lib/supabase/app-feedbacks';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * アプリ内フィードバックフォーム（issue #19）。
 * Header の常設ボタンと Settings ページの導線から開く共有ダイアログ。
 * 送信成功時は完了メッセージを表示してフォームをクリアする。
 */
export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations('feedback');
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const canSubmit = canSubmitFeedback({ category, body }) && !!user && !submitting;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // 閉じたら完了/エラー表示をリセット（入力途中の本文は保持する）
      setSubmitted(false);
      setSubmitError(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);
    setSubmitError(false);
    try {
      await submitAppFeedback(user.id, category, body);
      // 成功: 完了フィードバックを表示してフォームをクリア
      setBody('');
      setCategory('bug');
      setSubmitted(true);
    } catch {
      // ネットワークエラー・RLS 拒否時。入力は保持して再送可能にする。
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="size-5 text-primary" aria-hidden="true" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* カテゴリ選択 */}
          <div className="grid grid-cols-3 gap-2">
            {FEEDBACK_CATEGORIES.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setSubmitted(false);
                    setCategory(c);
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/30'
                      : 'border-border bg-card text-foreground hover:border-primary/40'
                  )}
                >
                  {t(`category.${c}`)}
                </button>
              );
            })}
          </div>

          {/* 本文 */}
          <Textarea
            value={body}
            maxLength={FEEDBACK_BODY_MAX_LENGTH}
            rows={5}
            placeholder={t('placeholder')}
            aria-label={t('bodyLabel')}
            onChange={(e) => {
              setSubmitted(false);
              setBody(e.target.value);
            }}
          />

          {submitted && (
            <p role="status" className="text-sm text-success">
              {t('success')}
            </p>
          )}
          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {t('error')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
