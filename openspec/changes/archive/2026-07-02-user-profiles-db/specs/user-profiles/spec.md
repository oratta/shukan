# user-profiles Specification (Delta)

この change は DB / ライブラリ層のため、Scenario は「関数呼び出し → 結果」レベルで記述する。

## ADDED Requirements

### Requirement: user_profiles テーブルにプロフィール入力値のみを保存する

システムは `user_profiles` テーブル（user_id PK / birth_year / gender / country / annual_income / currency / tracked_kpis text[] / created_at / updated_at）にユーザーのプロフィール入力値を保存しなければならない（MUST）。派生値（age / remainingLifeExpectancy / dailyWage / remainingWorkingYears）は DB に保存してはならない（MUST NOT）。保存するのは入力だけで、派生値は計算で出す。

#### Scenario: 新規プロフィールを保存する
- **WHEN** `upsertUserProfile(userId, { birthYear: 1984, gender: 'male', country: 'JP', annualIncome: 15000000, currency: 'JPY', trackedKpis: ['cost_saving'] })` を呼び出す
- **THEN** `user_profiles` に該当ユーザーの行が 1 行作成され、camelCase の `UserProfile` オブジェクトが返る
- **THEN** 行には入力値のみが含まれ、年齢・残存余命・日給などの派生値カラムは存在しない

#### Scenario: 既存プロフィールを更新する
- **WHEN** すでに行が存在するユーザーで `upsertUserProfile(userId, { ...既存値, trackedKpis: ['health_lifespan'] })` を呼び出す
- **THEN** 行が増えず（user_id PK で 1 ユーザー 1 行のまま）、`tracked_kpis` が `{'health_lifespan'}` に更新される
- **THEN** `updated_at` が更新後の時刻になる

#### Scenario: 年収未入力でも保存できる
- **WHEN** `upsertUserProfile(userId, { birthYear: 1990, gender: 'female', country: 'JP', annualIncome: null, currency: 'JPY', trackedKpis: ['earning'] })` を呼び出す
- **THEN** `annual_income` が NULL の行が保存され、エラーにならない

#### Scenario: gender に不正な値を保存しようとする
- **WHEN** `gender` に `'male' | 'female' | 'other' | 'unspecified'` 以外の値で insert を試みる
- **THEN** DB の CHECK 制約違反でエラーになり、行は保存されない

### Requirement: プロフィールを取得して camelCase で返す

システムは `fetchUserProfile()` でログイン中ユーザーの `user_profiles` 行を取得し、snake_case カラムを camelCase フィールドにマッピングした `UserProfile` を返さなければならない（MUST）。行が存在しない場合は `null` を返さなければならない（MUST）。マッピングの流儀は `src/lib/supabase/habits.ts`（Row interface + `toXxx()` 変換関数）に合わせる。

#### Scenario: 作成済みプロフィールを取得する
- **WHEN** プロフィール作成済みユーザーで `fetchUserProfile()` を呼び出す
- **THEN** `{ userId, birthYear, gender, country, annualIncome, currency, trackedKpis, createdAt, updatedAt }` 形の camelCase オブジェクトが返る
- **THEN** `tracked_kpis` text[] は string 配列 `trackedKpis` として選択順のまま返る

#### Scenario: 未作成ユーザーの取得は null
- **WHEN** `user_profiles` に行がないユーザーで `fetchUserProfile()` を呼び出す
- **THEN** エラーを投げずに `null` が返る

### Requirement: プロフィールから派生値を計算する

システムは `src/lib/profile.ts` の純粋関数でプロフィール入力値から派生値を計算しなければならない（MUST）:
- `age` = 現在年 − birthYear
- `remainingLifeExpectancy` = 平均余命表カタログ（age × gender × country）を参照した残存余命
- `dailyWage` = annualIncome ÷ 年間労働日数
- `remainingWorkingYears` = 退職年齢 − age

平均余命表・平均年収表カタログ（change-A: kpi-data-foundation の `src/data/life-expectancy.ts` / `src/data/average-income.ts`）を参照する。

#### Scenario: 年齢と残存余命の計算
- **WHEN** `{ birthYear: 1984, gender: 'male', country: 'JP' }` のプロフィールで派生値計算関数を呼び出す
- **THEN** `age` が現在年 − 1984 で算出される
- **THEN** `remainingLifeExpectancy` が平均余命表カタログの該当エントリ（age × gender × country）から引かれた値になる

#### Scenario: 年収入力済みの日給計算
- **WHEN** `annualIncome: 15000000` のプロフィールで日給計算関数を呼び出す
- **THEN** `dailyWage` が 15,000,000 ÷ 年間労働日数（定数）で算出される

#### Scenario: 残労働年数の計算
- **WHEN** `age` が退職年齢未満のプロフィールで `remainingWorkingYears` を計算する
- **THEN** 退職年齢（定数）− age が返る
- **WHEN** `age` が退職年齢以上のプロフィールで計算する
- **THEN** 負の値にならず 0 が返る

### Requirement: 年収未入力時は平均年収表でフォールバックする

システムは `annualIncome` が未入力（null）のプロフィールに対して、平均年収表カタログ（age × gender × country）の値を年収として日給などの計算を行わなければならない（MUST）。

#### Scenario: 年収未入力プロフィールの日給計算
- **WHEN** `{ birthYear: 1990, gender: 'female', country: 'JP', annualIncome: null }` のプロフィールで日給計算関数を呼び出す
- **THEN** 平均年収表カタログから該当する平均年収（age × gender × country）が引かれ、その値 ÷ 年間労働日数で `dailyWage` が算出される
- **THEN** エラーや NaN にならない

### Requirement: プロフィール未設定時は V2_DEFAULT_PROFILE にフォールバックする

システムはプロフィールが存在しない（`fetchUserProfile()` が null）場合、`V2_DEFAULT_PROFILE` を既定値として派生値計算に使えなければならない（MUST）。`V2_DEFAULT_PROFILE` は削除せず未設定時フォールバックとして残す。

#### Scenario: プロフィール null でのフォールバック
- **WHEN** プロフィールに `null` を渡して派生値の解決関数を呼び出す
- **THEN** `V2_DEFAULT_PROFILE` 相当の値（42歳・男性・年収 15,000,000 円・日給 62,500 円・残存余命 40 年・残労働年数 23 年）に基づく派生値が返る

### Requirement: RLS により本人のみが自分のプロフィールにアクセスできる

システムは `user_profiles` に RLS を設定し、認証済みユーザーが自分の行だけを select / insert / update できるようにしなければならない（MUST）。ポリシー構成は既存 `user_settings` と同型にする（select / insert / update の 3 ポリシー。delete ポリシーは作らない）。

#### Scenario: 本人は自分の行を読み書きできる
- **WHEN** ユーザー A の認証セッションで自分の行を select / insert / update する
- **THEN** すべて成功する

#### Scenario: 他人の行は見えない・書けない
- **WHEN** ユーザー A の認証セッションでユーザー B の行を select する
- **THEN** 結果は 0 行（B の行は返らない）
- **WHEN** ユーザー A が `user_id = B` の行を insert / update しようとする
- **THEN** RLS ポリシー違反で拒否される

#### Scenario: delete はポリシーがないため拒否される
- **WHEN** 認証済みユーザーが自分の `user_profiles` 行を delete しようとする
- **THEN** delete ポリシーが存在しないため拒否される（user_settings と同型）
