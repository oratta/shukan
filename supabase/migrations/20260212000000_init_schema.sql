-- ============================================
-- Table: habits
-- ============================================
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text not null default '💪',
  color text not null default 'oklch(0.6 0.2 260)',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  custom_days integer[],
  created_at timestamptz not null default now(),
  archived boolean not null default false
);

alter table public.habits enable row level security;

create policy "Users can view own habits"
  on public.habits for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  to authenticated
  using (auth.uid() = user_id);

create index idx_habits_user_id on public.habits(user_id);

-- ============================================
-- Table: habit_completions
-- ============================================
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null,
  completed_at timestamptz not null default now(),
  unique(habit_id, date)
);

alter table public.habit_completions enable row level security;

create policy "Users can view own completions"
  on public.habit_completions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.habit_completions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own completions"
  on public.habit_completions for delete
  to authenticated
  using (auth.uid() = user_id);

create index idx_completions_user_id on public.habit_completions(user_id);
create index idx_completions_habit_date on public.habit_completions(habit_id, date);

-- ============================================
-- Table: user_settings (future use)
-- ============================================
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  locale text not null default 'ja' check (locale in ('en', 'ja')),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on public.user_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
