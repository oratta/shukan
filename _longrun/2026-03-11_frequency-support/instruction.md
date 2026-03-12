# 頻度サポート（Daily / Weekly 対応）

## 概要

現在 daily 固定で動作している習慣の頻度設定を、新しいカテゴリ構造で対応させる。

**新カテゴリ構造:**
- **Daily**: 毎日系の習慣
  - `everyday`: 毎日（デフォルト、従来の daily と同じ）
  - `weekday`: 平日限定（月〜金）
  - `custom`: 曜日を指定（例: 月・水・金）
- **Weekly**: 週N回系の習慣
  - 曜日を問わず、週にN回実施すればOK
  - `weeklyTarget`: 週あたりの目標回数（デフォルト1）

**従来の `custom` は Daily/custom に統合。** 従来の `weekly`（特定曜日指定）は廃止し、Daily/custom に吸収。

## 現状の把握

- `src/types/habit.ts`: `frequency: 'daily' | 'weekly' | 'custom'` は定義済み
- `src/types/habit.ts`: `customDays?: number[]` フィールドも定義済み（0=日曜〜6=土曜）
- DB: `habits` テーブルに `frequency text` と `custom_days integer[]` カラム存在
- `src/components/habits/habit-form.tsx`: 頻度セレクター存在するが非表示
- `src/lib/habits.ts`: `shouldShowToday` で weekly は月曜固定（`getDay() === 1`）
- `src/lib/habits.ts`: `getCompletionRate` は `completedDays / (30 - skippedDays)` で計算
- `src/lib/habits.ts`: `calculateStreak` は日単位の連続日数を計算
- Impact 計算: daily 前提（頻度変更不要、completedDays ベースなので自動的に正しい）

## DB スキーマ変更

### マイグレーション

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

**注意:** 既存データに `frequency = 'weekly'` や `'custom'` のレコードは存在しない（全て `'daily'`）ため、安全に移行できる。

## 型定義の変更

`src/types/habit.ts`:
```typescript
frequency: 'everyday' | 'weekday' | 'custom' | 'weekly';
weeklyTarget?: number; // Weekly の場合のみ使用（デフォルト1）
```

Supabase CRUD マッピング（`src/lib/supabase/habits.ts`）:
- `weekly_target` ↔ `weeklyTarget` の snake_case/camelCase 変換を追加

## 核心設計: Daily 系の非対象日は「自動スキップ」で実現する

**⚠️ 最重要設計方針: 新しい仕組みを作らず、既存のスキップ機構を再利用する。**

Daily/weekday や Daily/custom で「今日は対象外」の日がある場合、**shouldShowToday で非表示にしない**。代わりに:

1. `shouldShowToday` は **全ての非アーカイブ習慣で `true`** を返す（everyday/weekday/custom/weekly 全て）
2. **非対象日の習慣は自動的に `skipped` ステータスを付与する**
3. 既存のスキップ機構により、ホーム画面のスキップセクションに自動で入る
4. ユーザーがやりたければスキップセクションから **Unskip** して普通のタスクとして扱える

**既存のスキップ機構の流れ（変更なし）:**
```
page.tsx: habits.filter(shouldShowToday) → todayHabits
HabitList: todayHabits → activeHabits (!skippedToday) + skippedHabits (skippedToday)
           → active はメインリスト、skipped はスキップセクションに表示
           → unskip でスキップセクションからメインリストに戻せる
```

**自動スキップの実装場所:** `getHabitsWithStats` 内または `useHabits` フック内で、今日が非対象日の習慣に `skippedToday: true` を自動付与する。ただし、ユーザーが手動で unskip（`setDayStatus(id, today, 'none')`）した場合はそちらを優先する。

**判定ロジック:**
```
isNonTargetDay(habit, today) = weekday なら土日、custom なら非対象曜日
自動スキップ = isNonTargetDay AND ユーザーが手動で unskip していない
```

これにより:
- 月水金の習慣 → 火木土日は自動でスキップセクションに入る
- 平日の習慣 → 土日は自動でスキップセクションに入る
- ユーザーが火曜にも「やりたい」と思ったら unskip → 通常タスクとして扱える
- ストリーク計算もスキップ日として扱われる（連続は途切れない、カウントしない）= 従来と同じ

## 実行フロー

**Phase 1: DB + 型 + CRUD** → **Phase 2: 自動スキップ + ストリーク + completionRate** → **Phase 3: HabitForm UI** → **Phase 4: ホーム画面表示** → **Phase 5: ビルド検証 + コミット**

---

## Phase 1: DB + 型 + CRUD

