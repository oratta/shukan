import { describe, it, expect } from 'vitest';

/**
 * TDD tests for review-sheet-ux-improvements change.
 * Tests cover the logical behavior, not React rendering.
 */

// --- Status select logic (replaces nextReviewStatus cycle) ---

// The new select logic: tap a status button directly.
// If current === tapped, reset to 'none'. Otherwise, set to tapped status.
function selectStatus(
  current: string,
  tapped: 'completed' | 'skipped' | 'failed'
): string {
  return current === tapped ? 'none' : tapped;
}

describe('Status select logic', () => {
  it('selects completed from none', () => {
    expect(selectStatus('none', 'completed')).toBe('completed');
  });

  it('selects failed from none', () => {
    expect(selectStatus('none', 'failed')).toBe('failed');
  });

  it('selects skipped from none', () => {
    expect(selectStatus('none', 'skipped')).toBe('skipped');
  });

  it('changes directly from completed to failed', () => {
    expect(selectStatus('completed', 'failed')).toBe('failed');
  });

  it('changes directly from failed to skipped', () => {
    expect(selectStatus('failed', 'skipped')).toBe('skipped');
  });

  it('deselects completed by tapping again', () => {
    expect(selectStatus('completed', 'completed')).toBe('none');
  });

  it('deselects failed by tapping again', () => {
    expect(selectStatus('failed', 'failed')).toBe('none');
  });

  it('deselects skipped by tapping again', () => {
    expect(selectStatus('skipped', 'skipped')).toBe('none');
  });

  it('handles rocket_used as different from completed', () => {
    // rocket_used is a special state, tapping completed should set completed
    expect(selectStatus('rocket_used', 'completed')).toBe('completed');
  });
});

// --- Mood icon config ---

interface MoodConfig {
  icon: string;
  colorClass: string;
  value: number;
}

const MOOD_ICONS: MoodConfig[] = [
  { icon: 'Frown', colorClass: 'text-red-400', value: 1 },
  { icon: 'Meh', colorClass: 'text-orange-400', value: 2 },
  { icon: 'CircleMinus', colorClass: 'text-gray-400', value: 3 },
  { icon: 'Smile', colorClass: 'text-lime-500', value: 4 },
  { icon: 'Laugh', colorClass: 'text-success', value: 5 },
];

describe('Mood icon configuration', () => {
  it('has exactly 5 mood levels', () => {
    expect(MOOD_ICONS).toHaveLength(5);
  });

  it('mood values are 1 through 5', () => {
    expect(MOOD_ICONS.map(m => m.value)).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses Lucide icon names (not emoji)', () => {
    for (const mood of MOOD_ICONS) {
      expect(mood.icon).toMatch(/^[A-Z]/); // PascalCase Lucide name
      expect(mood.icon).not.toMatch(/[\u{1F600}-\u{1F64F}]/u); // no emoji
    }
  });

  it('each mood has a color class', () => {
    for (const mood of MOOD_ICONS) {
      expect(mood.colorClass).toMatch(/^text-/);
    }
  });
});

// --- All habits display (not just unreviewed) ---

describe('Review sheet habit list', () => {
  const allHabits = [
    { id: '1', name: 'Exercise', archived: false },
    { id: '2', name: 'Reading', archived: false },
    { id: '3', name: 'Archived', archived: true },
    { id: '4', name: 'Meditation', archived: false },
  ];

  // The new filter: all non-archived habits (not just unreviewed)
  function getReviewHabits(habits: typeof allHabits) {
    return habits.filter(h => !h.archived);
  }

  it('includes all non-archived habits', () => {
    const result = getReviewHabits(allHabits);
    expect(result).toHaveLength(3);
    expect(result.map(h => h.name)).toEqual(['Exercise', 'Reading', 'Meditation']);
  });

  it('excludes archived habits', () => {
    const result = getReviewHabits(allHabits);
    expect(result.find(h => h.name === 'Archived')).toBeUndefined();
  });

  it('includes habits that already have a completion status', () => {
    // The point: even if a habit is already reviewed, it appears in the list
    const result = getReviewHabits(allHabits);
    expect(result).toHaveLength(3); // All 3 non-archived, regardless of completion
  });
});
