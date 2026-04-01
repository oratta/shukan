import { createClient } from './client';

// REQ-AF-07: Data Layer Functions

export async function submitBadMark(userId: string, articleId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('article_feedbacks')
    .insert({ user_id: userId, article_id: articleId, type: 'bad' });

  if (error) throw error;
}

export async function removeBadMark(userId: string, articleId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('article_feedbacks')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .eq('type', 'bad');

  if (error) throw error;
}

export async function submitComment(userId: string, articleId: string, content: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('article_feedbacks')
    .insert({ user_id: userId, article_id: articleId, type: 'comment', content });

  if (error) throw error;
}

export async function getUserFeedback(userId: string, articleId: string): Promise<{ hasBadMark: boolean }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('article_feedbacks')
    .select('id')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .eq('type', 'bad')
    .limit(1);

  if (error) {
    console.error('Failed to get user feedback:', error);
    return { hasBadMark: false };
  }

  return { hasBadMark: (data?.length ?? 0) > 0 };
}