### 1.1 マイグレーションファイル作成

`supabase/migrations/YYYYMMDD000000_frequency_support.sql` を作成し、上記の SQL を記述。
`supabase db push` で適用。

### 1.2 型定義の更新

`src/types/habit.ts`:
- `frequency` を `'everyday' | 'weekday' | 'custom' | 'weekly'` に変更
- `weeklyTarget?: number` を追加

### 1.3 Supabase CRUD マッピング

`src/lib/supabase/habits.ts`:
- `weekly_target` ↔ `weeklyTarget` のマッピング追加
- INSERT/UPDATE/SELECT で新カラムを含める

---

## Phase 2: 自動スキップ + ストリーク + completionRate

### 2.1 shouldShowToday の簡素化

`src/lib/habits.ts`:

`shouldShowToday` は非アーカイブなら常に `true` を返す。表示/非表示の制御はスキップ機構に委ねる。

```typescript
export function shouldShowToday(habit: Habit): boolean {
  return !habit.archived;
}
```

### 2.2 isTargetDay ヘルパー追加

非対象日の判定に使用する新しいヘルパー:

```typescript
export function isTargetDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0=日, 1=月, ... 6=土

  switch (habit.frequency) {
    case 'everyday':
      return true;
    case 'weekday':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // 月〜金
    case 'custom':
      return (habit.customDays ?? []).includes(dayOfWeek);
    case 'weekly':
      return true; // Weekly は毎日が対象（どの日にやってもOK）
    default:
      return true;
  }
}
```

### 2.3 自動スキップの実装

`getHabitsWithStats` 内で `skippedToday` を算出する際に、自動スキップを統合する:

```
skippedToday の判定:
  1. ユーザーが手動で skipped にした → skippedToday = true（従来通り）
  2. ユーザーが手動で completed/failed/none にした → skippedToday = false（従来通り）
  3. 今日のレコードがない + isTargetDay = false → skippedToday = true（自動スキップ）
  4. 今日のレコードがない + isTargetDay = true → skippedToday = false（従来通り）
```

**重要:** 自動スキップは DB に `skipped` レコードを書き込まない。表示ロジック上のみで判定する。ユーザーが unskip した場合は `setDayStatus(id, today, 'none')` が呼ばれ、明示的な `none` レコードが作られるため、以降は自動スキップが上書きされない。

### 2.4 ストリーク計算の修正

**Daily 系（everyday/weekday/custom）:**
- 従来と同じロジック。非対象日は自動スキップ扱いのため、スキップと同じ（連続を途切れさせない、カウントもしない）
- **既存のストリーク計算コードはスキップ日を透明日として扱っており、自動スキップも同様に透明日として機能する**

**Weekly:**
- **連続達成週数**でストリークを計算
- 週の区切り: **月曜始まり**（ISO 8601）
- 1週間の中で `weeklyTarget` 回以上 completed があれば、その週は「達成」
- 直近の完全な週から遡って、連続で達成している週数を current streak とする
- 今週（進行中の週）も含めてカウント: 今週既に目標達成していればカウントに含む

### 2.5 completionRate の修正

**Daily 系（everyday/weekday/custom）:**
- 分母: 30（固定）
- 分子: 過去30日間の完了日数（スキップ日は分母から除外）
- **自動スキップされた日もスキップ日として分母から除外される**
- **従来の定義を維持**

**Weekly:**
- 分母: **12**（過去12週）
- 分子: 過去12週のうち、weeklyTarget を達成した週の数
- 結果: 0.0〜1.0 の達成率

### 2.6 recentDays の修正

- Daily 系: 全日を含める（非対象日はスキップとして表示される、従来のスキップと同じ扱い）
- Weekly: 従来通り直近の日を含める

---

## Phase 3: HabitForm UI

**デザイン系のタスクが多いため、実装エージェントは `frontend-design` スキルを使用して高品質な UI を生成すること。**

### 3.1 頻度カテゴリセレクター

2つのカテゴリをタブまたはセグメントコントロールで表示:

```
[ Daily ] [ Weekly ]
```

### 3.2 Daily サブタイプ選択

Daily 選択時に3つのオプションをラジオボタン/チップで表示:

```
Daily:
  ○ 毎日 (Everyday)
  ○ 平日 (Weekday)  → 月〜金
  ○ カスタム (Custom) → 曜日選択チップを表示
```

Custom 選択時: 7つの曜日チップ（月火水木金土日）を表示、複数選択可、最低1日必須

### 3.3 Weekly 設定

Weekly 選択時に回数セレクターを表示:

