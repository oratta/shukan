# Habit Skip Specification

## Requirements

### REQ-SK-01: スキップ機能の基本動作

システムは今日の習慣をスキップできなければならない（MUST）。

#### Scenario: 習慣をスキップする
- **GIVEN** 今日アクティブな習慣がある
- **WHEN** 習慣カードを展開し Skip ボタンをタップする
- **THEN** `habit_completions` テーブルに `{habitId, date=today, status='skipped'}` がupsertされる
- **THEN** 習慣の `skippedToday` が `true` になる
- **THEN** 習慣がスキップ済みセクションに移動しグレー表示になる

#### Scenario: スキップを解除する
- **GIVEN** 今日スキップした習慣がある
- **WHEN** 展開ボディの Unskip（解除）ボタンをタップする
- **THEN** `habit_completions` テーブルから当日のレコードが削除される
- **THEN** 習慣の `skippedToday` が `false` になる
- **THEN** 習慣がアクティブセクションに戻る

#### Scenario: 翌日自動リセット
- **GIVEN** 今日スキップした習慣がある
- **WHEN** 翌日になる
- **THEN** 当日のレコードが存在しないため習慣は自動的にアクティブ状態に戻る

---

### REQ-SK-02: スキップ状態の型定義

システムは `'skipped'` ステータスを型システムで表現できなければならない（MUST）。

```typescript
// HabitCompletion.status
type CompletionStatus = 'completed' | 'failed' | 'rocket_used' | 'skipped';

// DayStatus.status
type DayStatusValue = 'completed' | 'failed' | 'none' | 'rocket_used' | 'skipped';

// HabitWithStats
interface HabitWithStats extends Habit {
  skippedToday: boolean;
  // ... 他フィールド
}
```

---

### REQ-SK-03: HabitCard の UI

システムはカード展開時にSkip/Unskipボタンを表示しなければならない（MUST）。

#### Scenario: 未スキップ時のボタン表示
- **GIVEN** `skippedToday === false` の習慣カードが展開されている
- **WHEN** 展開ボディを表示する
- **THEN** Detail ボタン（flex-1、緑背景）と Skip ボタン（shrink-0、muted背景）が横並びで表示される
- **THEN** Skip ボタンには `SkipForward` アイコンと `habits.skip` テキストが表示される

#### Scenario: スキップ済み時のボタン表示
- **GIVEN** `skippedToday === true` の習慣カードが展開されている
- **WHEN** 展開ボディを表示する
- **THEN** Skip ボタンが Unskip ボタンに変わる（amber背景: `bg-amber-100 text-amber-700`、dark: `bg-amber-900/30 text-amber-400`）
- **THEN** Unskip ボタンには `Undo2` アイコンと `habits.unskip` テキストが表示される

#### Scenario: スキップ済み習慣のグレー表示
- **GIVEN** `skippedToday === true` の習慣
- **WHEN** 折りたたみ行を表示する
- **THEN** 習慣名が `text-muted-foreground`（グレー）で表示される

#### Scenario: DayStatusDot のスキップ表示
- **GIVEN** ある日のステータスが `'skipped'`
- **WHEN** 過去日のドットを表示する
- **THEN** ドットが `bg-gray-300` のグレー塗りつぶしで表示される

---

### REQ-SK-04: HabitList のセクション分割

システムはアクティブ習慣とスキップ済み習慣を別セクションに表示しなければならない（MUST）。

#### Scenario: スキップ済みセクションの表示
- **GIVEN** 1つ以上の習慣が `skippedToday === true`
- **WHEN** HabitList を表示する
- **THEN** アクティブセクション（`skippedToday === false`）が上部に表示される
- **THEN** `border-t` 仕切りと `habits.skippedSection` テキストが表示される
- **THEN** スキップ済みセクション（`skippedToday === true`）が下部に表示される

#### Scenario: スキップ済みセクションが非表示
- **GIVEN** スキップした習慣が0件
- **WHEN** HabitList を表示する
- **THEN** 仕切りとスキップ済みセクションは表示されない

#### Scenario: アクティブセクションのみ drag-and-drop 対応
- **GIVEN** アクティブ習慣が複数ある
- **WHEN** アクティブ習慣をドラッグする
- **THEN** アクティブセクション内で並び替えができる
- **THEN** スキップ済みセクションの習慣はドラッグ対象にならない

#### Scenario: セクション移動時のアニメーション
- **GIVEN** 習慣のスキップ状態が変化した
- **WHEN** セクションが再描画される
- **THEN** `fadeSlideIn` CSS アニメーション（300ms ease-out）が適用される

---

### REQ-SK-05: ストリーク計算でのスキップ透過処理

システムはスキップ日をストリーク連続を維持しつつ日数にカウントしない「透明な日」として処理しなければならない（MUST）。

#### Scenario: スキップ日をまたいだストリーク維持
- **GIVEN** 完了日5日 → スキップ日2日 → 完了日3日 という記録
- **WHEN** `calculateStreak` を呼ぶ
- **THEN** currentStreak = 8（スキップ日は透明、完了8日として連続）

#### Scenario: スキップのみの期間でのストリーク
- **GIVEN** 完了日5日 → スキップ日3日（昨日まで）という記録
- **WHEN** `calculateStreak` を呼ぶ
- **THEN** スキップ日をまたいで連続が維持され currentStreak = 5

