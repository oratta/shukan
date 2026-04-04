'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, Dumbbell, Shield } from 'lucide-react';
import { HabitIcon } from '@/components/ui/habit-icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getArticle } from '@/data/impact-articles';
import { EvidencePicker } from '@/components/habits/evidence-picker';
import type { Habit } from '@/types/habit';
import type { ArticleId } from '@/types/impact';

import { ICON_OPTIONS } from '@/lib/icon-registry';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EvidenceEntry {
  articleId: string;
  weight: number;
}

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'sortOrder'>,
    copingSteps?: { title: string; sortOrder: number }[],
    initialEvidences?: EvidenceEntry[]
  ) => void;
  onDelete?: () => void;
  initialData?: Partial<Habit>;
  initialCopingSteps?: { title: string; sortOrder: number }[];
  prefilledEvidences?: EvidenceEntry[];
}

export function HabitForm({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  initialData,
  initialCopingSteps,
  prefilledEvidences,
}: HabitFormProps) {
  const t = useTranslations('habits');
  const tEvidence = useTranslations('evidence');
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? ''
  );
  const [lifeSignificance, setLifeSignificance] = useState(
    initialData?.lifeSignificance ?? ''
  );
  const [icon, setIcon] = useState(initialData?.icon ?? 'dumbbell');
  const [frequency, setFrequency] = useState<'everyday' | 'weekday' | 'custom' | 'weekly'>(
    initialData?.frequency ?? 'everyday'
  );
  const [customDays, setCustomDays] = useState<number[]>(
    initialData?.customDays ?? [1, 2, 3, 4, 5]
  );
  const [type, setType] = useState<'positive' | 'quit'>(
    initialData?.type ?? 'positive'
  );
  const [weeklyTarget, setWeeklyTarget] = useState(
    initialData?.weeklyTarget ?? 1
  );
  const [dailyTarget, setDailyTarget] = useState(
    initialData?.dailyTarget ?? 3
  );
  const [copingSteps, setCopingSteps] = useState<
    { title: string; sortOrder: number }[]
  >(initialCopingSteps ?? [{ title: '', sortOrder: 0 }]);
  const [evidences, setEvidences] = useState<EvidenceEntry[]>(
    prefilledEvidences ??
    initialData?.evidences?.map((ev) => ({ articleId: ev.articleId, weight: ev.weight })) ??
    []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Sync state when initialData/initialCopingSteps change (e.g., editing a different habit)
  useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setLifeSignificance(initialData?.lifeSignificance ?? '');
    setIcon(initialData?.icon ?? 'dumbbell');
    setFrequency(initialData?.frequency ?? 'everyday');
    setCustomDays(initialData?.customDays ?? [1, 2, 3, 4, 5]);
    setType(initialData?.type ?? 'positive');
    setWeeklyTarget(initialData?.weeklyTarget ?? 1);
    setDailyTarget(initialData?.dailyTarget ?? 3);
    setCopingSteps(initialCopingSteps ?? [{ title: '', sortOrder: 0 }]);
    setEvidences(
      prefilledEvidences ??
      initialData?.evidences?.map((ev) => ({ articleId: ev.articleId, weight: ev.weight })) ??
      []
    );
  }, [initialData, initialCopingSteps, prefilledEvidences]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === 'quit' && copingSteps.every((s) => !s.title.trim())) return;
    if (frequency === 'custom' && customDays.length === 0) return;

    const validSteps = copingSteps
      .filter((s) => s.title.trim())
      .map((s, i) => ({ title: s.title.trim(), sortOrder: i }));

    onSubmit(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        lifeSignificance: lifeSignificance.trim() || undefined,
        icon,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
        weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
        type,
        dailyTarget: type === 'quit' ? dailyTarget : 1,
        impactArticleId: undefined,
        evidences: initialData?.evidences ?? [],
      },
      type === 'quit' ? validSteps : undefined,
      evidences.length > 0 ? evidences : undefined
    );

    if (!initialData) {
      setName('');
      setDescription('');
      setLifeSignificance('');
      setIcon('dumbbell');
      setFrequency('everyday');
      setCustomDays([1, 2, 3, 4, 5]);
      setWeeklyTarget(1);
      setType('positive');
      setDailyTarget(3);
      setCopingSteps([{ title: '', sortOrder: 0 }]);
      setEvidences([]);
    }

    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addStep = () => {
    setCopingSteps((prev) => [
      ...prev,
      { title: '', sortOrder: prev.length },
    ]);
  };

  const removeStep = (index: number) => {
    setCopingSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, title: string) => {
    setCopingSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s))
    );
  };

  const handleEvidenceSelect = (articleIds: string[]) => {
    setEvidences((prev) => {
      const existing = new Set(prev.map((e) => e.articleId));
      const newEntries = articleIds
        .filter((id) => !existing.has(id))
        .map((articleId) => ({ articleId, weight: 100 }));
      return [...prev, ...newEntries];
    });
  };

  const removeEvidence = (articleId: string) => {
    setEvidences((prev) => prev.filter((e) => e.articleId !== articleId));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t(initialData ? 'edit' : 'add')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">{t('name')}</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habit-description">{t('description')}</Label>
              <Textarea
                id="habit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habit-life-significance">{t('lifeSignificance')}</Label>
              <Textarea
                id="habit-life-significance"
                value={lifeSignificance}
                onChange={(e) => setLifeSignificance(e.target.value)}
                placeholder={t('lifeSignificancePlaceholder')}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('type')}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('positive')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all',
                    type === 'positive'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:bg-accent'
                  )}
                >
                  <Dumbbell className="size-6" />
                  <span className="text-sm font-medium">{t('typePositive')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('typePositiveDesc')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('quit')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all',
                    type === 'quit'
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:bg-accent'
                  )}
                >
                  <Shield className="size-6" />
                  <span className="text-sm font-medium">{t('typeQuit')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('typeQuitDesc')}
                  </span>
                </button>
              </div>
            </div>

            {/* Evidence Selection */}
            <div className="space-y-2">
              <Label>{tEvidence('title')}</Label>
              {evidences.length > 0 && (
                <div className="space-y-1.5">
                  {evidences.map((ev) => {
                    const article = getArticle(ev.articleId as ArticleId);
                    if (!article) return null;
                    return (
                      <div
                        key={ev.articleId}
                        className="flex items-center gap-2 rounded-lg border border-[#D4E8DA] bg-[#F8FBF9] px-3 py-2"
                      >
                        <HabitIcon name={article.defaultIcon} size={16} />
                        <span className="flex-1 truncate text-sm font-medium">
                          {article.habitName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEvidence(ev.articleId)}
                          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                className="w-full"
              >
                <Plus className="size-4" />
                {tEvidence('addEvidence')}
              </Button>
              {evidences.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {tEvidence('noEvidence')}
                </p>
              )}
            </div>

            {type === 'quit' && (
              <>
                <div className="space-y-2">
                  <Label>{t('copingSteps')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('copingStepsDesc')}
                  </p>
                  <div className="space-y-2">
                    {copingSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={step.title}
                          onChange={(e) => updateStep(index, e.target.value)}
                          placeholder={t('stepPlaceholder')}
                          className="flex-1"
                        />
                        {copingSteps.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-9"
                            onClick={() => removeStep(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    {t('addStep')}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-target">{t('dailyTarget')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('dailyTargetDesc')}
                  </p>
                  <Input
                    id="daily-target"
                    type="number"
                    min={1}
                    max={20}
                    value={dailyTarget}
                    onChange={(e) =>
                      setDailyTarget(
                        Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-24"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>{t('icon')}</Label>
              <div className="grid grid-cols-8 gap-1.5">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg transition-all hover:bg-accent',
                      icon === iconName &&
                        'bg-primary/10 ring-2 ring-primary dark:bg-primary/20'
                    )}
                  >
                    <HabitIcon name={iconName} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t('frequency')}</Label>

              {/* Daily / Weekly category segment */}
              <div className="flex rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => { if (frequency === 'weekly') setFrequency('everyday'); }}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    frequency !== 'weekly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('frequencyDaily')}
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('weekly')}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                    frequency === 'weekly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('frequencyWeekly')}
                </button>
              </div>

              {/* Daily sub-type chips */}
              {frequency !== 'weekly' && (
                <div className="flex gap-2">
                  {(['everyday', 'weekday', 'custom'] as const).map((subType) => (
                    <button
                      key={subType}
                      type="button"
                      onClick={() => setFrequency(subType)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                        frequency === subType
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {subType === 'everyday'
                        ? t('everyday')
                        : subType === 'weekday'
                          ? t('weekday')
                          : t('frequencyCustom')}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom day chips */}
              {frequency === 'custom' && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">{t('selectDays')}</span>
                  <div className="flex gap-1.5">
                    {DAY_LABELS.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={cn(
                          'flex size-9 items-center justify-center rounded-full text-xs font-medium transition-all',
                          customDays.includes(index)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        )}
                      >
                        {label.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly target selector */}
              {frequency === 'weekly' && (
                <Select
                  value={weeklyTarget.toString()}
                  onValueChange={(v) => setWeeklyTarget(parseInt(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {t('timesPerWeek', { count: weeklyTarget })}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {t('timesPerWeek', { count: n })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DialogFooter className="flex-row">
              {initialData && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="mr-auto"
                >
                  {t('delete')}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EvidencePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleEvidenceSelect}
        initialSelected={evidences.map((e) => e.articleId)}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteConfirmOpen(false);
                onDelete?.();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
