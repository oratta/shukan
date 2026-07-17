# Design: bulk-past-day-editing

## Context

過去日入力は #104（PR #105）で「ドット個別タップ→1日分アクションシート」（案A）になったが、複数日をまとめて入力するには往復が日数分必要。issue #107 の案1（ドット領域タップ→一括編集シート）を採用する。設計判断はユーザーと合意済み: 案1のみ / 対象は過去7日 / ドットは表示専用化 / 行内は再タップ解除+「…」で既存シート / 展開ビューは現状維持+一括シートへの導線追加。

現状の関連実装:
- `habit-card.tsx`: `DayStatusDot`（個別 `<button>`、タップで `onOpenActionSheet(habitId, date)`）、今日は `StatusIndicator`（タップ=二値トグル、長押し=シート）
- `habit-action-sheet.tsx`: 1日分のアクションシート（menu / resist / memo の3ビュー）
- `habit-detail-modal.tsx`: `tappableDates`=今日+過去4日、`rocketEligibleDates`=`diff > 5`（**5日前がどちらでも編集不能な off-by-one 隙間あり**）
- `useHabits.setDayStatus(habitId, date, status, opts)`: 日単位 upsert/delete + 楽観更新。bulk API は無い
- `dashboard-client.tsx`: `actionSheetTarget {habitId, date}` を単一保持

## Goals / Non-Goals

**Goals:**
- シート起動1回+日数分のタップで直近数日の入力が完了する導線
- ドットの精密タップ問題の根本解決（表示専用化）
- 編集可能枠とロケット境界の7日統一・定数1箇所化

**Non-Goals:**
- 展開ビューの情報構成の再設計（Life Significance / KPI影響 / 連続日数 / 節約額の並びは現状維持）
- 詳細モーダルカレンダーの動作変更（境界日数の変更のみ。タップ=二値トグルは維持）
- bulk 更新 API・DB スキーマ変更（`setDayStatus` の日単位呼び出しを再利用）
- 8日以上前の通常編集（引き続きロケット専用）

## Decisions

### D1: 一括編集シートは新規コンポーネント `HabitBulkEditSheet`
`src/components/habits/habit-bulk-edit-sheet.tsx` を新設。共通 `Sheet`（`side="bottom"`）ベースで `HabitActionSheet` のパターンを踏襲。1画面に「習慣名 + 行リスト（日付 / 達成・失敗・スキップの3ボタン / …）」を持つ。**代替案**: `HabitActionSheet` に複数日モードを足す → menu/resist/memo の view state と直交して複雑化するため不採用。

### D2: 対象日の算出は純関数 `getEditablePastDays(habit)` を `lib/habits.ts` に追加
`habit.allDays`（全期間の DayStatus）と frequency から「今日を除く過去 `EDITABLE_PAST_DAYS` 日のうち対象日」を新しい順で返す。曜日指定（weekday/custom）は対象曜日のみ、daily/weekly は7日全部。vitest で直接テストする。**代替案**: `recentDays` を拡張 → recentDays はドット表示用（頻度により3〜7日）で意味が違うため分離。

### D3: 境界定数 `EDITABLE_PAST_DAYS = 7` を `lib/habits.ts` で export
- 一括編集シートの対象日: `getEditablePastDays` 内で使用
- 詳細モーダル `tappableDates`: `i <= EDITABLE_PAST_DAYS`（今日+7日）
- ロケット対象: `diff > EDITABLE_PAST_DAYS`
- **未記録日の自動失敗表示**（`getAllDayStatuses` の `daysDiff >= 5 → 'failed'`）も `daysDiff > EDITABLE_PAST_DAYS` に変更。動かさないと「5〜7日前の未記録日が failed 表示のままタップしても `nextStatus('failed')='none'` の空振り削除になり達成にできない」詰みが生じる（編集枠・自動失敗・ロケットの3境界は常に同一値でなければならない）
これで「5日前の失敗日がどちらでも救えない」既存の隙間も解消される。

