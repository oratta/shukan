'use client';

import { useState, type ReactNode } from 'react';
import { CircleHelp, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpButtonProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function HelpButton({ title, children, className }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={className ?? 'flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-muted'}
      >
        <CircleHelp className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <div className="text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
