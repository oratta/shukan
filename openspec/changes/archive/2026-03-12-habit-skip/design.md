# Design Decisions

## D1: スキップは今日だけ有効（DB レコードで制御）

`habit_completions` テーブルに `status='skipped'` のレコードを当日の日付で upsert する。翌日は当日のレコードが存在しないため、自動的にアクティブ状態に戻る。追加の「期限管理」ロジックは不要。

## D2: スキップ解除は status='none' と同一の削除処理

スキップ解除（Unskip）は `deleteCompletion(habitId, today)` を呼ぶ。これは `status='none'` 設定と全く同じ動作で、コードの一貫性を保つ。

## D3: ストリーク計算でスキップ日は「透明な日」

スキップ日はストリーク連続を途切れさせず、かつ日数にもカウントしない。これにより:
- 完了5日 → スキップ2日 → 完了3日 = 8日連続（スキップ日は透過）
- スキップだけの期間でもストリークが維持される

実装: `calculateStreak` でスキップ日の Set を作り、ループ中にスキップ日をカウントせず読み飛ばす。

## D4: `nextStatus` サイクルにスキップを含めない

ステータスサークルのタップサイクル（none → completed → failed → none）にスキップを含めない。スキップは展開ボディの専用ボタンでのみ操作する。これにより誤操作を防止する。

## D5: drag-and-drop はアクティブ習慣セクションのみ

`DndContext` と `SortableContext` はアクティブ習慣のみを対象とする。スキップ済みセクションは DnD 対象外とし、アクティブ時の sortOrder 順を維持する。DragEnd 時は `onReorder` にアクティブ+スキップのIDを結合して渡す。

## D6: アニメーションは CSS `fadeSlideIn` のみ（framer-motion 不使用）

`framer-motion` の追加コストを避け、CSS カスタムアニメーション `@keyframes fadeSlideIn` を `globals.css` に追加。各カードに `animate-[fadeSlideIn_300ms_ease-out]` を適用することで、セクション移動時にフェードイン効果を実現する。

## D7: quit 型習慣もスキップ可能

positive 型と quit 型の両方が `onSkipToday` を受け取れる。quit 型固有の StatusIndicator（進捗リング）やVSボタンはスキップ状態に関わらず表示を維持する。

## D8: ライフインパクト計算からスキップ習慣を完全除外

`DailyImpactSummary` の earned/total 計算の両方からスキップ習慣を除外する。スキップ習慣がパーフェクト判定に影響しないよう、分母（total）からも除外する。

## D9: プログレスバーの分母からスキップ習慣を除外

`page.tsx` で `activeHabits = todayHabits.filter(h => !h.skippedToday)` を用いて分母を計算。スキップ習慣はプログレスに影響しない。
