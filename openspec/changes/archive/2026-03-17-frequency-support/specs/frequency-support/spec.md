# Spec: 頻度サポート（Daily / Weekly 対応）

## Requirements

---

### REQ-FS-01: 型定義の更新

システムは `everyday` / `weekday` / `custom` / `weekly` の4種別を型システムで表現できなければならない（MUST）。

```typescript
// src/types/habit.ts
frequency: 'everyday' | 'weekday' | 'custom' | 'weekly';
weeklyTarget?: number; // Weekly の場合のみ使用（デフォルト1）
customDays?: number[]; // Custom の場合のみ使用（0=日, 1=月, ... 6=土）
```

#### Scenario: frequency 型の更新
- WHEN: `Habit` 型を参照する
- THEN: `frequency` フィールドは `'everyday' | 'weekday' | 'custom' | 'weekly'` を受け付ける
- AND: `weeklyTarget` は optional number フィールドとして存在する
- AND: `customDays` は optional number[] フィールドとして存在する
- AND: 旧 `'daily'` は型として存在しない

---

### REQ-FS-02: DB マイグレーション

システムはデータベーススキーマを新しい頻度種別に対応させなければならない（MUST）。

```sql
-- frequency の CHECK 制約を更新
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_check;
ALTER TABLE habits ADD CONSTRAINT habits_frequency_check
  CHECK (frequency IN ('everyday', 'weekday', 'custom', 'weekly'));

-- 既存の 'daily' → 'everyday' に一括変換
UPDATE habits SET frequency = 'everyday' WHERE frequency = 'daily';

-- weekly_target カラム追加（週に何回の目標）
ALTER TABLE habits ADD COLUMN weekly_target integer DEFAULT 1;
```

#### Scenario: 既存データのマイグレーション
- WHEN: マイグレーションを適用する
- THEN: `frequency = 'daily'` のすべてのレコードが `frequency = 'everyday'` に変換される
- AND: `weekly_target` カラムが追加され、既存レコードのデフォルト値は `1` になる
- AND: `frequency = 'weekly'` や `'custom'` の既存レコードは存在しないため安全

> 注: `custom_days integer[]` カラムは既存のDBスキーマに存在するため、マイグレーション不要。

---

### REQ-FS-03: Supabase CRUD マッピング

システムは `weekly_target` カラムを camelCase / snake_case 変換でマッピングできなければならない（MUST）。

#### Scenario: weeklyTarget のマッピング
- WHEN: `getHabits` で習慣を取得する
- THEN: DB の `weekly_target` が TypeScript の `weeklyTarget` にマッピングされる
- WHEN: `createHabit` / `updateHabit` で習慣を保存する
- THEN: TypeScript の `weeklyTarget` が DB の `weekly_target` にマッピングされる

---

### REQ-FS-04: isTargetDay ヘルパー関数

システムは習慣と日付を受け取り、その日が習慣の対象日かどうかを返す関数を持たなければならない（MUST）。

```typescript
export function isTargetDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=日, 1=月, ... 6=土
  switch (habit.frequency) {
    case 'everyday': return true;
    case 'weekday': return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'custom': return (habit.customDays ?? []).includes(dayOfWeek);
    case 'weekly': return true; // どの日にやってもOK
    default: return true;
  }
}
```

#### Scenario: everyday は毎日対象
- WHEN: `isTargetDay({ frequency: 'everyday' }, anyDate)` を呼ぶ
- THEN: `true` を返す

#### Scenario: weekday は平日のみ対象
- WHEN: `isTargetDay({ frequency: 'weekday' }, monday)` を呼ぶ（月曜日）
- THEN: `true` を返す
- WHEN: `isTargetDay({ frequency: 'weekday' }, saturday)` を呼ぶ（土曜日）
- THEN: `false` を返す
- WHEN: `isTargetDay({ frequency: 'weekday' }, sunday)` を呼ぶ（日曜日）
- THEN: `false` を返す

