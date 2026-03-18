# Spec: Yesterday Review

## Requirements

---

### REQ-YR-01: getEffectiveStatus() 関数

`src/lib/habits.ts` に `getEffectiveStatus()` 関数を追加する。

**シグネチャ**:
```typescript
function getEffectiveStatus(
  status: DayStatus,
  date: string,        // 'YYYY-MM-DD'
  today: string        // 'YYYY-MM-DD'
): DayStatus
```

**ルール**:
- status が `none` かつ today との差分が5日以上（`today - date >= 5`）の場合、`failed` を返す
- それ以外はそのまま status を返す

---

### REQ-YR-02: getYesterdayUnreviewedHabits() 関数

`src/lib/habits.ts` に `getYesterdayUnreviewedHabits()` 関数を追加する。

**シグネチャ**:
```typescript
function getYesterdayUnreviewedHabits(
  habits: HabitWithStats[],
  yesterday: string    // 'YYYY-MM-DD'
): HabitWithStats[]
```

**ルール**:
- アーカイブ済み（`archived: true`）の習慣は除外する
- 各習慣の `recentDays` から `date === yesterday` のエントリを探す
- そのエントリが存在しない、または `status === 'none'` の場合、未レビューとみなす
- 未レビューの習慣リストを返す

---

### REQ-YR-03: YesterdayReviewBanner コンポーネント

**ファイル**: `src/components/habits/yesterday-review-banner.tsx`

**Props**:
```typescript
interface YesterdayReviewBannerProps {
  habits: HabitWithStats[];
  yesterday: string;         // 'YYYY-MM-DD'
  onOpen: () => void;
}
```

**表示条件**: `getYesterdayUnreviewedHabits(habits, yesterday).length > 0` の場合のみ表示する。条件を満たさない場合は `null` を返す。

**UI**:
- 背景色: Amber（`bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800`）
- 左端に `CalendarCheck` アイコン（Amber色）
- テキスト: `yesterdayReview.bannerText`（i18n キー）— 未レビュー件数を含む
- 右端に `ChevronRight` アイコン
- カード全体がタップ可能（`onClick: onOpen`）

---

### REQ-YR-04: YesterdayReviewSheet コンポーネント

**ファイル**: `src/components/habits/yesterday-review-sheet.tsx`

**Props**:
```typescript
interface YesterdayReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: HabitWithStats[];
  yesterday: string;          // 'YYYY-MM-DD'
  onStatusChange: (habitId: string, date: string, status: DayStatus) => void;
  onNoteChange: (habitId: string, date: string, note: string) => void;
  onReflectionSave: (date: string, mood: number, comment: string) => Promise<void>;
  initialReflection?: DailyReflection | null;
}
```

**UI 構成**:
1. Sheet ヘッダー: タイトル（`yesterdayReview.sheetTitle`）+ 昨日の日付表示
2. 習慣リスト（スクロール可能）: 全非アーカイブ習慣を表示
   - 各習慣行: アイコン + 習慣名 + status トグルボタン + メモ入力欄
3. 区切り線
4. ムードスタンプ（1〜5のボタン選択）
5. 日次コメント textarea
6. 「Done」ボタン

**status トグルサイクル**（タップするたびに順に変化）:
```
none → completed → skipped → failed → none
```

**status ごとの表示スタイル**:
- `none`: グレー / 未入力アイコン
- `completed`: グリーン / チェックアイコン
- `skipped`: イエロー / ダッシュアイコン
- `failed`: レッド / X アイコン

**メモ入力**:
- `<input type="text" placeholder={t('yesterdayReview.memoPlaceholder')} />`
- `onBlur` で `onNoteChange(habitId, yesterday, value)` を呼び出す
- 初期値: 既存の `habit_completions.note`（存在する場合）

**ムードスタンプ**:
- 1〜5の数値ボタン（絵文字ではなく数字ラベル）
- 選択中のボタンはハイライト表示
- ローカル state で管理

**日次コメント**:
- `<textarea placeholder={t('yesterdayReview.commentPlaceholder')} />`
- ローカル state で管理

**「Done」ボタン**:
- `onReflectionSave(yesterday, mood, comment)` を await で呼び出す
- 完了後 `onOpenChange(false)` でシートを閉じる
- 保存中はボタンを disabled + ローディング表示

---

### REQ-YR-05: DB スキーマ変更

#### habit_completions テーブル: note カラム追加

```sql
ALTER TABLE habit_completions
ADD COLUMN note TEXT;
```

#### daily_reflections テーブル: 新規作成

