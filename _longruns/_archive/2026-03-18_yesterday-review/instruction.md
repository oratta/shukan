# 昨日レビュー機能 + Home View UX改善

## 概要

習慣化アプリ Shukan に「昨日のレビュー」機能を追加する。Home画面にバナーを表示し、タップでレビューシートを開いて昨日の全習慣を振り返りチェック + メモ + ムード記録ができるようにする。

併せて、HabitCard の過去日ドットに曜日ラベルを追加し、どの日がどの状態かを視認しやすくする。

## Change 構成

2つの独立した OpenSpec Change として実装する。

### Change 1: `yesterday-review`

昨日の習慣レビュー機能。バナー + レビューシート + DBマイグレーション + ステータス読み取りロジック。

### Change 2: `weekday-labels`

HabitCard の過去日ドットに曜日の省略ラベルを追加するUI改善。

---

## Change 1: yesterday-review

### 1.1 DBマイグレーション

**habit_completions テーブル**:
- `note` カラム追加 (TEXT, nullable) — 習慣ごとのメモ

**daily_reflections テーブル新規作成**:
```sql
CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date TEXT NOT NULL,            -- 'YYYY-MM-DD' 形式
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),  -- 5段階ムード
  comment TEXT,                  -- 1日まとめコメント
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
-- RLS: user_id = auth.uid() で SELECT/INSERT/UPDATE/DELETE
```

マイグレーションファイル作成後、`supabase db push` で適用する。

### 1.2 none の意味論（読み取り時変換）

**設計方針**: DB上は `none` のまま保持する。表示・集計時に「5日以上前の none は failed として扱う」ロジックを読み取り層で実装する。

**実装場所**: `src/lib/habits.ts` に以下の関数を追加:

```typescript
function getEffectiveStatus(day: DayStatus): DayStatus['status']
```

- `day.status === 'none'` かつ `day.date` が5日以上前 → `'failed'` を返す
- それ以外 → `day.status` をそのまま返す

**適用箇所**: ステータスをカウント・集計する関数（DailyImpactSummary の集計 useMemo 等）でこの関数を経由する。DayStatusDot の表示色はそのまま（none は空白ドットのまま表示して良い）。

### 1.3 「昨日未レビュー」の判定ロジック

`src/lib/habits.ts` に追加:

```typescript
function getYesterdayUnreviewedHabits(
  habits: Habit[],
  completions: HabitCompletion[]
): Habit[]
```

**判定条件**:
- 昨日の日付を計算（`getDateString()` で前日を取得）
- **frequency に関係なく**、アーカイブされていない全習慣が対象（`!habit.archived`）
- 昨日の completion が `completed | failed | skipped | rocket_used` のいずれかであればレビュー済み
- completion が無い（`none`）習慣を「未レビュー」として返す

### 1.4 Supabase CRUD 関数

`src/lib/supabase/habits.ts` に追加:

**habit_completions の note 更新**:
```typescript
async function updateCompletionNote(
  supabase: SupabaseClient,
  habitId: string,
  date: string,
  note: string | null
): Promise<void>
```

**daily_reflections の CRUD**:
```typescript
async function upsertDailyReflection(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  data: { mood?: number; comment?: string }
): Promise<DailyReflection>

async function getDailyReflection(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<DailyReflection | null>
```

snake_case ↔ camelCase マッピングは既存パターンに従う。

### 1.5 useHabits hook の拡張

`src/hooks/useHabits.ts` に追加:

- `updateNote(habitId: string, date: string, note: string | null)` — completion の note を更新
- daily_reflections 用の状態管理は、レビューシート内でローカルに管理し、「完了」ボタン押下時に upsert する

### 1.6 レビューバナーコンポーネント

`src/components/habits/yesterday-review-banner.tsx` を新規作成。

**配置**: DailyImpactSummary の下、HabitList の上

**表示条件**: 昨日の未レビュー習慣が1つ以上ある場合のみ

**UI**:
- 角丸カード（`bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800`）
- 左: `CalendarCheck` アイコン（lucide-react、icon-registry に追加）
- テキスト: `t('habits.reviewYesterday')` — 「昨日の習慣をレビュー」
- 右: 未レビュー件数バッジ（`{count}件未チェック`）+ `ChevronRight`
- タップで `onOpen()` コールバック → 親で Sheet を開く

### 1.7 レビューシートコンポーネント

`src/components/habits/yesterday-review-sheet.tsx` を新規作成。

