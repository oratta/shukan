# 頻度サポート（daily以外の習慣）

## 概要

現在は daily 固定で動作している習慣の頻度設定を、weekly（特定の曜日）および custom（任意の曜日選択）に対応させる。UI 上の頻度セレクターは既に `habit-form.tsx` に存在するが非表示。ロジック面では weekly が月曜固定でハードコードされている。これを完全に機能させる。

## 現状の把握

- `src/types/habit.ts`: `frequency: 'daily' | 'weekly' | 'custom'` は定義済み
- `src/types/habit.ts`: `customDays?: number[]` フィールドも定義済み（0=日曜〜6=土曜）
- `src/components/habits/habit-form.tsx`: 頻度セレクター（lines 442-458あたり）は存在するが非表示になっている
- `src/lib/habits.ts`: `shouldShowToday` で weekly は月曜固定（`getDay() === 1`）
- Impact 計算（`src/lib/impact.ts`）: 頻度を考慮していない（daily 前提で計算）
- ストリーク計算: daily 前提で連続日数をカウント

## 実行フロー

**Phase 1: shouldShowToday の修正** → **Phase 2: HabitForm の頻度UI有効化** → **Phase 3: ストリーク・completionRate 対応** → **Phase 4: Impact 計算の頻度対応** → **Phase 5: ビルド検証 + コミット**

---

## Phase 1: shouldShowToday の修正

### 1.1 shouldShowToday ロジック

`src/lib/habits.ts`:

現状:
```typescript
export function shouldShowToday(habit: Habit): boolean {
  if (habit.archived) return false;
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekly') return new Date().getDay() === 1; // 月曜固定
  return true;
}
```

修正:
```typescript
export function shouldShowToday(habit: Habit): boolean {
  if (habit.archived) return false;
  if (habit.frequency === 'daily') return true;

  const today = new Date().getDay(); // 0=日曜, 1=月曜, ... 6=土曜

  if (habit.frequency === 'weekly') {
    // customDays が設定されていればそれを使用、なければ月曜
    const days = habit.customDays ?? [1];
    return days.includes(today);
  }

  if (habit.frequency === 'custom') {
    return (habit.customDays ?? []).includes(today);
  }

  return true;
}
```

### 1.2 shouldShowOnDate ヘルパー追加

昨日レビューやカレンダー表示で使うため、任意の日付版も追加:
```typescript
export function shouldShowOnDate(habit: Habit, date: Date): boolean {
  if (habit.archived) return false;
  if (habit.frequency === 'daily') return true;

  const dayOfWeek = date.getDay();

  if (habit.frequency === 'weekly') {
    const days = habit.customDays ?? [1];
    return days.includes(dayOfWeek);
  }

  if (habit.frequency === 'custom') {
    return (habit.customDays ?? []).includes(dayOfWeek);
  }

  return true;
}
```

---

## Phase 2: HabitForm の頻度UI有効化

### 2.1 頻度セレクターの有効化

`src/components/habits/habit-form.tsx`:
- 頻度セレクター部分のコメントアウトまたは非表示を解除
- 3つのオプション: Daily / Weekly / Custom
- Daily: 追加UIなし
- Weekly: 曜日選択チップを表示（月〜日の7つ、複数選択可能）
- Custom: 曜日選択チップを表示（Weekly と同じUI）

### 2.2 曜日選択UI

Weekly / Custom 選択時に表示:
- 7つの丸いチップ（月火水木金土日）
- タップでトグル（選択中は primary カラー、非選択はグレー）
- `customDays` 配列に対応する数値を格納: 0=日曜, 1=月曜, ... 6=土曜
- 最低1日は選択必須（バリデーション）

### 2.3 i18n

- `habits.frequencyDaily`: 「毎日」/ "Daily"
- `habits.frequencyWeekly`: 「毎週」/ "Weekly"
- `habits.frequencyCustom`: 「カスタム」/ "Custom"
- `habits.selectDays`: 「曜日を選択」/ "Select days"
- 曜日の略称（`habits.dayMon`, `habits.dayTue`, etc.）

