-- article_feedbacks: ユーザーからのエビデンス記事に対するフィードバック
-- REQ-AF-01: Feedback Table
create table if not exists public.article_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null,
  type text not null check (type in ('bad', 'comment')),
  content text,
  created_at timestamptz not null default now()
);

-- パフォーマンス用インデックス
create index idx_article_feedbacks_user_article
  on public.article_feedbacks(user_id, article_id);
create index idx_article_feedbacks_article_type
  on public.article_feedbacks(article_id, type);

-- REQ-AF-02: RLS Policies
alter table public.article_feedbacks enable row level security;

-- SELECT: 自分のフィードバックのみ閲覧可能
create policy "Users can view own feedbacks"
  on public.article_feedbacks for select
  using (auth.uid() = user_id);

-- INSERT: 自分のフィードバックのみ作成可能
create policy "Users can insert own feedbacks"
  on public.article_feedbacks for insert
  with check (auth.uid() = user_id);

-- DELETE: 自分のフィードバックのみ削除可能（バッドマーク取消用）
create policy "Users can delete own feedbacks"
  on public.article_feedbacks for delete
  using (auth.uid() = user_id);

-- REQ-AF-03: Stats View（service_role キーでのみ全体集計可能）
-- D5: anon キーではRLSにより自分のデータのみ見える
create or replace view public.article_feedback_stats as
select
  article_id,
  count(*) filter (where type = 'bad') as bad_count,
  count(*) filter (where type = 'comment') as comment_count,
  max(created_at) as last_feedback_at
from public.article_feedbacks
group by article_id;