**使用コンポーネント**: `Sheet` from `@/components/ui/sheet`（既存）

**ヘッダー**:
- 昨日の日付をフォーマット: `t('habits.reviewTitle', { date: formattedDate })`
- 日本語例: 「3月16日（日）のレビュー」
- 英語例: "Review for Mar 16 (Sun)"

**習慣リスト**:
- 昨日対象の全習慣（アーカイブ済みを除く）を表示
- 各行:
  - `ICON_REGISTRY[habit.icon]` + 習慣名
  - ステータスインジケーター（DayStatusDot と同じ見た目、size-6 程度に拡大）
  - タップでサイクル: `none → completed → skipped → failed → none`（4値）
    - `completed`: 緑（`bg-[#3D8A5A]`）+ チェックマーク
    - `skipped`: グレー（`bg-gray-300`）
    - `failed`: オレンジ（`bg-[#D08068]`）
    - `none`: ボーダーのみ（`border border-gray-300`）
  - ステータス変更は即座に `setDayStatus()` で保存（確認ダイアログなし）
- 各行の下にメモ入力欄（テキストフィールド、任意入力、プレースホルダー「メモ...」）
  - blur 時に `updateNote()` で保存

**ムード + 日次コメント**（習慣リストの下、区切り線の後）:
- ムードスタンプ: 5段階（1〜5）。タップで選択。ビジュアルは5つの丸いボタンで表現（選択中はハイライト）
  - ムードのラベルは不要（数字 or 顔アイコンのみでシンプルに）
- 日次コメント: テキストエリア（「昨日のひとこと...」プレースホルダー）

**フッター**:
- 「完了」ボタン: タップでムード + 日次コメントを `upsertDailyReflection()` で保存し、シートを閉じる
- 全習慣にステータスが入っていなくても閉じられる（バナーは残る）

### 1.8 page.tsx の変更

`src/app/(app)/page.tsx`:
- `getYesterdayUnreviewedHabits` を import して未レビュー判定
- `useState<boolean>` で Sheet の open 状態管理
- レンダリング順序:
  1. ヘッダー（h2 + progress bar）
  2. `<DailyImpactSummary />`
  3. **`<YesterdayReviewBanner />`** ← 新規追加
  4. `<HabitList />`
  5. 既存のモーダル群
  6. **`<YesterdayReviewSheet />`** ← 新規追加
- `setDayStatus` は既に `useHabits()` から取得済みなのでそのまま渡す

### 1.9 CalendarCheck アイコン登録

`src/lib/icon-registry.ts`:
- `import { CalendarCheck } from 'lucide-react'` を追加
- `ICON_REGISTRY` に `'calendar-check': CalendarCheck` を追加

### 1.10 i18n キー

`src/messages/ja.json` / `src/messages/en.json` の `habits` セクションに追加:
- `reviewYesterday`: 「昨日の習慣をレビュー」/ "Review yesterday's habits"
- `reviewTitle`: 「{date}のレビュー」/ "Review for {date}"
- `reviewDone`: 「完了」/ "Done"
- `unreviewedCount`: 「{count}件未チェック」/ "{count} unchecked"
- `reviewAllDone`: 「全てレビュー済み！」/ "All reviewed!"
- `memoPlaceholder`: 「メモ...」/ "Note..."
- `dailyCommentPlaceholder`: 「昨日のひとこと...」/ "A word about yesterday..."

### 1.11 型定義

`src/types/habit.ts` に追加:
```typescript
interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  mood: number | null;    // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
```

`HabitCompletion` に `note?: string` を追加。

---

## Change 2: weekday-labels

### 2.1 過去日ドットに曜日ラベルを追加

`src/components/habits/habit-card.tsx` の recentDays 表示部分（`slice(1)` で past days を map している箇所）:

**変更内容**:
- 各ドットの上に曜日の省略形を表示
- ドットとラベルを `flex flex-col items-center gap-0.5` でまとめる

```tsx
{(habit.recentDays ?? []).slice(1).map((day) => {
  const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'narrow' });
  return (
    <div key={day.date} className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-muted-foreground leading-none">{dayLabel}</span>
      <DayStatusDot day={day} onTap={() => handleDotTap(day)} />
    </div>
  );
})}
```

**locale の取得**: `useLocale()` from `next-intl`

### 2.2 Today のラベル

Today（index 0 = StatusIndicator）の上には曜日ラベルを追加**しない**。Today は大きなボタンとして独立しているため、ラベルは過去日ドットのみ。

