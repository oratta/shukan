-- redesign-quit-habit-input (issue #104):
-- quit 習慣の失敗日に「どれくらい我慢できたか」を 0-100 の整数で記録する。
-- null = 未入力（無抵抗と区別しないが、表示上は全面赤で同じ扱い）。
alter table habit_completions
  add column resist_rate int check (resist_rate >= 0 and resist_rate <= 100);