#### Scenario: custom は指定曜日のみ対象
- GIVEN: `{ frequency: 'custom', customDays: [1, 3, 5] }` （月・水・金）
- WHEN: `isTargetDay(habit, monday)` を呼ぶ
- THEN: `true` を返す
- WHEN: `isTargetDay(habit, tuesday)` を呼ぶ
- THEN: `false` を返す

#### Scenario: weekly は毎日対象
- WHEN: `isTargetDay({ frequency: 'weekly' }, anyDate)` を呼ぶ
- THEN: `true` を返す

---

### REQ-FS-05: shouldShowToday の簡素化

システムは非アーカイブ習慣を常にホーム画面に表示しなければならない（MUST）。

```typescript
export function shouldShowToday(habit: Habit): boolean {
  return !habit.archived;
}
```

#### Scenario: 非アーカイブ習慣は頻度に関わらず表示
- WHEN: `shouldShowToday({ archived: false, frequency: 'weekday' })` を呼ぶ（土曜日であっても）
- THEN: `true` を返す
- WHEN: `shouldShowToday({ archived: true, frequency: 'everyday' })` を呼ぶ
- THEN: `false` を返す

---

### REQ-FS-06: 自動スキップの実装

システムは非対象日の習慣に `skippedToday: true` を自動付与しなければならない（MUST）。
DB への `skipped` レコード書き込みは行ってはならない（MUST NOT）。

自動スキップの優先順位:
1. 今日のレコードが `status='skipped'` → `skippedToday = true`（ユーザー手動スキップ）
2. 今日のレコードが `status='completed'/'failed'/'rocket_used'/'none'` → `skippedToday = false`（ユーザー操作済み）
3. 今日のレコードがない + `isTargetDay = false` → `skippedToday = true`（自動スキップ）
4. 今日のレコードがない + `isTargetDay = true` → `skippedToday = false`（通常の未実施）

#### Scenario: weekday 習慣の土曜日は自動スキップ
- GIVEN: `{ frequency: 'weekday' }` の習慣がある
- GIVEN: 今日が土曜日で今日の completion レコードが存在しない
- WHEN: `getHabitsWithStats` を呼ぶ
- THEN: 該当習慣の `skippedToday` が `true` になる
- AND: DB に `skipped` レコードは書き込まれない

#### Scenario: custom 習慣の非対象曜日は自動スキップ
- GIVEN: `{ frequency: 'custom', customDays: [1, 3, 5] }` （月・水・金）の習慣がある
- GIVEN: 今日が火曜日で今日の completion レコードが存在しない
- WHEN: `getHabitsWithStats` を呼ぶ
- THEN: 該当習慣の `skippedToday` が `true` になる

#### Scenario: ユーザーが手動で unskip すると自動スキップが解除される
- GIVEN: 土曜日に weekday 習慣が自動スキップされている
- WHEN: ユーザーが Unskip ボタンをタップする
- THEN: `setDayStatus(habitId, today, 'none')` が呼ばれる
- AND: DB に `status='none'` のレコードが作られる（upsert パターン）
- AND: 以降その習慣の `skippedToday` は `false` になる（自動スキップが上書きされる）

> 注: Auto-skip解除にはDBレコード（status='none'）の明示的挿入が必要。既存のdeleteCompletionパターンではなくupsertパターンを使用する。これにより次のレンダリングで自動スキップが再適用されることを防ぐ。本動作はhabit-skipスペックのunskipパターン（deleteCompletion）とは異なる点に注意。

#### Scenario: ユーザーが非対象日に完了すると自動スキップ対象外になる
- GIVEN: 土曜日に weekday 習慣がある
- WHEN: ユーザーが完了マークをつける（`status='completed'`）
- THEN: `skippedToday = false`（完了レコードが存在するため自動スキップ条件が不成立）

---

### REQ-FS-07: Daily 系のストリーク計算（スキップ透過処理の継続）

Daily 系（everyday / weekday / custom）習慣のストリーク計算は、自動スキップされた日を既存の手動スキップ同様に「透明な日」として処理しなければならない（MUST）。

