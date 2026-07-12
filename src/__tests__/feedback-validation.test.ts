import { describe, it, expect } from 'vitest';
import {
  validateFeedbackInput,
  canSubmitFeedback,
  FEEDBACK_BODY_MAX_LENGTH,
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from '@/lib/feedback';

/**
 * issue #19: アプリ内フィードバック導線。
 * 受け入れ条件「フォームのバリデーション: 空送信拒否」を仕様としてテストする。
 * フォーム（feedback-dialog.tsx）はこの純粋関数の結果で送信ボタンを制御する。
 */

describe('validateFeedbackInput', () => {
  it('rejects an empty body (空送信拒否)', () => {
    expect(validateFeedbackInput({ category: 'bug', body: '' }).bodyEmpty).toBe(true);
  });

  it('rejects a whitespace-only body (空白だけの送信も空扱い)', () => {
    expect(validateFeedbackInput({ category: 'idea', body: '   \n\t ' }).bodyEmpty).toBe(true);
  });

  it('accepts a non-empty body', () => {
    const errors = validateFeedbackInput({ category: 'bug', body: 'ログインできない' });
    expect(errors.bodyEmpty).toBe(false);
    expect(errors.bodyTooLong).toBe(false);
  });

  it('rejects a body over the max length', () => {
    const errors = validateFeedbackInput({
      category: 'other',
      body: 'あ'.repeat(FEEDBACK_BODY_MAX_LENGTH + 1),
    });
    expect(errors.bodyTooLong).toBe(true);
  });

  it('accepts a body exactly at the max length', () => {
    const errors = validateFeedbackInput({
      category: 'other',
      body: 'a'.repeat(FEEDBACK_BODY_MAX_LENGTH),
    });
    expect(errors.bodyTooLong).toBe(false);
  });
});

describe('canSubmitFeedback', () => {
  it('returns false for empty submission in every category', () => {
    for (const category of FEEDBACK_CATEGORIES) {
      expect(canSubmitFeedback({ category, body: '' })).toBe(false);
      expect(canSubmitFeedback({ category, body: '  ' })).toBe(false);
    }
  });

  it('returns true for a valid submission', () => {
    expect(canSubmitFeedback({ category: 'bug', body: '通知が来ません' })).toBe(true);
  });

  it('returns false for an unknown category (defensive)', () => {
    expect(
      canSubmitFeedback({ category: 'spam' as FeedbackCategory, body: 'hello' })
    ).toBe(false);
  });

  it('returns false when the body exceeds the max length', () => {
    expect(
      canSubmitFeedback({ category: 'bug', body: 'x'.repeat(FEEDBACK_BODY_MAX_LENGTH + 1) })
    ).toBe(false);
  });
});
