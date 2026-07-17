# Tasks: bulk-past-day-editing

## 1. ロジック層（定数・対象日算出）— テスト先行

- [x] 1.1 `getEditablePastDays` と `EDITABLE_PAST_DAYS` のテストを先に書く（`src/__tests__/bulk-past-day-editing.test.ts`）: daily=過去7日新しい順 / weekday・custom=対象曜日のみ / weekly=7日全部 / 今日を含まない / 既存ステータス（resistRate 含む）の反映
- [x] 1.2 `src/lib/habits.ts` に `EDITABLE_PAST_DAYS = 7` を export し、`getEditablePastDays(habit)` を実装（Red→Green）

## 2. 編集可能枠7日・ロケット境界の統一

- [x] 2.1 `habit-detail-modal.tsx` の `tappableDates`（今日+過去4日→今日+`EDITABLE_PAST_DAYS`日）と `rocketEligibleDates`（`diff > 5`→`diff > EDITABLE_PAST_DAYS`）を定数参照に変更。5日前の失敗日が通常編集できること・8日前はロケット対象のままであることをテストまたは動作確認で示す

## 3. 一括編集シート本体

- [x] 3.1 `RESIST_CHOICES`（我慢率4択）を `habit-action-sheet.tsx` から共有可能な場所へ抽出（既存シートの動作は不変）
- [x] 3.2 `src/components/habits/habit-bulk-edit-sheet.tsx` を新設: 行リスト（日付 + 達成/失敗/スキップ + 「…」）、選択状態表示、再タップで `none`、ステータス入力でシートを閉じない
- [x] 3.3 quit の「失敗」タップで即 `failed` 記録+行内我慢率チップ展開、選択で `resistRate` 保存、未選択で畳んでも failed 維持（positive ではチップ非表示）
- [x] 3.4 i18n キーを `messages/ja.json` / `messages/en.json` に追加（「ストリーク」不使用、quit の達成文言は既存体系に合わせる）

## 4. 配線（dashboard / カード）

- [x] 4.1 `dashboard-client.tsx` に `bulkEditTarget` state を追加し、`HabitBulkEditSheet` を `setDayStatus` / `actionSheetTarget` に配線（「…」= 一括を閉じて1日分シートを開く）
- [x] 4.2 `habit-card.tsx`: 過去日ドット列を単一 `<button>`（タップ=`onOpenBulkEdit`、`stopPropagation`、タッチ高さ44px以上）でラップし、`DayStatusDot` を表示専用（非 button・`onOpen` 除去）に変更。`HabitList` 経由で props を配線
- [x] 4.3 展開ビュー下部のボタン列に「過去日をまとめて入力」を追加（`onOpenBulkEdit`）

## 5. 既存テスト・仕上げ

- [ ] 5.1 過去日ドット個別タップ前提の既存テスト・spec 参照箇所を洗い出して更新（`habit-input-actions.test.ts` ほか）
- [ ] 5.2 `npm run test:run` / lint / `npx tsc --noEmit` / build を実行し、exit code を確認
- [ ] 5.3 dev サーバーでブラウザ動作確認: ドット領域タップ→シート→連続入力→ドット反映、quit チップ、「…」→メモ、展開ビューの導線、詳細モーダルの7日編集