#### Scenario: weekday 習慣の土日をまたいだストリーク維持
- GIVEN: `{ frequency: 'weekday' }` の習慣
- GIVEN: 金曜日に完了、土日は自動スキップ（レコードなし）、月曜日に完了
- WHEN: `calculateStreak` を呼ぶ
- THEN: ストリークは途切れない（土日の自動スキップが透明日として扱われる）

---

### REQ-FS-08: Weekly 習慣のストリーク計算（連続達成週数）

システムは Weekly 習慣のストリークを連続達成週数で計算しなければならない（MUST）。

- 週の区切り: 月曜始まり（ISO 8601）
- 達成週の定義: 1週間の completed 数が `weeklyTarget` 以上
- 今週が目標達成済みの場合: 今週もカウントに含める
- 今週が目標未達成の場合: 今週はカウントせず、直前の連続達成週数を返す

#### Scenario: Weekly 習慣の連続達成週ストリーク
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 3 }` の習慣
- GIVEN: 先週 3 回完了（達成）、今週すでに 3 回完了（達成）
- WHEN: Weekly 用のストリーク計算を呼ぶ
- THEN: `currentStreak = 2`（連続2週達成）

#### Scenario: Weekly 習慣の今週未達成は連続に含めない
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 2 }` の習慣
- GIVEN: 先週 2/2 達成、今週 1/2（未達成）
- WHEN: Weekly 用のストリーク計算を呼ぶ
- THEN: `currentStreak = 1`（先週の達成のみカウント、今週は含めない）

---

### REQ-FS-09: Weekly 習慣の completionRate（過去12週ベース）

システムは Weekly 習慣の completionRate を過去12週の達成週数で計算しなければならない（MUST）。

- 分母: 12（過去12週）
- 分子: 過去12週のうち `weeklyTarget` を達成した週の数
- 結果: 0.0 〜 1.0

#### Scenario: Weekly completionRate の計算
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 2 }` の習慣
- GIVEN: 過去12週のうち9週で weeklyTarget 達成
- WHEN: Weekly 用の completionRate 計算を呼ぶ
- THEN: `completionRate = 9 / 12 = 0.75`

---

### REQ-FS-10: HabitForm の頻度選択 UI

システムは習慣作成・編集フォームで頻度を選択できなければならない（MUST）。

#### Scenario: Daily / Weekly カテゴリ選択
- WHEN: HabitForm を表示する
- THEN: 頻度セクションに `[ Daily ] [ Weekly ]` のタブ/セグメントが表示される
- AND: デフォルトは Daily が選択された状態

#### Scenario: Daily サブタイプ選択
- GIVEN: Daily カテゴリが選択されている
- WHEN: フォームを表示する
- THEN: `毎日(Everyday)` / `平日(Weekday)` / `カスタム(Custom)` の3択が表示される
- AND: デフォルトは `everyday` が選択された状態

#### Scenario: Custom サブタイプの曜日チップ
- GIVEN: Daily カテゴリの `Custom` が選択されている
- WHEN: フォームを表示する
- THEN: 7つの曜日チップ（月・火・水・木・金・土・日）が表示される
- AND: 複数選択可能
- AND: 最低1日は選択必須（バリデーション）

#### Scenario: Weekly の回数セレクター
- GIVEN: Weekly カテゴリが選択されている
- WHEN: フォームを表示する
- THEN: `週に [1 ▾] 回` の回数セレクター（1〜7）が表示される
- AND: デフォルトは 1

---

### REQ-FS-11: HabitCard の Weekly 進捗表示

システムは Weekly 習慣のカードに「今週の進捗」を表示しなければならない（MUST）。

#### Scenario: Weekly 習慣の今週進捗表示
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 3 }` の習慣
- GIVEN: 今週 2 回完了している
- WHEN: HabitCard を表示する
- THEN: 習慣名の下に `今週 2/3 回`（日本語）または `This week 2/3`（英語）が表示される

