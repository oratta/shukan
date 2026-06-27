# Verification Guide: オンボーディング v2「一生インパクト診断」

各 change の Scenario（plan.md 受け入れ条件由来）に対する TDD 進捗トラッカー。
builder が「テスト実装完了」「ロジック実装完了」を進捗に応じて [x] 化する。

## change-A: habit-status-model

### A-S1: habits に status / established_since 列を追加（後方互換・既定 'active'）（AC#5）
- WHEN マイグレーションを適用 THEN status が NOT NULL DEFAULT 'active'（既存行は壊れず active）、
  established_since が nullable date で追加される。既存 RLS は維持。
- 検証: `src/__tests__/habit-status-migration.test.ts`（SQL 定義検証）
- [x] テスト実装完了
- [x] ロジック実装完了（`supabase/migrations/20260627000000_habit_status.sql`）

### A-S2: status='established' を established_since 付きで保存・取得（snake↔camel 往復）（AC#6）
- WHEN established 習慣を established_since 付きで insert し読み出す THEN status / establishedSince が往復で保持される。
  status が欠落（未マイグレーション行 / select 漏れ）でも 'active' にフォールバックし undefined を漏らさない。
- 検証: `src/__tests__/habit-status-crud.test.ts`（toHabit / buildHabitInsertRow / 往復）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/supabase/habits.ts` toHabit / buildHabitInsertRow / insertHabit / updateHabitById、`src/types/habit.ts` Habit.status / HabitInsertInput）

### A-S3: insertHabit シグネチャが status / established_since を運べる（change-C 配線用）
- WHEN onboarding v2 が established 習慣を保存 THEN insertHabit が status='established' と establishedSince を
  DB へ書き込める（既存書き込み経路は status 省略で後方互換）。
- 検証: `src/__tests__/habit-status-crud.test.ts`（buildHabitInsertRow 経由）＋ 型（HabitInsertInput）
- [x] テスト実装完了
- [x] ロジック実装完了

> 備考: `supabase db push` は remote dev の既存マイグレーション履歴乖離（本 change 無関係）のため builder では保留。
> SQL は `add column if not exists` で冪等・非破壊。詳細は decisions.md D-A3。
