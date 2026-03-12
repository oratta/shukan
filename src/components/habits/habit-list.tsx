'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Sprout } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { HabitCard } from '@/components/habits/habit-card';
import { Button } from '@/components/ui/button';
import type { HabitWithStats } from '@/types/habit';

interface HabitListProps {
  habits: HabitWithStats[];
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none' | 'skipped') => void;
  onAdd: () => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onSkipToday: (id: string) => void;
}

export function HabitList({
  habits,
  onDayStatusChange,
  onAdd,
  onOpenDetail,
  onOpenVsTemptation,
  onReorder,
  onSkipToday,
}: HabitListProps) {
  const t = useTranslations('habits');
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedHabitId((prev) => (prev === id ? null : id));
  }, []);

  // Split into active and skipped, sorted by sortOrder
  const { activeHabits, skippedHabits } = useMemo(() => {
    const sorted = [...habits].sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      activeHabits: sorted.filter((h) => !h.skippedToday),
      skippedHabits: sorted.filter((h) => h.skippedToday),
    };
  }, [habits]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = activeHabits.findIndex((h) => h.id === active.id);
      const newIndex = activeHabits.findIndex((h) => h.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...activeHabits];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);

      // Include skipped habits in the full order
      onReorder([...newOrder.map((h) => h.id), ...skippedHabits.map((h) => h.id)]);
    },
    [activeHabits, skippedHabits, onReorder]
  );

  const allHabits = [...activeHabits, ...skippedHabits];

  return (
    <div className="relative">
      {allHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sprout className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-1 text-lg font-semibold">{t('empty')}</h3>
          <Button onClick={onAdd} size="sm" className="mt-4">
            <Plus className="size-4" />
            {t('add')}
          </Button>
        </div>
      ) : (
        <>
          {/* Active habits section (drag-and-drop enabled) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeHabits.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {activeHabits.map((habit) => (
                  <div key={habit.id} className="animate-[fadeSlideIn_300ms_ease-out]">
                    <HabitCard
                      habit={habit}
                      isExpanded={expandedHabitId === habit.id}
                      onToggleExpand={handleToggleExpand}
                      onDayStatusChange={onDayStatusChange}
                      onOpenDetail={onOpenDetail}
                      onOpenVsTemptation={onOpenVsTemptation}
                      onSkipToday={onSkipToday}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Skipped habits section */}
          {skippedHabits.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t('skippedSection')}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
              <div className="space-y-3">
                {skippedHabits.map((habit) => (
                  <div key={habit.id} className="animate-[fadeSlideIn_300ms_ease-out]">
                    <HabitCard
                      habit={habit}
                      isExpanded={expandedHabitId === habit.id}
                      onToggleExpand={handleToggleExpand}
                      onDayStatusChange={onDayStatusChange}
                      onOpenDetail={onOpenDetail}
                      onOpenVsTemptation={onOpenVsTemptation}
                      onSkipToday={onSkipToday}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {allHabits.length > 0 && (
        <Button
          onClick={onAdd}
          size="icon"
          className="fixed bottom-20 right-4 z-30 size-14 rounded-full shadow-lg md:bottom-8 md:right-8"
        >
          <Plus className="size-6" />
        </Button>
      )}
    </div>
  );
}
