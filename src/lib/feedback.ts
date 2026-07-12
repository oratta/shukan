/**
 * アプリ内フィードバック（issue #19）の純粋バリデーションロジック。
 * UI（feedback-dialog）と分離してユニットテスト可能にする。
 */

export const FEEDBACK_CATEGORIES = ['bug', 'idea', 'other'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

/** DB 側の TEXT に対するクライアント側の安全上限。 */
export const FEEDBACK_BODY_MAX_LENGTH = 2000;

export interface FeedbackInput {
  category: FeedbackCategory;
  body: string;
}

export interface FeedbackValidationErrors {
  /** 本文が空（空白のみを含む）。空送信は拒否する。 */
  bodyEmpty: boolean;
  /** 本文が上限を超過。 */
  bodyTooLong: boolean;
}

export function validateFeedbackInput(input: FeedbackInput): FeedbackValidationErrors {
  const trimmed = input.body.trim();
  return {
    bodyEmpty: trimmed.length === 0,
    bodyTooLong: trimmed.length > FEEDBACK_BODY_MAX_LENGTH,
  };
}

/** 送信可否。空送信・超過・不正カテゴリはすべて拒否。 */
export function canSubmitFeedback(input: FeedbackInput): boolean {
  if (!FEEDBACK_CATEGORIES.includes(input.category)) return false;
  const errors = validateFeedbackInput(input);
  return !errors.bodyEmpty && !errors.bodyTooLong;
}