```
Weekly:
  週に [1 ▾] 回
```

- ドロップダウンまたはスピナーで 1〜7 を選択
- デフォルト: 1

### 3.4 i18n

**新規キー:**

| キー | 日本語 | 英語 |
|------|--------|------|
| `habits.frequencyDaily` | デイリー | Daily |
| `habits.frequencyWeekly` | ウィークリー | Weekly |
| `habits.everyday` | 毎日 | Everyday |
| `habits.weekday` | 平日 | Weekday |
| `habits.frequencyCustom` | カスタム | Custom |
| `habits.selectDays` | 曜日を選択 | Select days |
| `habits.timesPerWeek` | 週に{count}回 | {count} times/week |
| `habits.weeklyProgress` | 今週 {current}/{target} 回 | This week {current}/{target} |

### 3.5 既存キー更新

- `habits.daily` → `habits.everyday` に統合（既存の `daily` キーも残す for 後方互換）

---

## Phase 4: ホーム画面表示

**`frontend-design` スキルを使用して統一感のあるデザインにすること。**

### 4.1 Weekly 習慣のホーム表示

Weekly 習慣は **毎日** ホーム画面に表示する。

**左の StatusIndicator:**
- Positive + Weekly: タップで今日を completed にする（Daily と同じ）
- 達成状態の表示:
  - 週の目標未達成: `border-2 border-gray-300`（未完了円、Daily の none と同じ）
  - 週の目標達成: `bg-[#3D8A5A]` + Check アイコン（Daily の completed と同じ）

**カード行に「今週の進捗」を表示:**
- 習慣名の下に `text-xs text-muted-foreground` で表示
- 例: `今週 2/3 回` / `This week 2/3`
- 目標達成時: `今週 3/3 回 ✓` のように達成マーク付き

### 4.2 Daily 系の頻度表示

everyday 以外の場合、習慣名の下に頻度情報を小さく表示:
- Weekday: `平日` / `Weekdays`
- Custom: `月・水・金` / `Mon, Wed, Fri`

### 4.3 HabitCard の recentDays ドット

- Daily/everyday: 従来通り
- Daily/weekday: 平日のみのドット
- Daily/custom: 対象曜日のみのドット
- Weekly: 直近7日のドット（毎日）

---

## Phase 5: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）
- テスト実行（`npx vitest run`）
- Next.js ビルド（`npx next build`）
- コミット

---

## 制約・注意事項

- **⚠️ Daily 系の非対象日は既存のスキップ機構で実現する。新しい非表示メカニズムを作らない**
- 自動スキップは表示ロジック上のみで判定（DB に skipped レコードを自動書き込みしない）
- ユーザーが手動で unskip → 通常タスクとして扱える（従来のスキップと完全に同じ UX）
- **既存習慣は全て `frequency: 'daily'` → `'everyday'` にマイグレーションで変換**
- `weekly` の週の区切り: **月曜始まり**（ISO 8601）
- Weekly 習慣のステータスドット: 今日を completed にマークした = 今日は1回実施した意味
- Impact 計算は変更不要（completedDays ベースなので自動的に正しい）
- カレンダービュー（HabitDetailModal）: 非対象日はスキップ日と同じ扱い
- **実装エージェントは `frontend-design` スキルを使用してデザイン品質を担保すること**

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] OpenSpec 仕様（proposal.md, spec.md, design.md, tasks.md）が作成・レビュー済み
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし

**機能固有の条件:**
- [ ] DB マイグレーション: `frequency` CHECK 制約更新、`weekly_target` カラム追加
- [ ] 既存 `'daily'` → `'everyday'` マイグレーション済み
- [ ] Daily/weekday・custom の非対象日が自動スキップされ、スキップセクションに表示される
- [ ] 自動スキップされた習慣を unskip すると通常タスクとして扱える
- [ ] HabitForm で Daily (everyday/weekday/custom) と Weekly (回数指定) を選択できる
- [ ] Daily/Custom: 曜日チップが表示され複数選択可能
- [ ] Weekly: 回数セレクター（1〜7）が表示される
- [ ] ストリーク: Daily 系はスキップ透明日扱い、Weekly は連続達成週数
- [ ] completionRate: Daily 系は完了日数/30、Weekly は達成週数/12
- [ ] Weekly 習慣がホーム画面に毎日表示される
- [ ] Weekly の「今週 N/M 回」進捗が HabitCard に表示される
- [ ] Daily/weekday・custom の頻度情報が習慣名の下に表示される
- [ ] 既存の everyday 習慣に影響がない
- [ ] i18n 対応（ja/en）