#### Scenario: Weekly 習慣の今週目標達成時の表示
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 3 }` の習慣
- GIVEN: 今週 3 回完了している（目標達成）
- WHEN: HabitCard を表示する
- THEN: `今週 3/3 回 ✓` のような達成マーク付きの表示になる

#### Scenario: Weekly 習慣の StatusIndicator
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 3 }` の習慣
- GIVEN: 今週 2 回完了（未達成）
- WHEN: HabitCard を表示する
- THEN: StatusIndicator は `border-2 border-gray-300`（未完了円）
- GIVEN: 今週 3 回完了（達成）
- THEN: StatusIndicator は `bg-[#3D8A5A]` + Check アイコン

#### Scenario: Weekly 習慣の StatusIndicator タップ
- WHEN: ユーザーが Weekly 習慣の StatusIndicator をタップする
- THEN: `setDayStatus(habitId, today, 'completed')` が呼ばれる
- AND: 今週の完了カウントが1増える

---

### REQ-FS-12: HabitCard の Daily 非 everyday 頻度ラベル表示

システムは weekday / custom 習慣のカードに頻度情報を表示しなければならない（MUST）。

#### Scenario: weekday 習慣の頻度ラベル
- GIVEN: `{ frequency: 'weekday' }` の習慣
- WHEN: HabitCard を表示する
- THEN: 習慣名の下に `平日`（日本語）または `Weekdays`（英語）が小さく表示される（i18n キー: `habits.weekday`）

#### Scenario: custom 習慣の頻度ラベル
- GIVEN: `{ frequency: 'custom', customDays: [1, 3, 5] }` の習慣
- WHEN: HabitCard を表示する
- THEN: 習慣名の下に `月・水・金`（日本語）または `Mon, Wed, Fri`（英語）が小さく表示される

#### Scenario: everyday 習慣は頻度ラベルを表示しない
- GIVEN: `{ frequency: 'everyday' }` の習慣
- WHEN: HabitCard を表示する
- THEN: 頻度ラベルは表示されない（従来の表示を維持）

---

### REQ-FS-13: i18n 対応

システムは頻度サポートの文字列を日英両言語で表示できなければならない（MUST）。

| キー | 日本語 | 英語 |
|------|--------|------|
| `habits.frequencyDaily` | デイリー | Daily |
| `habits.frequencyWeekly` | ウィークリー | Weekly |
| `habits.everyday` | 毎日 | Everyday |
| `habits.weekday` | 平日 | Weekdays |
| `habits.frequencyCustom` | カスタム | Custom |
| `habits.selectDays` | 曜日を選択 | Select days |
| `habits.timesPerWeek` | 週に{count}回 | {count} times/week |
| `habits.weeklyProgress` | 今週 {current}/{target} 回 | This week {current}/{target} |

---

### REQ-FS-14: recentDays ドットの頻度対応

システムは HabitCard の recentDays ドット表示を頻度に応じてフィルタリングしなければならない（MUST）。

#### Scenario: everyday は全ての直近日を表示
- GIVEN: `{ frequency: 'everyday' }` の習慣
- WHEN: HabitCard の recentDays ドットを表示する
- THEN: 直近の全日（例: 過去7日）のドットが表示される

#### Scenario: weekday は平日のドットのみ表示
- GIVEN: `{ frequency: 'weekday' }` の習慣
- WHEN: HabitCard の recentDays ドットを表示する
- THEN: 平日（月〜金）に対応するドットのみが表示される
- AND: 土日のドットは表示されない

#### Scenario: custom は対象曜日のドットのみ表示
- GIVEN: `{ frequency: 'custom', customDays: [1, 3, 5] }` （月・水・金）の習慣
- WHEN: HabitCard の recentDays ドットを表示する
- THEN: 月・水・金に対応するドットのみが表示される
- AND: それ以外の曜日のドットは表示されない

