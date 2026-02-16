'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import type { Habit } from '@/types/habit';

const EMOJI_OPTIONS = [
  '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨',
  '🎵', '🌱', '💤', '🍎', '🧹', '💊', '🐕', '📝',
  '☕', '🚶', '🏋️', '🧠', '❤️', '🌅', '📖', '🎸',
];

const COLOR_OPTIONS = [
  { value: 'oklch(0.6 0.2 260)', label: 'Blue' },
  { value: 'oklch(0.6 0.18 145)', label: 'Green' },
  { value: 'oklch(0.65 0.2 30)', label: 'Red' },
  { value: 'oklch(0.7 0.18 80)', label: 'Yellow' },
  { value: 'oklch(0.6 0.2 300)', label: 'Purple' },
  { value: 'oklch(0.65 0.15 180)', label: 'Teal' },
  { value: 'oklch(0.65 0.2 50)', label: 'Orange' },
  { value: 'oklch(0.65 0.2 340)', label: 'Pink' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<Habit, 'id' | 'createdAt' | 'archived'>,
    copingSteps?: { title: string; sortOrder: number }[]
  ) => void;
  onDelete?: () => void;
  initialData?: Partial<Habit>;
  initialCopingSteps?: { title: string; sortOrder: number }[];
}

export function HabitForm({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  initialData,
  initialCopingSteps,
}: HabitFormProps) {
  const t = useTranslations('habits');
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? ''
  );
  const [lifeSignificance, setLifeSignificance] = useState(
    initialData?.lifeSignificance ?? ''
  );
  const [icon, setIcon] = useState(initialData?.icon ?? '💪');
  const [color, setColor] = useState(
    initialData?.color ?? 'oklch(0.6 0.2 260)'
  );
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(
    initialData?.frequency ?? 'daily'
  );
  const [customDays, setCustomDays] = useState<number[]>(
    initialData?.customDays ?? [1, 2, 3, 4, 5]
  );
  const [type, setType] = useState<'positive' | 'quit'>(
    initialData?.type ?? 'positive'
  );
  const [dailyTarget, setDailyTarget] = useState(
    initialData?.dailyTarget ?? 3
  );
  const [copingSteps, setCopingSteps] = useState<
    { title: string; sortOrder: number }[]
  >(initialCopingSteps ?? [{ title: '', sortOrder: 0 }]);

  // Sync state when initialData/initialCopingSteps change (e.g., editing a different habit)
  useEffect(() => {
    setName(initialData?.name ?? '');
    setDescription(initialData?.description ?? '');
    setLifeSignificance(initialData?.lifeSignificance ?? '');
    setIcon(initialData?.icon ?? '💪');
    setColor(initialData?.color ?? 'oklch(0.6 0.2 260)');
    setFrequency(initialData?.frequency ?? 'daily');
    setCustomDays(initialData?.customDays ?? [1, 2, 3, 4, 5]);
    setType(initialData?.type ?? 'positive');
    setDailyTarget(initialData?.dailyTarget ?? 3);
    setCopingSteps(initialCopingSteps ?? [{ title: '', sortOrder: 0 }]);
  }, [initialData, initialCopingSteps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === 'quit' && copingSteps.every((s) => !s.title.trim())) return;

    const validSteps = copingSteps
      .filter((s) => s.title.trim())
      .map((s, i) => ({ title: s.title.trim(), sortOrder: i }));

    onSubmit(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        lifeSignificance: lifeSignificance.trim() || undefined,
        icon,
        color,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
        type,
        dailyTarget: type === 'quit' ? dailyTarget : 1,
      },
      type === 'quit' ? validSteps : undefined
    );

    if (!initialData) {
      setName('');
      setDescription('');
      setLifeSignificance('');
      setIcon('💪');
      setColor('oklch(0.6 0.2 260)');
      setFrequency('daily');
      setCustomDays([1, 2, 3, 4, 5]);
      setType('positive');
      setDailyTarget(3);
      setCopingSteps([{ title: '', sortOrder: 0 }]);
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

  return (
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
                <span className="text-2xl">💪</span>
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
                <span className="text-2xl">🛡️</span>
                <span className="text-sm font-medium">{t('typeQuit')}</span>
                <span className="text-xs text-muted-foreground">
                  {t('typeQuitDesc')}
                </span>
              </button>
            </div>
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
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg text-lg transition-all hover:bg-accent',
                    icon === emoji &&
                      'bg-primary/10 ring-2 ring-primary dark:bg-primary/20'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('color')}</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    'size-8 rounded-full transition-all hover:scale-110',
                    color === opt.value &&
                      'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('frequency')}</Label>
            <Select
              value={frequency}
              onValueChange={(v) =>
                setFrequency(v as 'daily' | 'weekly' | 'custom')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('daily')}</SelectItem>
                <SelectItem value="weekly">{t('weekly')}</SelectItem>
                <SelectItem value="custom">{t('custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'custom' && (
            <div className="space-y-2">
              <Label>Days</Label>
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

          <DialogFooter className="flex-row">
            {initialData && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
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
  );
}
