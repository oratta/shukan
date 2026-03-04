'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Trash2, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { getArticle } from '@/data/impact-articles';
import { calculateAnnualImpact, formatHealthMinutes, formatCurrency } from '@/lib/impact';
import { EvidencePicker } from '@/components/habits/evidence-picker';
import { HelpButton } from '@/components/ui/help-button';
import type { HabitEvidence, ArticleId } from '@/types/impact';

interface EvidenceManagerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitId: string;
  evidences: HabitEvidence[];
  onAddEvidence: (habitId: string, articleId: string, weight?: number) => void;
  onRemoveEvidence: (habitId: string, evidenceId: string) => void;
  onSetWeight: (habitId: string, evidenceId: string, weight: number) => void;
}

export function EvidenceManagerSheet({
  open,
  onOpenChange,
  habitId,
  evidences,
  onAddEvidence,
  onRemoveEvidence,
  onSetWeight,
}: EvidenceManagerSheetProps) {
  const t = useTranslations('evidence');
  const tImpact = useTranslations('impact');
  const [pickerOpen, setPickerOpen] = useState(false);

  const resolvedEvidences = useMemo(() => {
    return evidences
      .map((ev) => {
        const article = getArticle(ev.articleId);
        return article ? { evidence: ev, article } : null;
      })
      .filter(Boolean) as { evidence: HabitEvidence; article: NonNullable<ReturnType<typeof getArticle>> }[];
  }, [evidences]);

  const totalAnnualImpact = useMemo(() => {
    let healthMinutes = 0;
    let costSaving = 0;
    let incomeGain = 0;
    for (const { evidence, article } of resolvedEvidences) {
      const w = evidence.weight / 100;
      const annual = calculateAnnualImpact({
        healthMinutes: article.calculationParams.dailyHealthMinutes * w,
        costSaving: article.calculationParams.dailyCostSaving * w,
        incomeGain: article.calculationParams.dailyIncomeGain * w,
      });
      healthMinutes += annual.healthMinutes;
      costSaving += annual.costSaving;
      incomeGain += annual.incomeGain;
    }
    return { healthMinutes, costSaving, incomeGain };
  }, [resolvedEvidences]);

  const handlePickerSelect = useCallback(
    (articleIds: string[]) => {
      const existing = new Set(evidences.map((e) => e.articleId));
      for (const id of articleIds) {
        if (!existing.has(id as ArticleId)) {
          onAddEvidence(habitId, id);
        }
      }
    },
    [habitId, evidences, onAddEvidence]
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[70vh] flex-col rounded-t-2xl p-0"
        >
          <SheetTitle className="sr-only">{t('manage')}</SheetTitle>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{t('manage')}</h2>
              <HelpButton title={t('weight')}>
                <p>{t('weightAbout')}</p>
              </HelpButton>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Total annual impact summary */}
          {resolvedEvidences.length > 0 && (
            <div className="shrink-0 border-b bg-[#F8FBF9] px-5 py-3">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {tImpact('title')}{tImpact('perYear')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#3D8A5A]">
                  🏥 +{formatHealthMinutes(totalAnnualImpact.healthMinutes)}
                </span>
                <span className="text-sm font-bold text-[#3D8A5A]">
                  💰 {formatCurrency(totalAnnualImpact.costSaving)}
                </span>
                <span className="text-sm font-bold text-[#3D8A5A]">
                  📈 {formatCurrency(totalAnnualImpact.incomeGain)}
                </span>
              </div>
            </div>
          )}

          {/* Evidence list */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {resolvedEvidences.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('noEvidence')}
              </p>
            ) : (
              <div className="space-y-4">
                {resolvedEvidences.map(({ evidence, article }) => {
                  const w = evidence.weight / 100;
                  const annual = calculateAnnualImpact({
                    healthMinutes: article.calculationParams.dailyHealthMinutes * w,
                    costSaving: article.calculationParams.dailyCostSaving * w,
                    incomeGain: article.calculationParams.dailyIncomeGain * w,
                  });

                  return (
                    <div
                      key={evidence.id}
                      className="rounded-xl border border-[#E5E4E1] bg-card p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{article.defaultIcon}</span>
                        <span className="flex-1 truncate text-sm font-semibold">
                          {article.habitName}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveEvidence(habitId, evidence.id)}
                          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      {/* Annual impact for this evidence */}
                      <div className="mb-3 flex gap-3 text-[11px] text-muted-foreground">
                        <span>🏥 +{formatHealthMinutes(annual.healthMinutes)}{tImpact('perYear')}</span>
                        <span>💰 {formatCurrency(annual.costSaving)}{tImpact('perYear')}</span>
                        <span>📈 {formatCurrency(annual.incomeGain)}{tImpact('perYear')}</span>
                      </div>

                      {/* Weight slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{t('weight')}</span>
                          <span className="font-semibold text-[#3D8A5A]">
                            {evidence.weight}%
                          </span>
                        </div>
                        <Slider
                          value={[evidence.weight]}
                          onValueChange={([val]) => onSetWeight(habitId, evidence.id, val)}
                          min={1}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add button */}
          <div className="shrink-0 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              onClick={() => setPickerOpen(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="size-4" />
              {t('addEvidence')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <EvidencePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePickerSelect}
        initialSelected={evidences.map((e) => e.articleId)}
      />
    </>
  );
}