### 2.4 頻度表示

HabitCard や HabitDetailModal で、daily 以外の場合は頻度情報を表示:
- 例: 「毎週 月・水・金」「カスタム 火・木・土」
- 表示位置: 習慣名の下に小さなテキスト（`text-xs text-muted-foreground`）

---

## Phase 3: ストリーク・completionRate 対応

### 3.1 ストリーク計算の修正

`src/lib/habits.ts` の `calculateStreak`:
- 現状は毎日を連続としてカウント
- 修正: 「該当日のみ」をベースにストリークを計算
  - 例: 月水金の習慣で月(完了)→火(対象外)→水(完了) = 2日連続
  - 対象外の日はスキップと同じ扱い（透明な日）
  - 該当日に `none` または `failed` があるとストリークが途切れる

### 3.2 completionRate の修正

- 分母を「対象日の数」に変更（全日数ではなく）
- 例: 月水金の習慣で30日間の場合、分母は約13日（30日中の月水金の数）

### 3.3 recentDays の修正

- `getHabitsWithStats` で生成する `recentDays` の対象を、frequency に基づいてフィルタ
- daily 以外の場合、対象外の日は `recentDays` に含めない
- これにより Home View のドット表示も自動的に対象日のみになる

---

## Phase 4: Impact 計算の頻度対応

### 4.1 calculateImpactSavings の修正

`src/lib/impact.ts`:
- 現状: `completedDays × dailyHealthMinutes` 等で計算（1日1回前提）
- 修正: 頻度に応じてインパクトをスケーリングする必要は**ない**
  - なぜなら `completedDays` は実際に完了した日数を表すため、weekly 習慣でも正しく動作する
  - ただし、Discover ページの年間インパクト表示（`calculateAnnualImpact`）は daily 前提で計算されている
  - これは Discover 記事の表示値なので変更不要（記事はあくまで「毎日やった場合」の値）

### 4.2 DailyImpactSummary の確認

- `src/components/habits/daily-impact-summary.tsx`: 今日のインパクトを計算
- 今日対象外の習慣は `shouldShowToday` で既にフィルタされているため、変更不要の可能性が高い
- ただしフィルタの流れを確認して、対象外習慣が漏れ込まないことを検証

---

## Phase 5: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）
- テスト実行（`npx vitest run`）
- Next.js ビルド（`npx next build`）
- コミット

---

## 制約・注意事項

- `weekly` と `custom` の違いは意味的なもの（UI上のラベルだけ）。内部的にはどちらも `customDays` 配列で管理
- `weekly` を選んだ場合のデフォルトは `[1]`（月曜のみ）— ユーザーが変更可能
- `daily` を選んだ場合は `customDays` は `undefined` または空（全日対象として扱う）
- DB の `habits` テーブルに `frequency` と `custom_days` カラムは既に存在する（Supabase スキーマ確認要）
  - 存在しない場合はマイグレーション追加が必要
- 既存習慣は全て `frequency: 'daily'` のため、マイグレーションのデフォルト値は `'daily'`
- カレンダービュー（HabitDetailModal）での表示: 対象外の日はグレーアウトまたはドットなし

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし

**機能固有の条件:**
- [ ] `shouldShowToday` が frequency と customDays を正しく考慮する
- [ ] HabitForm で頻度（Daily/Weekly/Custom）を選択できる
- [ ] Weekly/Custom 選択時に曜日チップが表示され、複数選択可能
- [ ] ストリーク計算が頻度を考慮（対象外日をスキップ）
- [ ] completionRate が対象日ベースで計算
- [ ] recentDays が対象日のみを含む
- [ ] HabitCard に daily 以外の場合は頻度情報が小さく表示される
- [ ] 既存の daily 習慣に影響がない
- [ ] i18n 対応（ja/en）
