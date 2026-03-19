## 1. MOOD_ICONS 共有化

- [x] 1.1 `src/lib/mood-icons.ts` を新規作成し、`MoodIconDef` インターフェース（`{ Icon: LucideIcon; colorClass: string; value: number; dotColor: string }`）と `MOOD_ICONS` 配列を定義・export する
  - dotColor: mood 4-5 → `bg-green-400`、mood 3 → `bg-yellow-400`、mood 1-2 → `bg-red-400`
- [x] 1.2 `src/components/habits/yesterday-review-sheet.tsx` の `MOOD_ICONS` 定義を削除し、`src/lib/mood-icons.ts` から import するよう変更する

## 2. Supabase CRUD 関数

- [x] 2.1 `src/lib/supabase/habits.ts` に `getMonthlyReflections(userId: string, year: number, month: number)` を追加する
  - クエリ: `daily_reflections` テーブルで `date LIKE 'YYYY-MM-%'`
  - 返り値: `DailyReflection[]`（date, mood, comment）
- [x] 2.2 `src/lib/supabase/habits.ts` に `getMonthlyCompletions(userId: string, year: number, month: number)` を追加する
  - クエリ: `habit_completions` テーブルで `date LIKE 'YYYY-MM-%'`、`habits` テーブルを JOIN して habit 情報を取得
  - 返り値: `HabitCompletion[]`（habit_id, date, status, note + habit name/icon/color）

## 3. useReviewHistory カスタムフック

- [x] 3.1 `src/hooks/useReviewHistory.ts` を新規作成する
  - ステート: `displayYear`, `displayMonth`, `reflections`, `completions`, `selectedDate`, `loading`, `error`
  - 初期値: 現在年月、selectedDate = null
- [x] 3.2 月変更関数 `goToPrevMonth()`, `goToNextMonth()` を実装する（月変更時に selectedDate をリセット）
- [x] 3.3 `useEffect` で displayYear/displayMonth 変更時に `getMonthlyReflections` と `getMonthlyCompletions` を並列実行する（`Promise.all`）
- [x] 3.4 `selectedDate` のセット関数（同じ日なら null にトグル）を実装する

## 4. ReviewCalendar コンポーネント

- [x] 4.1 `src/components/review/ReviewCalendar.tsx` を新規作成する（'use client'）
- [x] 4.2 月ヘッダー（`< YYYY年M月 >`）と ChevronLeft / ChevronRight ナビゲーションボタンを実装する
  - 現在月の場合、ChevronRight ボタンを disabled にする
- [x] 4.3 曜日ヘッダー（月〜日）をロケール対応で表示する（next-intl の `useLocale` + Intl.DateTimeFormat）
- [x] 4.4 CSS Grid（`grid-cols-7`）で月間グリッドを実装する
  - 月の最初の日の曜日に応じた空白セルを先頭に追加する
  - 各日セルに日付番号とムード色ドットを表示する
  - 未来日は `text-muted-foreground/30 pointer-events-none` で無効化する
  - 選択中の日付は `ring-2 ring-primary` でハイライトする
- [x] 4.5 日付セルのタップで `onDateSelect(dateString)` を呼び出す

## 5. ReviewDayDetail コンポーネント

- [x] 5.1 `src/components/review/ReviewDayDetail.tsx` を新規作成する（'use client'）
- [x] 5.2 ムードセクションを実装する（MOOD_ICONS から該当アイコンを取得、Lucide アイコン + colorClass で表示）
- [x] 5.3 コメントセクションを実装する（コメントが空の場合は非表示）
- [x] 5.4 習慣ステータスリストを実装する
  - completed: Check アイコン（緑）
  - failed: X アイコン（オレンジ/赤）
  - skipped: Minus アイコン（灰）
  - none: Circle アイコン（薄灰）
  - メモが存在する場合はアイコン下にテキスト表示
- [x] 5.5 データなし状態（reflection も completions も空）の表示を実装する（「この日の記録はありません」）

## 6. Stats ページ統合

- [x] 6.1 `src/app/(app)/stats/page.tsx` に `useReviewHistory` フックと `ReviewCalendar` コンポーネントを追加する
  - 既存コンテンツの下部にセクション区切り線と「振り返り履歴」ヘッダーを追加する
  - `<ReviewCalendar />` を配置し、useReviewHistory のステートと関数を props で渡す
  - `selectedDate` に対応する reflections/completions データを `ReviewCalendar` 内で `ReviewDayDetail` に渡す

## 7. i18n キー追加

- [x] 7.1 `messages/ja.json` に以下のキーを追加する
  - `reviewHistory.title`: 「振り返り履歴」
  - `reviewHistory.noRecord`: 「この日の記録はありません」
  - `reviewHistory.mood`: 「ムード」
  - `reviewHistory.comment`: 「コメント」
  - `reviewHistory.habits`: 「習慣」
  - `reviewHistory.prevMonth`: 「前月」
  - `reviewHistory.nextMonth`: 「次月」
- [x] 7.2 `messages/en.json` に対応する英語キーを追加する

## 8. 検証

- [x] 8.1 TypeScript 型チェック（`npx tsc --noEmit`）エラーなし（pre-existing test file errors を除く）
- [x] 8.2 Next.js ビルド（`npx next build`）エラーなし
- [x] 8.3 テスト実行（`npx vitest run`）新規テスト全 PASS（34 tests）