### D4: 更新は `setDayStatus` の日単位呼び出しを再利用
行のボタンタップごとに1回呼ぶ。楽観更新・アナリティクス（`habit_status_set`）・note 保持は既存実装がそのまま効く。7件程度の逐次 upsert で性能上の問題はない。**代替案**: bulk upsert API → 連続入力 UI では1タップ=1日で自然に分割されるため不要。

### D5: ドット領域は単一の `<button>` でラップ、`DayStatusDot` は表示専用に
過去日ドット列（`recentDays.slice(1)` のループ）全体を1つの `<button>`（`onClick` で `e.stopPropagation()` → `onOpenBulkEdit(habit.id)`）で包む。`DayStatusDot` は `<button>` → 非インタラクティブ要素に変更し、不可視パディング（`-m-1.5 p-1.5`）と `onOpen` prop を除去。今日の `StatusIndicator` は対象外（従来どおりタップ=トグル、長押し=シート）。ラップボタンはドット列+余白をカバーし、タッチ高さ 44px 以上を確保する。

### D6: シートの state は `dashboard-client` に `bulkEditTarget: habitId | null` を追加
`HabitList` → `HabitCard` に `onOpenBulkEdit(habitId)` を配線。行末「…」タップ時は `bulkEditTarget` を閉じてから `actionSheetTarget = {habitId, date}` をセット（一括→1日分への一方向遷移。1日分シートを閉じても一括シートには自動で戻らない — Radix Sheet の入れ子を避けるためのシンプル化）。

### D7: quit 失敗時の我慢率チップはシート内の行ローカル state
`resistTargetDate: string | null` を `HabitBulkEditSheet` 内に保持。quit 行の「失敗」タップで `setDayStatus(date, 'failed')` を即実行 → その行の下に既存の4択チップ（`RESIST_CHOICES` を `habit-action-sheet.tsx` から共通化して再利用）を展開。チップ選択で `setDayStatus(date, 'failed', {resistRate})` → チップを畳む。他の行を操作したら未選択のまま畳む（failed は維持）。

### D8: 展開ビューには下部ボタン列に「過去日をまとめて入力」を追加
既存の「詳細」「スキップ」ボタン行に3つ目として追加（`onOpenBulkEdit` を呼ぶだけ）。情報構成は変更しない。

### D9: 文言・i18n
`messages/ja.json` / `en.json` に一括編集シート用のキーを追加。達成ボタンのラベルは既存アクションシートの文言体系（quit=「守れた」系）に合わせる。ユーザー向け文言に「ストリーク」は使わない（プロジェクトルール）。

## Risks / Trade-offs

- [シート内スクロールと行ボタンのタップ競合] → 行は縦リストで各ボタンは十分な高さ（44px 目安）を確保。長押し等のジェスチャは行に割り当てない
- [ドット領域タップの誤爆（カード展開のつもりがシートが開く）] → ドット列は視覚的にひとかたまりであり、カード展開はカード本体タップで従来どおり。`stopPropagation` で二重発火を防ぐ
- [曜日指定習慣でドット表示（対象曜日の直近4回=最大4週前）とシート行（過去7日内のみ）が一致しない] → 仕様として受容（編集は7日以内のルールの帰結）。7日超のドットは表示専用、失敗日は詳細モーダルのロケットで救済
- [編集枠拡大（4日→7日）によるロケット希少性の低下] → ロケットの役割は「もう戻れない昔の失敗の救済」であり設計意図は維持される。獲得ロジック（10日連続ごと）は変更しない
- [一括→1日分シートの一方向遷移（自動で戻らない）] → メモ等は低頻度操作なので許容。使用感に問題があれば戻り遷移を後続で追加

## Migration Plan

クライアントのみの変更で DB・API 変更なし。通常のデプロイでロールバック可（revert のみ）。既存データへの影響なし。

## Open Questions

なし（設計判断はユーザーと合意済み）
