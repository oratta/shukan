# Proposal: user-profiles-db

## Why

KPI 計算の入力（年齢・性別・国・年収）と選んだ KPI は、現在 `V2_DEFAULT_PROFILE`（42歳男性・年収1,500万円のハードコード）しか存在せず、ユーザーごとの実データを保存する場所がない。オンボーディング（change-C: onboarding-flow）の完了時に「プロフィール＋選んだ KPI」を書き込むための DB テーブルと周辺ロジックを先に用意する必要がある。

## What Changes

- 新規テーブル `user_profiles` のマイグレーションを追加する（`docs/context/onboarding-data-model.md` §1.1 の確定 DDL に従う: user_id PK / birth_year / gender / country / annual_income / currency / tracked_kpis text[] / created_at / updated_at）
- `user_profiles` に RLS を設定する（自分のみ select / insert / update。既存 `user_settings` と同型）
- `supabase db push` で dev プロジェクトに適用する
- `src/lib/supabase/profiles.ts` を新規作成する（CRUD。`src/lib/supabase/habits.ts` と同じ snake_case↔camelCase マッピングの流儀）
- `src/lib/profile.ts` を新規作成する（派生値計算: age / remainingLifeExpectancy / dailyWage / remainingWorkingYears。年収未入力時は平均年収表フォールバック）
- `V2_DEFAULT_PROFILE` はプロフィール未設定時のフォールバック既定値として残す（削除しない）

制約（plan.md config.yaml rules）:
- 派生値（年齢・残存余命・日給）は DB に保存しない。入力だけ保存し計算で出す
- RLS は既存 `user_settings` と同型にする

## Capabilities

### New Capabilities
- `user-profiles`: ユーザープロフィールの保存・取得（user_profiles テーブル + CRUD）、派生値計算（年齢・残存余命・日給・残労働年数、平均年収フォールバック）、RLS による本人限定アクセス

### Modified Capabilities
（なし。既存 spec の requirement 変更はない。impact-calculation の 4KPI 化は change-A: kpi-data-foundation が担当）

## Impact

### 影響を受けるコード
- `supabase/migrations/<timestamp>_user_profiles.sql` - 新規マイグレーション（テーブル + RLS）
- `src/lib/supabase/profiles.ts` - 新規（fetch / upsert）
- `src/lib/profile.ts` - 新規（派生値計算）
- `src/types/impact.ts` - `V2_DEFAULT_PROFILE` は変更せずフォールバックとして参照される

### 依存関係
- change-A: kpi-data-foundation の静的カタログ（平均余命表 `src/data/life-expectancy.ts` / 平均年収表 `src/data/average-income.ts`）を参照する
- change-C: onboarding-flow が本 change の `profiles.ts` / `profile.ts` を利用する（本 change は UI を含まない）

### 影響を受けるシステム
- Supabase dev プロジェクト（`xhqddzdpcpvxpprxykct`）に `user_profiles` テーブルが追加される
- 既存テーブル（habits / habit_evidences / habit_completions / daily_reflections / user_settings）は変更しない

### 後方互換性
- 既存機能はすべて `V2_DEFAULT_PROFILE` を参照したまま動作する（本 change では既存呼び出し箇所を差し替えない）
