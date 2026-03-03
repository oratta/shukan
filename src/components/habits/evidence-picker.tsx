'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Search, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getArticleList } from '@/data/impact-articles';

type TabFilter = 'all' | 'quit' | 'positive';

interface EvidencePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (articleIds: string[]) => void;
  initialSelected?: string[];
}

export function EvidencePicker({
  open,
  onOpenChange,
  onSelect,
  initialSelected = [],
}: EvidencePickerProps) {
  const t = useTranslations('evidence');
  const tImpact = useTranslations('impact');

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelected)
  );
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Reset state when modal opens with new initialSelected
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setSelected(new Set(initialSelected));
        setSearch('');
        setActiveTab('all');
      }
      onOpenChange(isOpen);
    },
    [initialSelected, onOpenChange]
  );

  const articles = useMemo(() => getArticleList(), []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Tab filter
      if (activeTab === 'quit' && article.defaultHabitType !== 'quit') return false;
      if (activeTab === 'positive' && article.defaultHabitType !== 'positive') return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        return article.name.toLowerCase().includes(query) ||
          article.id.toLowerCase().includes(query);
      }

      return true;
    });
  }, [articles, activeTab, search]);

  const toggleArticle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    onSelect(Array.from(selected));
    onOpenChange(false);
  }, [selected, onSelect, onOpenChange]);

  const tDiscover = useTranslations('discover');
  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'quit', label: tDiscover('quit') },
    { key: 'positive', label: tDiscover('build') },
  ];

  const confidenceBadgeClass = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[90vh] flex-col rounded-t-2xl p-0"
      >
        <SheetTitle className="sr-only">{t('selectTitle')}</SheetTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">{t('selectTitle')}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex shrink-0 gap-2 px-4 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {filteredArticles.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              {t('noResults')}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map((article) => {
                const isSelected = selected.has(article.id);
                const { dailyHealthMinutes, dailyCostSaving, dailyIncomeGain } =
                  article.calculationParams;

                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => toggleArticle(article.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    {/* Icon */}
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-xl shadow-sm dark:bg-gray-800">
                      {article.defaultIcon}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {article.name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                            confidenceBadgeClass(article.confidenceLevel)
                          )}
                        >
                          {tImpact(`confidence.${article.confidenceLevel}`)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex gap-3 text-[11px] text-muted-foreground">
                        <span>+{dailyHealthMinutes}{tImpact('minuteUnit')}{tImpact('perDay')}</span>
                        <span>{dailyCostSaving.toLocaleString()}{tImpact('perDay')}</span>
                        <span>{dailyIncomeGain.toLocaleString()}{tImpact('perDay')}</span>
                      </div>
                    </div>

                    {/* Toggle circle */}
                    <div
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'border-2 border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <Check className="size-3.5" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed CTA at bottom */}
        <div className="absolute inset-x-0 bottom-0 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="w-full"
            size="lg"
          >
            {t('addCount', { count: selected.size })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