```sql
CREATE TABLE daily_reflections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  mood        SMALLINT CHECK (mood BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reflections"
  ON daily_reflections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### REQ-YR-06: Supabase CRUD 関数

**ファイル**: `src/lib/supabase/habits.ts`

#### updateCompletionNote()

```typescript
async function updateCompletionNote(
  habitId: string,
  date: string,
  note: string
): Promise<void>
```

- `habit_completions` の `note` カラムを更新する
- レコードが存在しない場合は `upsert`（status は `none` で挿入）

#### upsertDailyReflection()

```typescript
async function upsertDailyReflection(
  userId: string,
  date: string,
  mood: number,
  comment: string
): Promise<void>
```

- `daily_reflections` に `INSERT ... ON CONFLICT (user_id, date) DO UPDATE` で保存する
- `updated_at` を現在時刻に更新する

#### getDailyReflection()

```typescript
async function getDailyReflection(
  userId: string,
  date: string
): Promise<DailyReflection | null>
```

- 指定した user_id + date の `daily_reflections` レコードを取得する
- 存在しない場合は `null` を返す

---

### REQ-YR-07: useHabits hook 拡張

**ファイル**: `src/hooks/useHabits.ts`

`updateNote()` メソッドを追加する:

```typescript
const updateNote = async (habitId: string, date: string, note: string): Promise<void> => {
  await updateCompletionNote(habitId, date, note);
  // ローカル state の更新: recentDays 内の該当 entry の note を更新
};
```

---

### REQ-YR-08: DailyReflection 型定義

**ファイル**: `src/types/habit.ts`

```typescript
export interface DailyReflection {
  id: string;
  userId: string;
  date: string;       // 'YYYY-MM-DD'
  mood: number | null; // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
```

`HabitCompletion` 型に `note` フィールドを追加:

```typescript
export interface HabitCompletion {
  // ... 既存フィールド
  note?: string | null;
}
```

---

### REQ-YR-09: i18n キー

#### ja.json

```json
"yesterdayReview": {
  "bannerText": "昨日の習慣 {count}件 が未確認です",
  "sheetTitle": "昨日の振り返り",
  "memoPlaceholder": "メモ（任意）",
  "commentPlaceholder": "昨日を一言で...",
  "moodLabel": "ムード",
  "doneButton": "完了",
  "statusNone": "未記録",
  "statusCompleted": "完了",
  "statusSkipped": "スキップ",
  "statusFailed": "できなかった"
}
```

#### en.json

```json
"yesterdayReview": {
  "bannerText": "{count} habits from yesterday need review",
  "sheetTitle": "Yesterday's Review",
  "memoPlaceholder": "Add a note (optional)",
  "commentPlaceholder": "How was yesterday?",
  "moodLabel": "Mood",
  "doneButton": "Done",
  "statusNone": "Not recorded",
  "statusCompleted": "Completed",
  "statusSkipped": "Skipped",
  "statusFailed": "Missed"
}
```

---

### REQ-YR-10: CalendarCheck アイコン登録

**ファイル**: `src/components/ui/icon-registry.ts`

`CalendarCheck` を `lucide-react` からインポートし、アイコンレジストリに登録する。

---

## Scenarios

### WHEN 昨日に none の習慣が1件以上ある THEN Amber バナーが DailyImpactSummary 下に表示される
- 昨日の習慣A: status = none
- バナー表示: 「昨日の習慣 1件 が未確認です」
- バナーをタップ → Sheet が開く

### WHEN 昨日の全習慣が completed/skipped/failed THEN バナーは表示されない
- 全習慣に明示的な status が設定済み
- バナーは null を返し、UI に表示されない

### WHEN Sheet 内で status を none → completed にタップ THEN DB が即座に更新される
- onStatusChange が呼び出される
- setDayStatus() が実行されて habit_completions が更新される
- Sheet 内の表示が completed スタイルに変わる

### WHEN メモ入力欄からフォーカスが外れる THEN note が保存される
- ユーザーがメモ欄に「朝ランニング30分」と入力
- 別の要素をタップしてフォーカスが外れる
- onNoteChange が呼び出され updateCompletionNote() が実行される

### WHEN 「Done」ボタンをタップ THEN ムード + コメントが保存されシートが閉じる
- ムード: 4, コメント: 「よく眠れた」
- upsertDailyReflection() が呼び出される
- 保存完了後にシートが閉じる

### WHEN 5日以上前の none ステータスがある THEN getEffectiveStatus() が failed を返す
- date: 6日前, status: none
- getEffectiveStatus(status, date, today) → 'failed'
- 集計でその日は failed としてカウントされる

### WHEN 昨日のレビューを2回開く THEN 前回のムード + コメントが初期値として表示される
- getDailyReflection() が既存レコードを返す
- Sheet 初期化時に initialReflection からムード・コメントをセット
