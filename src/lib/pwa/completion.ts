export type DayStatus =
  | 'completed'
  | 'rocket_used'
  | 'failed'
  | 'skipped'
  | 'none'
  | null
  | undefined;

function isCompleted(status: DayStatus): boolean {
  return status === 'completed' || status === 'rocket_used';
}

/**
 * Detect whether a habit just transitioned INTO a completed state.
 *
 * Matches the existing habit-card.tsx pattern: both 'completed' and 'rocket_used'
 * count as completed. Unrecorded prev (null/undefined) is treated as non-completed.
 *
 * true ⇔ prev is NOT completed AND next IS completed.
 */
export function isCompletionTransition(prev: DayStatus, next: DayStatus): boolean {
  return !isCompleted(prev) && isCompleted(next);
}
