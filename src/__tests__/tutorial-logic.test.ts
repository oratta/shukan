import { describe, it, expect } from 'vitest';
import {
  TUTORIAL_STEPS,
  progressOf,
  stepIndexById,
} from '@/lib/tutorial';

describe('tutorial steps', () => {
  it('welcome から始まり create で終わる', () => {
    expect(TUTORIAL_STEPS[0].id).toBe('welcome');
    expect(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1].id).toBe('create');
  });

  it('ホーム上の実操作ステップは habit-status を指し、習慣0件時の逃げ先を持つ', () => {
    for (const id of ['complete', 'undo', 'longpress'] as const) {
      const step = TUTORIAL_STEPS[stepIndexById(id)];
      expect(step.selector).toBe('[data-tutorial="habit-status"]');
      expect(step.interactive).toBe(true);
      expect(step.skipToOnMissing).toBe('discover');
    }
  });

  it('発見タブへの遷移ステップは route 進行', () => {
    const step = TUTORIAL_STEPS[stepIndexById('discover')];
    expect(step.advance).toEqual({ type: 'route', route: '/discover' });
    expect(step.interactive).toBe(true);
  });

  it('説明のみのステップは穴を塞ぐ（誤タップでモーダルが開かない）', () => {
    for (const id of ['articles', 'create'] as const) {
      expect(TUTORIAL_STEPS[stepIndexById(id)].interactive).toBe(false);
    }
  });

  it('progressOf は welcome を除いた 1 始まりの進捗を返す', () => {
    expect(progressOf(0)).toEqual({ current: 0, total: TUTORIAL_STEPS.length - 1 });
    expect(progressOf(1)).toEqual({ current: 1, total: TUTORIAL_STEPS.length - 1 });
    expect(progressOf(TUTORIAL_STEPS.length - 1)).toEqual({
      current: TUTORIAL_STEPS.length - 1,
      total: TUTORIAL_STEPS.length - 1,
    });
  });

  it('skipToOnMissing の飛び先はすべて実在するステップ id', () => {
    for (const step of TUTORIAL_STEPS) {
      if (step.skipToOnMissing) {
        expect(stepIndexById(step.skipToOnMissing)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
