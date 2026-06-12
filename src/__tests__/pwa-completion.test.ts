import { describe, it, expect } from 'vitest';
import { isCompletionTransition } from '@/lib/pwa/completion';

describe('isCompletionTransition (S6)', () => {
  it('non-completed → completed is a transition', () => {
    expect(isCompletionTransition('none', 'completed')).toBe(true);
    expect(isCompletionTransition('skipped', 'completed')).toBe(true);
    expect(isCompletionTransition('failed', 'completed')).toBe(true);
  });

  it('non-completed → rocket_used is a transition (rocket_used counts as completed)', () => {
    expect(isCompletionTransition('none', 'rocket_used')).toBe(true);
    expect(isCompletionTransition('failed', 'rocket_used')).toBe(true);
  });

  it('unrecorded prev (undefined/null) → completed/rocket_used is a transition', () => {
    expect(isCompletionTransition(undefined, 'completed')).toBe(true);
    expect(isCompletionTransition(null, 'completed')).toBe(true);
    expect(isCompletionTransition(undefined, 'rocket_used')).toBe(true);
  });

  it('already-completed prev → completed/rocket_used is NOT a transition', () => {
    expect(isCompletionTransition('completed', 'completed')).toBe(false);
    expect(isCompletionTransition('rocket_used', 'completed')).toBe(false);
    expect(isCompletionTransition('completed', 'rocket_used')).toBe(false);
    expect(isCompletionTransition('rocket_used', 'rocket_used')).toBe(false);
  });

  it('transition to a non-completed status is NOT a transition', () => {
    expect(isCompletionTransition('none', 'failed')).toBe(false);
    expect(isCompletionTransition('none', 'skipped')).toBe(false);
    expect(isCompletionTransition('none', 'none')).toBe(false);
    expect(isCompletionTransition('completed', 'failed')).toBe(false);
    expect(isCompletionTransition('completed', 'none')).toBe(false);
  });

  it('transition to null/undefined is NOT a transition', () => {
    expect(isCompletionTransition('none', null)).toBe(false);
    expect(isCompletionTransition('completed', undefined)).toBe(false);
  });
});
