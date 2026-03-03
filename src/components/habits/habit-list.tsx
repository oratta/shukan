'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
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
  onDayStatusChange: (habitId: string, date: string, status: 'completed' | 'failed' | 'none') => void;
  onAdd: () => void;
  onOpenDetail: (id: string) => void;
  onOpenVsTemptation: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

export function HabitList({
  habits,
  onDayStatusChange,
  onAdd,
  onOpenDetail,
  onOpenVsTemptation,
  onReorder,
}: HabitListProps) {
  const t = useTranslations('habits');
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedHabitId((prev) => (prev === id ? null : id));
  }, []);

  // Sort by sortOrder (no more completedToday sorting)
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => a.sortOrder - b.sortOrder);
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

      const oldIndex = sortedHabits.findIndex((h) => h.id === active.id);
      const newIndex = sortedHabits.findIndex((h) => h.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...sortedHabits];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);

      onReorder(newOrder.map((h) => h.id));
    },
    [sortedHabits, onReorder]
  );

  return (
    <div className="relative">
      {sortedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">🌱</div>
          <h3 className="mb-1 text-lg font-semibold">{t('empty')}</h3>
          <Button onClick={onAdd} size="sm" className="mt-4">
            <Plus className="size-4" />
            {t('add')}
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedHabits.map((h) => h.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isExpanded={expandedHabitId === habit.id}
                  onToggleExpand={handleToggleExpand}
                  onDayStatusChange={onDayStatusChange}
                  onOpenDetail={onOpenDetail}
                  onOpenVsTemptation={onOpenVsTemptation}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {sortedHabits.length > 0 && (
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
