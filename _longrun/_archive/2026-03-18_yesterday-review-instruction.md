# 昨日レビュー機能 + Home View UX改善

> **⚠️ 未実行**: このinstructionはロングランワークフロー刷新前に作成されたもので、実行されていない。新しいワークフローで再作成予定。（2026-03-18 アーカイブ）

## 概要

習慣化アプリに「昨日のレビュー」機能を追加する。ユーザーがアプリを開いた時に、昨日の全習慣を一括で振り返りチェックできるバナー＋シートを実装する。

併せて、Home View の過去日ドットに曜日ラベルを追加し、どの日がどの状態かをわかりやすくする。

## 実行フロー

**Phase 1: 昨日レビュー（バナー + シート）** → **Phase 2: Home View UX改善（曜日ラベル）** → **Phase 3: ビルド検証 + コミット**

---

## Phase 1: 昨日レビューモーダル

### 1.1 設計方針

- Home画面（`src/app/(app)/page.tsx`）の DailyImpactSummary と HabitList の間にバナーを表示
- バナーをタップすると Sheet が開き、昨日の全習慣を一覧表示
- シート内で各習慣のステータスをドットタップで切り替え（既存 DayStatusDot と同じ UX）
- 全習慣にステータスが入った（none が0件になった）らバナーが消える
- ステータス変更は即座に `setDayStatus()` で保存（確認ダイアログなし）
- 新規ルート/タブは追加しない

### 1.2 「昨日未レビュー」の判定ロジック

`src/lib/habits.ts` に追加:

```typescript
function getYesterdayUnreviewedHabits(
  habits: Habit[],
  completions: HabitCompletion[]
): Habit[]
```

**判定条件**:
- 昨日の日付を計算（`new Date()` から1日前、`getDateString()` でフォーマット）
- **frequency に関係なく**、アーカイブされていない全習慣が対象（`!habit.archived`）
- 昨日の completion が `completed | failed | skipped | rocket_used` のいずれかであればレビュー済み
- completion が無い（`none`）習慣を「未レビュー」として返す

**注意**: `shouldShowToday()` は `!habit.archived` のみの関数。frequency フィルタはしていない。この関数も同様に frequency フィルタしない。Weekly 習慣でも「昨日やった？」と聞く。

### 1.3 レビューバナーコンポーネント

`src/components/habits/yesterday-review-banner.tsx` を新規作成:

**配置**: DailyImpactSummary の下、HabitList の上

**表示条件**: 昨日の未レビュー習慣が1つ以上ある場合のみ

**UI**:
- 角丸カード（`bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800`）
- 左: `CalendarCheck` アイコン（lucide-react から import）
- テキスト: `t('habits.reviewYesterday')` — 「昨日の習慣をレビュー」
- 右: 未レビュー件数バッジ（`{count}件未チェック`）+ `ChevronRight`
- タップで `onOpen()` コールバック → 親で Sheet を開く

**CalendarCheck アイコン**: `src/lib/icon-registry.ts` に `'calendar-check': CalendarCheck` を追加する。import も追加。

### 1.4 レビューシートコンポーネント

`src/components/habits/yesterday-review-sheet.tsx` を新規作成:

**使用コンポーネント**: `Sheet` from `@/components/ui/sheet`（既存）

**ヘッダー**:
- 昨日の日付をフォーマット: `t('habits.reviewTitle', { date: formattedDate })`
- 日本語例: 「3月16日（日）のレビュー」
- 英語例: "Review for Mar 16 (Sun)"

**習慣リスト**:
- 昨日対象の全習慣（アーカイブ済みを除く）を表示
- 各行: `ICON_REGISTRY[habit.icon]` + 習慣名 + ステータスインジケーター
- ステータスインジケーターは DayStatusDot と同じ見た目（size-6 程度に拡大）
- タップでサイクル: `none → completed → skipped → failed → none`（4値）
  - `completed`: 緑（`bg-[#3D8A5A]`）+ チェックマーク
  - `skipped`: グレー（`bg-gray-300`）
  - `failed`: オレンジ（`bg-[#D08068]`）
  - `none`: ボーダーのみ（`border border-gray-300`）

**ステータス変更の保存**:
- タップ即座に `onDayStatusChange(habitId, yesterdayDate, newStatus)` を呼ぶ
- `none` に戻す場合も同様（completion 削除）
- 5 Days Impact も recentDays 経由で即座に反映される（useMemo 依存）

