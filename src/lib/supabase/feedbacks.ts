import { createClient } from './client';

// REQ-AF-07: Data Layer Functions

export async function submitBadMark(articleId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('article_feedbacks')
    .insert({ user_id: user.id, article_id: articleId, type: 'bad' });

  if (error) throw error;
}

export async function removeBadMark(articleId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('article_feedbacks')
    .delete()
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .eq('type', 'bad');

  if (error) throw error;
}

export async function submitComment(articleId: string, content: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('article_feedbacks')
    .insert({ user_id: user.id, article_id: articleId, type: 'comment', content });

  if (error) throw error;
}

export async function getUserFeedback(articleId: string): Promise<{ hasBadMark: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasBadMark: false };

  const { data, error } = await supabase
    .from('article_feedbacks')
    .select('id')
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .eq('type', 'bad')
    .limit(1);

  if (error) {
    console.error('Failed to get user feedback:', error);
    return { hasBadMark: false };
  }

  return { hasBadMark: (data?.length ?? 0) > 0 };
}
