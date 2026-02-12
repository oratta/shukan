'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Edit3, Archive, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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

interface HabitActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function HabitActions({
  open,
  onOpenChange,
  habitName,
  onEdit,
  onArchive,
  onDelete,
}: HabitActionsProps) {
  const t = useTranslations('habits');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{habitName}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button
              variant="ghost"
              className="justify-start gap-3 h-12"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
            >
              <Edit3 className="size-5" />
              {t('edit')}
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-3 h-12"
              onClick={() => {
                onOpenChange(false);
                onArchive();
              }}
            >
              <Archive className="size-5" />
              {t('archive')}
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-3 h-12 text-destructive hover:text-destructive"
              onClick={() => {
                onOpenChange(false);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-5" />
              {t('delete')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={onDelete}
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