**フッター/完了条件**:
- 全習慣にステータスが入った（none が0件）→ Sheet を自動で閉じる or 「完了！」表示
- 一部未レビューで Sheet を閉じても OK。バナーは残り、再度開ける

### 1.5 page.tsx の変更

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

### 1.6 i18n キー

`src/messages/ja.json` / `src/messages/en.json` の `habits` セクションに追加:
- `reviewYesterday`: 「昨日の習慣をレビュー」/ "Review yesterday's habits"
- `reviewTitle`: 「{date}のレビュー」/ "Review for {date}"
- `reviewDone`: 「完了」/ "Done"
- `unreviewedCount`: 「{count}件未チェック」/ "{count} unchecked"
- `reviewAllDone`: 「全てレビュー済み！」/ "All reviewed!"

---

## Phase 2: Home View UX改善（曜日ラベル）

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

**locale の取得**: `useLocale()` from `next-intl`（`import { useLocale } from 'next-intl'`）

**注意**: weekday/custom 習慣では recentDays が非連続日になる（例: 火、木のみ）。曜日ラベルがあることで、どの日のドットかが明確になるため、非連続でもラベルは有用。

### 2.2 Today のラベル

Today（index 0 = StatusIndicator）の上には曜日ラベルを追加**しない**。Today は大きなボタンとして独立しているため、ラベルは過去日ドットのみ。

---

## Phase 3: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）— 新規エラーがないこと
- テスト実行（`npx vitest run`）— 新規テスト失敗がないこと（既存の1件は許容）
- Next.js ビルド（`npx next build`）— エラーなし
- コミット（feat scope）

---

## 制約・注意事項

- `setDayStatus` は `useHabits()` hook にある既存関数。新規 DB 関数の作成は不要
- レビューシートでの変更は即座に保存（confirmation なし — 間違えても再タップで修正可能）
- 昨日より前の日（2日前、3日前など）のレビューは**この機能の範囲外**（既存 HabitDetailModal のカレンダーで対応可能）
- quit 型の習慣のレビュー: positive 型と同じ `none → completed → skipped → failed → none` サイクル
- `CalendarCheck` アイコンを `src/lib/icon-registry.ts` に追加すること（import + ICON_REGISTRY エントリ）
- 5 Days Impact との連動: レビューで status を変更すると `recentDays` が更新され、`DailyImpactSummary` の fiveDays セクションが useMemo 経由で自動反映される
- frequency-support で追加された weekly/weekday/custom 習慣のドットは非連続日の場合がある。曜日ラベルはこの場合にも正しく表示される（各 day.date から曜日を取得するため）

---

## 関連コード（現在の状態）

| ファイル | 役割 |
|---------|------|
| `src/app/(app)/page.tsx` | Home画面。useHabits() → getStats() → DailyImpactSummary + HabitList |
| `src/hooks/useHabits.ts` | `setDayStatus(habitId, date, status)` を公開。status='none' は deletion |
| `src/lib/habits.ts` | `shouldShowToday()`, `getRecentDays()`, `getDateString()` 等の pure 関数 |
| `src/components/habits/habit-card.tsx` | `DayStatusDot` コンポーネント + `handleDotTap` + `nextStatus` |
| `src/components/habits/daily-impact-summary.tsx` | Today + 5 Days Impact 表示。useMemo で recentDays から集計 |
| `src/components/ui/sheet.tsx` | Shadcn Sheet（既存） |
| `src/lib/icon-registry.ts` | 52アイコン登録済。CalendarCheck は未登録 |
| `src/types/habit.ts` | `DayStatus` = { date, status: 'completed'|'failed'|'none'|'rocket_used'|'skipped' } |

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] ビルドエラーなし
- [ ] テストに新規失敗なし

**機能固有の条件:**
- [ ] 昨日の未レビュー習慣がある場合、Home画面に amber バナーが表示される
- [ ] バナーをタップするとレビューシートが開く
- [ ] レビューシートに昨日の全習慣（非アーカイブ）が表示される
- [ ] 各習慣のステータスをタップで4値サイクル（none → completed → skipped → failed → none）
- [ ] ステータス変更が即座に保存される（setDayStatus 経由）
- [ ] 全習慣にステータスが入ったらバナーが消える
- [ ] Home View の過去日ドットに曜日ラベル（月、火、水...）が表示される
- [ ] 曜日ラベルが locale 対応（ja: 月火水、en: M T W）
- [ ] i18n 対応（ja/en の全キー追加）
- [ ] CalendarCheck アイコンが icon-registry に追加されている