#### Scenario: weekly は全ての直近7日を表示
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 3 }` の習慣
- WHEN: HabitCard の recentDays ドットを表示する
- THEN: 直近の全7日のドットが表示される（どの日に実施してもよいため）

---

## Test Scenarios

### SCENARIO-FS-01: isTargetDay - everyday は全ての日が対象
- WHEN: `isTargetDay({ frequency: 'everyday' }, new Date('2026-03-14'))` を呼ぶ
- THEN: `true` を返す

### SCENARIO-FS-02: isTargetDay - weekday は平日のみ対象
- WHEN: `isTargetDay({ frequency: 'weekday' }, new Date('2026-03-14'))` を呼ぶ（土曜日）
- THEN: `false` を返す
- WHEN: `isTargetDay({ frequency: 'weekday' }, new Date('2026-03-16'))` を呼ぶ（月曜日）
- THEN: `true` を返す

### SCENARIO-FS-03: isTargetDay - custom は指定曜日のみ
- GIVEN: `{ frequency: 'custom', customDays: [1, 3, 5] }` （月=1, 水=3, 金=5）
- WHEN: `isTargetDay(habit, new Date('2026-03-16'))` を呼ぶ（月曜日）
- THEN: `true` を返す
- WHEN: `isTargetDay(habit, new Date('2026-03-17'))` を呼ぶ（火曜日）
- THEN: `false` を返す

### SCENARIO-FS-04: isTargetDay - weekly は全ての日が対象
- WHEN: `isTargetDay({ frequency: 'weekly', weeklyTarget: 3 }, new Date('2026-03-14'))` を呼ぶ
- THEN: `true` を返す

### SCENARIO-FS-05: shouldShowToday - 非アーカイブなら常に true
- WHEN: `shouldShowToday({ archived: false, frequency: 'weekday' })` を呼ぶ
- THEN: `true` を返す（曜日・頻度に関わらず）

### SCENARIO-FS-06: shouldShowToday - アーカイブは false
- WHEN: `shouldShowToday({ archived: true, frequency: 'everyday' })` を呼ぶ
- THEN: `false` を返す

### SCENARIO-FS-07: 自動スキップ - 非対象日はレコードなしで skippedToday=true
- GIVEN: `{ frequency: 'weekday' }` の習慣、今日が土曜日
- GIVEN: 今日の completion レコードが存在しない
- WHEN: `getHabitsWithStats` を呼ぶ
- THEN: 該当習慣の `skippedToday` が `true`

### SCENARIO-FS-08: 自動スキップ - ユーザー完了は自動スキップを上書きしない
- GIVEN: `{ frequency: 'weekday' }` の習慣、今日が土曜日
- GIVEN: 今日の completion レコードが `status='completed'`
- WHEN: `getHabitsWithStats` を呼ぶ
- THEN: 該当習慣の `skippedToday` が `false`

### SCENARIO-FS-09: 自動スキップ - unskip で明示的 none レコードが作られると自動スキップ解除
- GIVEN: `{ frequency: 'weekday' }` の習慣、今日が土曜日（自動スキップ状態）
- WHEN: `setDayStatus(habitId, today, 'none')` が呼ばれる
- THEN: DB に `status='none'` のレコードが挿入される
- THEN: 以降 `getHabitsWithStats` で `skippedToday = false`

### SCENARIO-FS-10: Weekly completionRate の計算
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 2 }` の習慣
- GIVEN: 過去12週のうち6週で weeklyTarget 達成
- WHEN: Weekly completionRate を計算する
- THEN: `completionRate = 6 / 12 = 0.5`

### SCENARIO-FS-11: Weekly ストリーク - 連続達成週数
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 2 }` の習慣
- GIVEN: 先々週 2 回完了、先週 2 回完了、今週 2 回完了
- WHEN: Weekly ストリーク計算を呼ぶ
- THEN: `currentStreak = 3`（連続3週達成）

### SCENARIO-FS-12: Weekly ストリーク - 今週未達成は連続に含めない
- GIVEN: `{ frequency: 'weekly', weeklyTarget: 2 }` の習慣
- GIVEN: 先週 2/2 達成、今週 1/2（未達成）
- WHEN: Weekly ストリーク計算を呼ぶ
- THEN: `currentStreak = 1`（先週の達成のみカウント、今週は含めない）
