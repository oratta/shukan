-- ============================================
-- Table: user_profiles
-- ============================================
-- オンボーディングで収集するプロフィール入力値のみを保存する。
-- 派生値（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears）は
-- DB に保存せず、src/lib/profile.ts の純粋関数で都度計算する。
-- RLS は既存 user_settings と同型（select / insert / update の 3 ポリシー、delete なし）。

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_year integer,
  gender text not null default 'unspecified' check (gender in ('male', 'female', 'other', 'unspecified')),
  country text not null default 'JP',
  annual_income bigint,
  currency text not null default 'JPY',
  tracked_kpis text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
