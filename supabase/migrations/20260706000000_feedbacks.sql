-- feedbacks: アプリ内フィードバック（バグ報告・要望）の受け口（issue #19）
-- article_feedbacks（記事フィードバック）とは別テーブル。運営が service_role で閲覧する。
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bug', 'idea', 'other')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 運営側の集計・閲覧用インデックス
create index idx_feedbacks_created_at on public.feedbacks(created_at desc);

-- RLS: insert-only。
-- ユーザーは自分の user_id でのみ INSERT 可能。SELECT / UPDATE / DELETE の
-- ポリシーは定義しない = anon・authenticated からは一切読めない（0 件）。
-- 閲覧は service_role（RLS バイパス）でのみ行う。
alter table public.feedbacks enable row level security;

create policy "Users can insert own feedback"
  on public.feedbacks for insert
  with check (auth.uid() = user_id);
