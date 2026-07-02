# Tasks: user-profiles-db

## 1. マイグレーション（user_profiles + RLS）

- [x] 1.1 `supabase/migrations/<timestamp>_user_profiles.sql` を作成する（data-model.md §1.1 の DDL: user_id PK / birth_year / gender CHECK('male','female','other','unspecified') / country not null default 'JP' / annual_income / currency not null default 'JPY' / tracked_kpis text[] not null default '{}' / created_at / updated_at）
- [x] 1.2 同マイグレーションに RLS を追加する（enable row level security + user_settings と同型の 3 ポリシー: select / insert / update、delete なし）
- [x] 1.3 `supabase db push` で dev プロジェクトに適用し、テーブルとポリシーが作成されたことを確認する（remote 履歴衝突のため Management API で直接適用。詳細は decisions.md D-B1）

## 2. CRUD ライブラリ（src/lib/supabase/profiles.ts）

- [x] 2.1 `UserProfileRow`（snake_case）と `UserProfile`（camelCase）の型、`toUserProfile()` 変換関数を定義する（habits.ts の Row interface + toXxx() の流儀）
- [x] 2.2 `fetchUserProfile(): Promise<UserProfile | null>` を実装する（`maybeSingle()` で行なしは null を返す）
- [x] 2.3 `upsertUserProfile(userId, input): Promise<UserProfile>` を実装する（`onConflict: 'user_id'`、payload に `updated_at` を含める。annualIncome は null 許容）

## 3. 派生値計算（src/lib/profile.ts）

- [x] 3.1 定数 `RETIREMENT_AGE = 65` / `WORKING_DAYS_PER_YEAR = 240` と派生値型 `DerivedProfileValues` を定義する
- [x] 3.2 `age`（現在年 − birthYear）と `remainingWorkingYears`（退職年齢 − age、下限 0）の計算関数を実装する
- [x] 3.3 `remainingLifeExpectancy` の計算関数を実装する（change-A の `src/data/life-expectancy.ts` を age × gender で参照。実シグネチャは country 引数なし＝D6/YAGNI に従う）
- [x] 3.4 `dailyWage` の計算関数を実装する（annualIncome ÷ WORKING_DAYS_PER_YEAR。annualIncome が null のときは `src/data/average-income.ts` の平均年収（age × gender）でフォールバック）
- [x] 3.5 プロフィール未設定（null）時に `V2_DEFAULT_PROFILE` 相当の派生値を返すフォールバックを実装する（`V2_DEFAULT_PROFILE` は削除しない）

## 4. テスト

- [x] 4.1 `src/lib/profile.ts` のユニットテストを作成する（age / remainingWorkingYears の境界値含む。退職年齢以上で 0）
- [x] 4.2 収入未入力プロフィールで日給が平均年収表の値から計算されるユニットテストを作成する（受け入れ条件 15）
- [x] 4.3 プロフィール null 時に V2_DEFAULT_PROFILE 相当の派生値が返るテストを作成する
- [x] 4.4 `toUserProfile()` の snake↔camel マッピング（tracked_kpis 配列の順序保持、annual_income null）のテストを作成する

## 5. 検証

- [x] 5.1 `npm run test:run` で全テスト PASS を確認する（15 files / 258 tests PASS）
- [x] 5.2 `npm run build` で型チェック + ビルドが通ることを確認する（Compiled successfully）
- [x] 5.3 dev DB に対し RLS を確認する（live: pg_class.relrowsecurity=true / pg_policy で select・insert・update の 3 ポリシーのみ・delete なし / pg_constraint で gender CHECK 存在。認証セッションでの実書き込み動作確認は change-C で実施。詳細は decisions.md D-B2）
