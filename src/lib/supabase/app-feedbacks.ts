import { createClient } from './client';
import type { FeedbackCategory } from '@/lib/feedback';

/**
 * アプリ内フィードバック（issue #19）の insert。
 * feedbacks テーブルは insert-only RLS（自分の user_id でのみ INSERT 可、SELECT 不可）。
 * 記事フィードバック用の feedbacks.ts（article_feedbacks）とは別物。
 */
export async function submitAppFeedback(
  userId: string,
  category: FeedbackCategory,
  body: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('feedbacks')
    .insert({ user_id: userId, category, body: body.trim() });

  if (error) throw error;
}
