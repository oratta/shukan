# Design: user-profiles-db

## Context

- KPI 計算（健康寿命 / 前向きな気持ちの時間 / 出費削減 / 稼ぐ能力）の入力は現在 `V2_DEFAULT_PROFILE`（`src/types/impact.ts`、42歳男性ハードコード）のみ。per-user の実データ置き場がない
- `docs/context/onboarding-data-model.md`（確定）§1.1 で `user_profiles` の DDL と「入力だけ保存し、派生値は計算で出す」原則が確定済み
- 既存 DB アクセスの流儀: `src/lib/supabase/habits.ts`（Row interface → `toXxx()` 変換 → camelCase ドメイン型）
- 既存 1:1 テーブルの先例: `user_settings`（user_id PK、RLS は select / insert / update の 3 ポリシー、delete なし）
- 本 change は longrun run `2026-06-12_onboarding-kpi` の change-B。change-A（静的カタログ）に依存し、change-C（オンボーディング画面）から利用される

## Goals / Non-Goals

### Goals
- `user_profiles` テーブル + RLS のマイグレーションを作成し、dev に `supabase db push` で適用する
- `src/lib/supabase/profiles.ts`: fetch / upsert の CRUD（habits.ts と同じマッピング流儀）
- `src/lib/profile.ts`: 派生値計算の純粋関数（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears）と、年収未入力時の平均年収表フォールバック、プロフィール未設定時の `V2_DEFAULT_PROFILE` フォールバック
- 派生値計算のユニットテスト（受け入れ条件 15: 収入未入力で日給が平均年収表の値になる）

### Non-Goals
- オンボーディング UI / リダイレクト誘導（change-C）
- 平均余命表・平均年収表カタログ自体の作成（change-A の `src/data/life-expectancy.ts` / `src/data/average-income.ts`）
- 既存コードの `V2_DEFAULT_PROFILE` 参照箇所の差し替え（プロフィール実データへの切り替えは change-C 以降）
- prod への適用（dev のみ。prod 昇格は別運用）
- プロフィール編集 UI・設定画面への追加（別 run）

## Decisions

### D1: 派生値は DB に保存しない（plan.md rule）
- **決定**: `user_profiles` は入力カラムのみ。age / remainingLifeExpectancy / dailyWage / remainingWorkingYears は `src/lib/profile.ts` の純粋関数で都度計算する
- **理由**: data-model.md §1.1 で確定済み。誕生年からの年齢は時間経過で変わるため保存すると陳腐化する
- **代替案**: 派生値カラムを持つ → 更新トリガーや再計算ジョブが必要になり却下

### D2: RLS は user_settings と同型（select / insert / update のみ、delete なし）
- **決定**: `Users can view own profile` (select) / `Users can insert own profile` (insert) / `Users can update own profile` (update) の 3 ポリシー。delete ポリシーは作らない
- **理由**: plan.md config.yaml rule「RLSは既存 user_settings と同型にする」。アカウント削除時は `references auth.users(id) on delete cascade` で行も消えるため delete ポリシー不要
- **代替案**: habits 同様に delete ポリシーも付ける → user_settings と非同型になるため却下

### D3: updated_at はアプリ側で upsert 時に設定（トリガーなし）
- **決定**: `updated_at timestamptz not null default now()` とし、`upsertUserProfile` が payload に `updated_at: new Date().toISOString()` を含める
- **理由**: 既存の `upsertDailyReflection`（habits.ts）と同じ流儀。DB トリガーは本プロジェクトに先例がなく、シンプルさ優先
- **代替案**: `moddatetime` トリガー → 新パターン導入になるため却下（YAGNI）

### D4: CRUD は upsert 一本化（insert / update を分けない）
- **決定**: `profiles.ts` は `fetchUserProfile(): Promise<UserProfile | null>` と `upsertUserProfile(userId, input): Promise<UserProfile>` の 2 関数。upsert は `onConflict: 'user_id'`
- **理由**: 1 ユーザー 1 行（PK = user_id）で、オンボーディング完了時の書き込みは「あれば更新・なければ作成」が自然。`upsertDailyReflection` と同じパターン
- **代替案**: insert / update 分離 → 呼び出し側が存在チェックを持つことになり却下

### D5: 計算定数は profile.ts に定数として持つ
- **決定**: `RETIREMENT_AGE = 65`、`WORKING_DAYS_PER_YEAR = 240` を `src/lib/profile.ts` の定数とする
- **理由**: `V2_DEFAULT_PROFILE` の整合から逆算（age 42 → remainingWorkingYears 23 = 65 − 42、annualIncome 15,000,000 → dailyWage 62,500 = 15,000,000 ÷ 240）。既存ハードコード値と矛盾しない
- **代替案**: プロフィールに労働日数を持たせる → オンボーディング入力を増やさない方針（data-model.md）に反するため却下

### D6: 平均余命・平均年収はカタログ参照のインターフェースに依存
- **決定**: `profile.ts` は change-A の `src/data/life-expectancy.ts` / `src/data/average-income.ts` のルックアップ関数（age × gender × country → 値）を import して使う。表の中身（日本のみ・5歳刻み）には依存しない
- **理由**: change-B の責務は計算ロジック。表の粒度拡張（国追加など）が profile.ts に波及しないようにする
- **リスク対応**: change-A 未完了の状態で着手する場合は、ルックアップ関数のシグネチャだけ合意してテストはモック/スタブで先行できる

### D7: 型は profiles.ts 側に UserProfile として定義
- **決定**: ドメイン型 `UserProfile`（camelCase）と Row interface（snake_case）は `src/lib/supabase/profiles.ts` に定義し、派生値の型 `DerivedProfileValues` は `src/lib/profile.ts` に定義する
- **理由**: habits の流儀ではドメイン型は `src/types/` だが、profile は利用箇所が限定的なため定義をライブラリに同居させてシンプルに保つ。利用が広がったら `src/types/` へ移動可能（可逆）
- **注**: `gender` の型は DDL の CHECK と一致させる: `'male' | 'female' | 'other' | 'unspecified'`

## Risks / Trade-offs

- [change-A の表がまだ無い状態でテストを書くと壊れやすい] → ルックアップ関数のシグネチャを spec（このドキュメント）で固定し、profile.ts のテストでは表の具体値に依存しすぎない（「表から引いた値で計算される」ことの検証はモック値で行う）
- [`supabase db push` が dev に即適用される] → マイグレーションは追加のみ（destructive 変更なし）。ロールバックは `drop table public.user_profiles` のみで完結する独立テーブル
- [tracked_kpis の値が静的カタログのキーと乖離する可能性] → DB に CHECK は付けない（カタログは src/data 管理で変わり得るため）。整合性はアプリ層（change-C の書き込み時にカタログキーのみ渡す）で担保
- [V2_DEFAULT_PROFILE の二重管理] → 本 change では既存値を変更せず参照のみ。実データ移行が完了した将来 run で削除を検討

## Migration Plan

1. `supabase/migrations/<timestamp>_user_profiles.sql` を作成（create table + enable RLS + 3 ポリシー）
2. `supabase db push` で dev プロジェクト（xhqddzdpcpvxpprxykct）に適用
3. ロールバックが必要な場合: `drop table public.user_profiles;`（他テーブルから参照されておらず独立）
4. prod への適用は本 change のスコープ外（既存の prod 昇格運用に従う）

## Open Questions

（なし。判断が必要だった点はすべて Decisions に記録済み）