---

## 実行順序

1. **Change 1: yesterday-review** を先に実装（DBマイグレーション → ロジック → コンポーネント → 統合）
2. **Change 2: weekday-labels** を後に実装（独立しているが、Change 1 で page.tsx を触るため後回し）
3. **ビルド検証**: TypeScript型チェック + テスト + Next.jsビルド
4. **コミット**: feat scope で Change ごとにコミット

## 制約・注意事項

- `setDayStatus` は `useHabits()` hook にある既存関数。status='none' は deletion として動作する
- レビューシートでのステータス変更は即座に保存（確認ダイアログなし — 間違えても再タップで修正可能）
- 昨日より前の日のレビューは**この機能の範囲外**（既存 HabitDetailModal のカレンダーで対応可能）
- quit 型の習慣のレビュー: positive 型と同じサイクル
- 5 Days Impact との連動: レビューで status を変更すると `recentDays` が更新され、`DailyImpactSummary` の fiveDays セクションが useMemo 経由で自動反映される
- frequency-support で追加された weekly/weekday/custom 習慣のドットは非連続日の場合がある。曜日ラベルはこの場合にも正しく表示される（各 day.date から曜日を取得するため）
- DB マイグレーション後は `supabase db push` を自分で実行する（ユーザーに依頼しない）

## 必要なスキル

- `openspec-new-change` / `openspec-apply-change` — Change の作成と実装
- `nextjs-server-client-components` — Server/Client コンポーネントの判断
- `nextjs-app-router-fundamentals` — App Router パターン

## 完了条件

**ビルド:**
- [ ] TypeScript 型チェック（`npx tsc --noEmit`）エラーなし
- [ ] テスト実行（`npx vitest run`）新規失敗なし
- [ ] Next.js ビルド（`npx next build`）エラーなし

**Change 1: yesterday-review:**
- [ ] DB マイグレーション適用済み（habit_completions.note + daily_reflections テーブル）
- [ ] 昨日の未レビュー習慣がある場合、Home画面に amber バナーが表示される
- [ ] バナーをタップするとレビューシートが開く
- [ ] レビューシートに昨日の全習慣（非アーカイブ）が表示される
- [ ] 各習慣のステータスをタップで4値サイクル（none → completed → skipped → failed → none）
- [ ] ステータス変更が即座に保存される（setDayStatus 経由）
- [ ] 各習慣にメモ入力欄があり、blur 時に保存される
- [ ] ムードスタンプ（5段階）を選択できる
- [ ] 日次コメントを入力できる
- [ ] 「完了」ボタンでムード + コメントを保存しシートを閉じる
- [ ] 全習慣にステータスが入ったらバナーが消える
- [ ] 5日以上前の none は集計時に failed として扱われる
- [ ] i18n 対応（ja/en の全キー追加）
- [ ] CalendarCheck アイコンが icon-registry に追加されている

**Change 2: weekday-labels:**
- [ ] Home View の過去日ドットに曜日ラベル（月、火、水...）が表示される
- [ ] 曜日ラベルが locale 対応（ja: 月火水、en: M T W）
- [ ] Today のステータスインジケーターにはラベルなし

## 関連コード（現在の状態）

| ファイル | 役割 |
|---------|------|
| `src/app/(app)/page.tsx` | Home画面。useHabits() → getStats() → DailyImpactSummary + HabitList |
| `src/hooks/useHabits.ts` | `setDayStatus(habitId, date, status)` を公開。status='none' は deletion |
| `src/lib/habits.ts` | `shouldShowToday()`, `getRecentDays()`, `getDateString()` 等の pure 関数 |
| `src/lib/supabase/habits.ts` | Supabase CRUD。snake_case ↔ camelCase マッピング |
| `src/components/habits/habit-card.tsx` | `DayStatusDot` コンポーネント + `handleDotTap` + `nextStatus` |
| `src/components/habits/daily-impact-summary.tsx` | Today + 5 Days Impact 表示。useMemo で recentDays から集計 |
| `src/components/ui/sheet.tsx` | Shadcn Sheet（既存） |
| `src/lib/icon-registry.ts` | 52アイコン登録済。CalendarCheck は未登録 |
| `src/types/habit.ts` | `DayStatus`, `HabitCompletion`, `Habit` 等の型定義 |
| `src/messages/ja.json` / `en.json` | i18n メッセージ |
