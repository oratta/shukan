-- ============================================
-- Add quit habit support
-- ============================================

-- Add type and daily_target columns to habits
ALTER TABLE public.habits
  ADD COLUMN type text NOT NULL DEFAULT 'positive'
    CHECK (type IN ('positive', 'quit')),
  ADD COLUMN daily_target integer NOT NULL DEFAULT 1;

-- ============================================
-- Table: coping_steps
-- Ordered sub-tasks for quit habits (if-then coping plan)
-- ============================================
CREATE TABLE public.coping_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coping_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage coping steps via habit ownership"
  ON public.coping_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.habits WHERE id = coping_steps.habit_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.habits WHERE id = coping_steps.habit_id AND user_id = auth.uid())
  );

CREATE INDEX idx_coping_steps_habit ON public.coping_steps(habit_id, sort_order);

-- ============================================
-- Table: urge_logs
-- One record per urge-response cycle
-- ============================================
CREATE TABLE public.urge_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed_steps text[] NOT NULL DEFAULT '{}',
  all_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.urge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own urge logs"
  ON public.urge_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_urge_logs_habit_date ON public.urge_logs(habit_id, date);
CREATE INDEX idx_urge_logs_user_date ON public.urge_logs(user_id, date);
