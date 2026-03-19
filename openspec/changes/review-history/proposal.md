## Why

昨日レビューシートでムード・コメント・習慣ステータスを入力できるが、入力した内容を後から振り返る手段がない。「書いたことが読み返せない」と記録する動機が薄れ、振り返り習慣の定着を妨げる。

Stats ページに月間カレンダーと日次振り返り詳細を追加することで、過去の記録を可視化し、振り返り習慣の継続を促す。

## What Changes

- Stats ページの下部に「振り返り履歴」セクションを追加する（既存コンテンツは変更しない）
- 月間カレンダーを表示し、各日にムード色ドット（緑/黄/赤/灰）を表示する
- 前月/次月ナビゲーションで任意の月のカレンダーを閲覧できる
- 日付タップでカレンダー直下にインライン展開し、ムード・コメント・全習慣のステータスとメモを表示する（読み取り専用）
- Supabase から月単位でまとめてデータ取得する関数を追加する（`getMonthlyReflections`, `getMonthlyCompletions`）
- `MOOD_ICONS` 定数を `src/lib/mood-icons.ts` に抽出し、`yesterday-review-sheet.tsx` と新規 `review-day-detail.tsx` の両方で共有する

## Capabilities

### New Capabilities

- **review-history**: Stats ページで過去の振り返り記録（ムード・コメント・習慣ステータス）を月間カレンダー形式で閲覧できる

### Modified Capabilities

- `daily-impact-display`: Stats ページのレイアウトに「振り返り履歴」セクションが追加される（既存セクションは変更なし）

## Impact

- `src/lib/mood-icons.ts` — MOOD_ICONS 定数の抽出（新規ファイル）
- `src/components/habits/yesterday-review-sheet.tsx` — MOOD_ICONS を mood-icons.ts から import するよう変更
- `src/lib/supabase/habits.ts` — getMonthlyReflections, getMonthlyCompletions 関数を追加
- `src/hooks/useReviewHistory.ts` — カスタムフック（月間データ取得 + 選択日管理）（新規ファイル）
- `src/components/review/ReviewCalendar.tsx` — 月間カレンダーコンポーネント（新規ファイル）
- `src/components/review/ReviewDayDetail.tsx` — 日次振り返り詳細コンポーネント（新規ファイル）
- `src/app/(app)/stats/page.tsx` — ReviewCalendar を下部に追加
- `messages/ja.json`, `messages/en.json` — i18n キー追加
