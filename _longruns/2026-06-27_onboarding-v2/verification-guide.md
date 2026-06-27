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

## change-B: lifetime-impact-calc

### B-S1: 過去累積計算（過去 horizon × 1回あたり効果・推定フラグ）（AC#7）
- WHEN established 習慣（established_since 付き）の過去累積を算出 THEN
  past = per-time 効果 × 過去 horizon（health_lifespan/positive_mood=elapsedYears×365、
  cost_saving/earning=elapsedYears×240）で算出され、established が1件以上あると pastIsEstimated=true。
- 検証: `src/__tests__/lifetime-impact.test.ts`（pastHorizonDays / computeLifetimeImpact past / pastIsEstimated）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/lifetime-impact.ts` pastHorizonDays / computeLifetimeImpact / pastIsEstimated）

### B-S2: 合算API が KPI4軸ごとに {past, future}（past=established のみ / future=active のみ）（AC#8）
- WHEN computeLifetimeImpact を呼ぶ THEN byKpi[kpi] に {past, future} を返し、
  future は active 習慣のみ・past は established 習慣のみで集計される（期間排他＝二重計上なし）。
- 検証: `src/__tests__/lifetime-impact.test.ts`（computeLifetimeImpact active/established 分離）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/lifetime-impact.ts` computeLifetimeImpact）

### B-S3: 未来一生分の horizon が KPI 種別で正しい（AC#8b）
- WHEN 未来 horizon を求める THEN health_lifespan/positive_mood=remainingLifeExpectancy×365、
  cost_saving/earning=remainingWorkingYears×WORKING_DAYS_PER_YEAR(240)。
- 検証: `src/__tests__/lifetime-impact.test.ts`（futureHorizonDays）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/lifetime-impact.ts` futureHorizonDays）

### B-S4: 健康寿命・前向きな気持ちの時間は分→年換算（端数丸め）（AC#9）
- WHEN health_lifespan/positive_mood の past/future を返す THEN 分→年（÷525,600）に換算し丸めて返す。
- 検証: `src/__tests__/lifetime-impact.test.ts`（MINUTES_PER_YEAR / convertAndRound 経由の health 換算）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/lifetime-impact.ts` MINUTES_PER_YEAR / convertAndRound）

### B-S5: 過去 horizon 近似の境界（established_since 未来日 / 0年 / 極端な長期）（D7）
- WHEN established_since が未来日 THEN past=0／当日（0年）THEN past≈0／極端な長期 THEN 大きな past（線形）。
- 検証: `src/__tests__/lifetime-impact.test.ts`（elapsedYearsSince 境界 / computeLifetimeImpact 境界 3ケース）
- [x] テスト実装完了
- [x] ロジック実装完了（`src/lib/lifetime-impact.ts` elapsedYearsSince クランプ）

> 備考: future は active のみ・past は established のみで期間排他のため二重計上なし。per-time 効果は
> presetPerTimeEffectValue を future/past 共通で再利用（plan.md change-B）。onboarding プリセットは
> everyday（頻度=1/日）前提のため頻度乗数は持たない（D3）。
