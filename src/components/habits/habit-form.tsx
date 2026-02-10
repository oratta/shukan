'use client';

import { useState } from 'react';
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
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  initialData?: Partial<Habit>;
}

export function HabitForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
    });

    if (!initialData) {
      setName('');
      setDescription('');
      setIcon('💪');
      setColor('oklch(0.6 0.2 260)');
      setFrequency('daily');
      setCustomDays([1, 2, 3, 4, 5]);
    }

    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Habit' : 'New Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning exercise"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">Description</Label>
            <Textarea
              id="habit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
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
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    'size-8 rounded-full transition-all hover:scale-110',
                    color === opt.value && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
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
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {initialData ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
