import { Frown, Meh, CircleMinus, Smile, Laugh, type LucideIcon } from 'lucide-react';

export interface MoodIconDef {
  Icon: LucideIcon;
  colorClass: string;
  value: number;
  /** Tailwind bg-color class used for calendar mood dot */
  dotColor: string;
}

export const MOOD_ICONS: MoodIconDef[] = [
  { Icon: Frown, colorClass: 'text-red-400', value: 1, dotColor: 'bg-red-400' },
  { Icon: Meh, colorClass: 'text-orange-400', value: 2, dotColor: 'bg-red-400' },
  { Icon: CircleMinus, colorClass: 'text-gray-400', value: 3, dotColor: 'bg-yellow-400' },
  { Icon: Smile, colorClass: 'text-lime-500', value: 4, dotColor: 'bg-green-400' },
  { Icon: Laugh, colorClass: 'text-green-500', value: 5, dotColor: 'bg-green-400' },
];
