# 昨日レビュー機能 + Home View UX改善

> **⚠️ 未実行**: このinstructionは旧ロングランワークフローで作成されたもので、実行されていない。（2026-03-18 アーカイブ）

## 概要

習慣化アプリに「昨日のレビュー」機能を追加する。ユーザーがアプリを開いた時に、昨日の全習慣を一括で振り返りチェックできるようにする。これにより毎朝の習慣レビュー体験を確立し、`daily_habit_review` 記事（毎日の習慣レビュー）のユースケースに直結する。

併せて、Home View の過去日ドットに日付表示を追加し、どの日がどの状態かをわかりやすくする。

## 実行フロー

**Phase 1: 昨日レビューモーダル** → **Phase 2: Home View UX改善（日付ラベル）** → **Phase 3: ビルド検証 + コミット**

---

## Phase 1: 昨日レビューモーダル

### 1.1 設計方針

**アプローチ**: Home画面上部に「昨日をレビュー」セクションを表示する

- 新規ルート/タブは**追加しない**（BottomNavは現在4タブで十分機能している）
- Home画面（`src/app/(app)/page.tsx`）の上部に、昨日の未レビュー習慣がある場合にバナーを表示
- バナーをタップすると、昨日の全習慣を一覧表示するシート（Sheet）が開く
- シート内で各習慣の完了/失敗/未実施をトグルできる
- 全習慣をレビューし終えたらシートを閉じる（バナーは非表示になる）

### 1.2 「昨日未レビュー」の判定ロジック

`src/lib/habits.ts` に追加:
```typescript
function getYesterdayUnreviewedHabits(
  habits: Habit[],
  completions: HabitCompletion[]
): Habit[]
```

判定条件:
- 昨日の日付を計算（`new Date()` から1日前）
- `shouldShowToday` と同様のロジックで昨日表示すべき習慣をフィルタ
- 昨日の completion が `status: 'completed' | 'failed' | 'skipped'` のいずれかであればレビュー済み
- completion が無い（`none`）習慣が1つでもあれば「未レビュー」

### 1.3 レビューバナーコンポーネント

`src/components/habits/yesterday-review-banner.tsx` を新規作成:

- Home画面の DailyImpactSummary と HabitList の間に表示
- 条件: 昨日の未レビュー習慣が1つ以上ある場合のみ
- UI:
  - 角丸カード（`bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800`）
  - 左にカレンダーアイコン（`CalendarCheck` from lucide）
  - テキスト: 「昨日の習慣をレビュー」 / "Review yesterday's habits"
  - 右に未レビュー件数バッジ + ChevronRight
  - タップでレビューシートを開く

### 1.4 レビューシートコンポーネント

`src/components/habits/yesterday-review-sheet.tsx` を新規作成:

- `Sheet` コンポーネント（`@/components/ui/sheet`）を使用
- ヘッダー: 昨日の日付（「3月10日（月）のレビュー」）
- 全習慣のリスト:
  - 各行: アイコン + 習慣名 + ステータストグル（完了/失敗/スキップ）
  - ステータスはタップで切替: none → completed → failed → none のサイクル
  - quit 型の習慣は: none → completed → failed → none
  - positive 型の習慣は: none → completed → failed → none
  - 既にステータスが入っている場合はそれを反映
- フッター: 「完了」ボタン（全習慣に何らかのステータスが入ったら primary カラー、そうでなければ muted）
- ステータス変更は即座に `setDayStatus(habitId, yesterdayDate, status)` で保存

### 1.5 page.tsx の変更

`src/app/(app)/page.tsx`:
- `getYesterdayUnreviewedHabits` を使って未レビュー判定
- レビューバナーを DailyImpactSummary の下に配置
- レビューシートの state 管理を追加

### 1.6 i18n キー

`src/messages/ja.json` / `src/messages/en.json` に追加:
- `habits.reviewYesterday`: 「昨日の習慣をレビュー」/ "Review yesterday's habits"
- `habits.reviewTitle`: 「{date}のレビュー」/ "Review for {date}"
- `habits.reviewDone`: 「完了」/ "Done"
- `habits.unreviewedCount`: 「{count}件未チェック」/ "{count} unchecked"

---

## Phase 2: Home View UX改善（日付ラベル）

### 2.1 過去日ドットに日付を追加

`src/components/habits/habit-card.tsx` の DayStatusDot 表示部分:

現状（line 240-248）:
```tsx
<div className="flex items-center gap-1.5">
  {(habit.recentDays ?? []).slice(1).map((day) => (
    <DayStatusDot key={day.date} day={day} onTap={() => handleDotTap(day)} />
  ))}
</div>
```

変更:
- 各ドットの上（または下）に曜日の省略形を表示する
- 例: 「月」「日」「土」「金」「木」（右から左に並ぶ。左が昨日、右が最古）
- テキストサイズ: `text-[9px] text-muted-foreground`
- ドットとラベルを `flex flex-col items-center gap-0.5` でまとめる

日付の曜日取得:
```typescript
const dayLabel = new Date(day.date).toLocaleDateString(locale, { weekday: 'narrow' });
// ja → "月", "火", etc.  en → "M", "T", etc.
```

**注意**: `locale` は `useTranslations` から取得するか、`useLocale()` を使用

### 2.2 DayStatusDot コンポーネントの拡張

DayStatusDot に `label` prop を追加（もしくは親で wrap する）:
```tsx
<div className="flex flex-col items-center gap-0.5">
  <span className="text-[9px] text-muted-foreground leading-none">{dayLabel}</span>
  <DayStatusDot day={day} onTap={...} />
</div>
```

---

## Phase 3: ビルド検証 + コミット

- TypeScript 型チェック（`npx tsc --noEmit`）
- テスト実行（`npx vitest run`）
- Next.js ビルド（`npx next build`）
- コミット

---

## 制約・注意事項

- レビューシートでの変更は即座に保存される（確認ダイアログなし — 間違えても再度タップで修正可能）
- 昨日より前の日（2日前、3日前など）のレビューは**この機能の範囲外**（既存の HabitDetailModal のカレンダーで対応可能）
- 習慣の `shouldShowToday` ロジックと同様に、昨日も frequency に基づいてフィルタする（daily は常に対象、weekly は昨日が月曜の場合のみ等）
- スキップ機能と整合: 昨日スキップされた習慣はレビュー済みとして扱う
- quit 型の習慣のレビュー: 「昨日誘惑に負けなかった？」の意味で completed/failed を選ぶ
- レビューシートのアイコンは `src/lib/icon-registry.ts` の `ICON_REGISTRY` を使用して habit.icon をレンダリングする
- CalendarCheck アイコンを `src/lib/icon-registry.ts` に追加する必要あり（import 追加）

---

## 完了条件

**必須条件（ワークフロー成果物）:**
- [ ] テストが作成され全てPASSしている
- [ ] ビルドエラーなし

**機能固有の条件:**
- [ ] 昨日の未レビュー習慣がある場合、Home画面にバナーが表示される
- [ ] バナーをタップするとレビューシートが開く
- [ ] レビューシートに昨日の全習慣が表示される
- [ ] 各習慣のステータスをトグルで切り替えられる
- [ ] ステータス変更が即座に保存される
- [ ] 全習慣にステータスが入ったらバナーが消える
- [ ] Home View の過去日ドットに曜日ラベルが表示される
- [ ] i18n 対応（ja/en）