#### Scenario: スキップ日でストリークは途切れない
- **GIVEN** 完了日 → スキップ日 → 完了日 という記録
- **WHEN** `calculateStreak` を呼ぶ
- **THEN** 連続は途切れない（longest >= 2）

---

### REQ-SK-06: 達成率計算からのスキップ日除外

システムは達成率（completionRate）の計算でスキップ日を分母から除外しなければならない（MUST）。

#### Scenario: スキップ日を除外した達成率
- **GIVEN** 30日間に完了20日、スキップ5日、失敗5日
- **WHEN** `getCompletionRate(habitId, completions, 30)` を呼ぶ
- **THEN** effectiveDays = 30 - 5 = 25
- **THEN** completionRate = 20 / 25 = 0.8（80%）

---

### REQ-SK-07: プログレスバーからのスキップ習慣除外

システムはホーム画面のプログレスバー計算でスキップ習慣を分母から除外しなければならない（MUST）。

#### Scenario: スキップ習慣を除外したプログレス
- **GIVEN** 習慣が5件（うち2件スキップ）、アクティブ3件中2件完了
- **WHEN** プログレスバーを計算する
- **THEN** activeHabits.length = 3（スキップ2件除外）
- **THEN** completedCount = 2（アクティブかつ完了）
- **THEN** プログレスバー = 2/3 ≈ 67%

---

### REQ-SK-08: ライフインパクト計算からのスキップ習慣除外

システムは `DailyImpactSummary` のインパクト計算でスキップ習慣を除外しなければならない（MUST）。

#### Scenario: スキップ習慣を除外したデイリーインパクト
- **GIVEN** 3件の習慣（うち1件スキップ）、各インパクトあり
- **WHEN** DailyImpactSummary の earned/total を計算する
- **THEN** スキップ習慣はearnedにもtotalにも含まれない
- **THEN** パーフェクト判定（earned === total）にスキップ習慣は影響しない

---

### REQ-SK-09: quit 型習慣のスキップ対応

システムは quit 型習慣も positive 型と同様にスキップできなければならない（MUST）。

#### Scenario: quit 型習慣のスキップ
- **GIVEN** quit 型の習慣がある
- **WHEN** 展開ボディの Skip ボタンをタップする
- **THEN** positive 型と同じ動作でスキップ状態になる

---

### REQ-SK-10: i18n 対応

システムはスキップ機能の文字列を日英両言語で表示できなければならない（MUST）。

| キー | 日本語 | 英語 |
|------|--------|------|
| `habits.skip` | スキップ | Skip |
| `habits.unskip` | 解除 | Unskip |
| `habits.skippedSection` | スキップ中 | Skipped |

---

## Test Scenarios

### SCENARIO-SK-01: isSkippedToday - スキップ済みの判定
- **GIVEN** 今日の completion レコードが `status='skipped'` で存在する
- **WHEN** `isSkippedToday(habitId, completions)` を呼ぶ
- **THEN** `true` を返す

### SCENARIO-SK-02: isSkippedToday - 未スキップの判定
- **GIVEN** 今日の completion レコードが `status='completed'`
- **WHEN** `isSkippedToday(habitId, completions)` を呼ぶ
- **THEN** `false` を返す

### SCENARIO-SK-03: calculateStreak - スキップ日を透過してストリーク継続
- **GIVEN** completions = [completed-3日前, completed-2日前, skipped-昨日, completed-今日]
- **WHEN** `calculateStreak(habitId, completions)` を呼ぶ
- **THEN** `{ current: 3, longest: 3 }` を返す（スキップ日は日数にカウントしない）

### SCENARIO-SK-04: calculateStreak - スキップで連続が途切れない
- **GIVEN** completions = [completed-2日前, skipped-昨日, completed-今日]
- **WHEN** `calculateStreak(habitId, completions)` を呼ぶ
- **THEN** currentStreak >= 2（途切れない）

### SCENARIO-SK-05: getCompletionRate - スキップ日を分母から除外
- **GIVEN** 30日間に完了20日、スキップ5日
- **WHEN** `getCompletionRate(habitId, completions, 30)` を呼ぶ
- **THEN** `20 / 25 = 0.8` を返す

### SCENARIO-SK-06: setDayStatus - スキップのupsert
- **GIVEN** 認証済みユーザーがいる
- **WHEN** `setDayStatus(habitId, today, 'skipped')` を呼ぶ
- **THEN** `upsertCompletion(userId, habitId, today, 'skipped')` が呼ばれる
- **THEN** completions ステートが更新される

### SCENARIO-SK-07: setDayStatus - スキップ解除
- **GIVEN** 今日スキップされた completion レコードがある
- **WHEN** `setDayStatus(habitId, today, 'none')` を呼ぶ
- **THEN** `deleteCompletion(habitId, today)` が呼ばれる
- **THEN** completions ステートから当日レコードが削除される

### SCENARIO-SK-08: handleSkipToday - トグル動作
- **GIVEN** `skippedToday === false` の習慣
- **WHEN** `handleSkipToday(habitId)` を呼ぶ
- **THEN** `setDayStatus(habitId, today, 'skipped')` が呼ばれる

### SCENARIO-SK-09: handleSkipToday - スキップ解除トグル
- **GIVEN** `skippedToday === true` の習慣
- **WHEN** `handleSkipToday(habitId)` を呼ぶ
- **THEN** `setDayStatus(habitId, today, 'none')` が呼ばれる
