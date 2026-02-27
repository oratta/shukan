-- Add missing UPDATE policy for habit_completions
-- Required for upsert (status toggle: completed <-> failed)
create policy "Users can update own completions"
  on public.habit_completions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
