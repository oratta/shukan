# Design: redesign-quit-habit-input

## Context

現行の入力体系は習慣タイプごとに別物になっている。positive はカード左の円ボタンタップで `nextStatus` による3値サイクル（none→completed→failed→none、`habit-card.tsx:32`）、quit は同じ位置が誘惑撃退リングで、タップすると VsTemptationModal が開き coping steps のチェックリストをこなす。quit の今日達成判定は `isQuitHabitCompletedToday`（all_completed な urge_logs ≥ dailyTarget）で、completion レコードと二重系統になっている。

前提事実（コード確認済み）:

- ドラッグ&ドロップは GripVertical の**専用ハンドル**にのみ `listeners` が付いている（`habit-card.tsx:344-357`）。カード本体・ステータスボタンへの長押し導入に dnd-kit との競合はない
- カード行クリックは展開トグル。StatusIndicator と週ドットは `stopPropagation` 済み
- shadcn の `Sheet`（`src/components/ui/sheet.tsx`）が既存。ボトムシートとして流用可能
- テストは vitest（`npm run test:run`）、`src/__tests__/` と lib のユニットテストが既存
- 過去日入力は `recentDays` 週ドット（size-3 の小ボタン）で今日と同じ `handleDotTap` を使う

## Goals / Non-Goals

**Goals:**

- タップの意味論を全習慣タイプで統一する（タップ＝達成の二値トグル）
- 失敗・スキップ・メモを長押しアクションシートに集約する
- quit の失敗に我慢率（resist_rate）のグラデーションを持たせ、表示で「マシな失敗」を区別する
- quit の達成判定を completion レコード一本に戻し、urge_logs 依存を断つ

**Non-Goals:**

- urge_logs / coping_steps / habits.daily_target テーブル・カラムの drop（別 issue）
- resist_rate のエビデンス統計・難易度推定への組み込み（#86〜#88 側）
- 夜の振り返り（daily_reflections）への quit 確認の統合
- 通知・リマインダーの追加

## Decisions

### D1: 長押しの実装は自前の useLongPress フック（pointer events + 500ms タイマー）

dnd-kit の TouchSensor は delay 200ms だがドラッグ発火はハンドル限定なので競合しない。`onPointerDown` でタイマー開始、`onPointerUp`/`onPointerLeave`/`onPointerCancel` で解除、500ms 経過でシートを開き**直後の click を1回抑止**するフラグを立てる。`onContextMenu` は preventDefault（モバイル長押しメニュー抑止）。外部ライブラリは足さない。

- 代替案: `use-long-press` パッケージ導入 → 依存を増やすほどの複雑さがないため却下
- 週ドット（size-3）は当たり判定が小さすぎるため、ドットのラッパーに不可視パディング（min 24px タッチターゲット）を足して同じフックを適用する

### D2: アクションシートは既存 Sheet(side="bottom") の薄いラッパー `HabitActionSheet`

新規コンポーネント `src/components/habits/habit-action-sheet.tsx`。対象習慣と対象日（今日 or 過去日）を受け取り、「失敗した / スキップ（済みなら解除）/ メモ」を縦に並べる。メモはシート内 textarea で `updateNote` を呼ぶ。ダッシュボード側で1個だけマウントし、`{habitId, date}` の state で開閉する（VsTemptationModal と同じマウントパターンを踏襲）。

### D3: 「失敗した」タップで即 failed を記録し、その後に resist_rate チップを出す

quit の場合、failed 記録 → シート内容が「どれくらい我慢できた？」4択チップ（0/25/50/75%）+「入力せずに閉じる」に切り替わる。チップ選択で同じ completion レコードの resist_rate を更新して閉じる。**先に failed を確定させる**ので、チップを無視して閉じても失敗は記録済み（AC「スキップしても failed は記録される」を構造的に満たす）。positive の場合はチップを出さず即閉じる。

- 代替案: チップ選択と同時に failed を書く → シートを閉じられたとき失敗が消える。却下

### D4: nextStatus は二値トグルに縮退

`none → completed`、`completed | rocket_used → none`、`failed | skipped → none`（タップで取り消して未入力に戻せる。failed からワンタップで completed にはしない — 誤操作で失敗が達成に化けるのを防ぐ）。関数名は維持し実装だけ変える。quit の StatusIndicator は positive と同じ円ボタン（達成時は Check、quit は達成色のまま）に置き換え、リング・todayUrgeCount・dailyTarget 参照を撤去する。

### D5: resist_rate の表示は「赤の量＝失敗の量」の反転塗り

失敗日の可視化は **赤い部分の面積 = やってしまった度合い（100 − resist_rate）** で表す。resist_rate=0（無抵抗）は全面赤（現行と同じ見た目）、75% は 1/4 だけ赤・残りはニュートラル（gray-300 系）。「赤が少ない＝マシな失敗」という直感に一致し、緑を一切使わない（カラールール順守）。

- 週ドット（size-3）: SVG の円弧 2 本（赤 + gray）で描画。resist_rate が null なら全面赤
- StatusIndicator（size-8、今日が failed のとき）: 同じ円弧表現 + 中央に小さく `75%` テキスト
- 詳細モーダルのカレンダーが failed 日を表示している場合は同じコンポーネントを流用（存在しなければ対象外）

### D6: quit の達成判定は positive と完全に同一化

`isQuitHabitCompletedToday` を削除し、`completedToday` は習慣タイプ問わず「今日の completion が completed | rocket_used」で判定。`getEffectiveStatus`（6日放置→failed）は現行のまま。`HabitWithStats.todayUrgeCount` を削除。

### D7: coping steps は UI ごと削除（読み物への降格はしない）

VsTemptationModal を消すと coping steps の閲覧・編集導線が habit-form にしか残らず、入力必須だけが残る歪んだ状態になる。編集導線のない死にデータを表示だけ残すより、UI から完全に外す（habit-form の coping 入力・必須バリデーション・dailyTarget 入力を削除）。`coping_steps` テーブルと既存データは残置し、復活させる場合は別 issue で設計し直す。

- 代替案: 習慣詳細に読み物として表示 → 編集不能な表示は中途半端で、この change のスコープを膨らませる。却下（issue 側の「実装時に判断」をここで確定）

### D8: DB とデータ層

- マイグレーション: `ALTER TABLE habit_completions ADD COLUMN resist_rate int CHECK (resist_rate >= 0 AND resist_rate <= 100)`（nullable）
- `src/lib/supabase/habits.ts` の snake↔camel マッピングに `resist_rate ↔ resistRate` を追加
- `useHabits.setDayStatus(habitId, date, status, opts?: { resistRate?: number })` に拡張。`updateResistRate(habitId, date, rate)` は setDayStatus の upsert に含める形にし、独立関数は作らない
- `startUrgeFlow` / `completeUrgeStep` / `markQuitDailyDone` と supabase 層の urge 系関数を削除。`UrgeLog` / `CopingStep` 型も削除（残置テーブルに対する読み書きコードを残さない）

## Risks / Trade-offs

- [長押しの発見可能性が低い] → 初回のみのヒント表示は今回スコープ外。展開ボディの Skip ボタンを残すことで、スキップだけは従来導線でも到達可能。失敗記録の導線が見つからないリスクは残るが、失敗は低頻度操作であり許容
- [3値サイクル廃止で「タップだけで失敗を付ける」既存ユーザーの習慣が壊れる **BREAKING**] → 失敗は長押しシートに移動。リリースノート/変更告知は launch 前のため不要と判断
- [過去の urge_logs 由来の統計・表示が参照切れになる] → grep で `todayUrgeCount` / `urgeLogs` の全参照を洗い、表示側をすべて撤去することで「読まないデータ」に落とす。DB は残るので破壊なし
- [週ドットの長押しが小さくて押しづらい] → 不可視パディングで 24px 確保。それでも厳しければ過去日の失敗記録は展開→詳細経由という逃げ道が残る
- [resist_rate の円弧描画が size-3 で潰れる] → 4段階（0/25/50/75）しかないので視認は成立する見込み。実装後にブラウザ検証で確認する

## Migration Plan

1. マイグレーション追加 → `supabase db push`（dev）
2. 型・データ層 → ロジック → UI の順に実装（テスト先行）
3. 既存 quit 習慣は初回表示から新UI（データ変換は不要。urge_logs は読まなくなるだけ）
4. ロールバック: UI リバートのみで戻る（resist_rate カラムは nullable なので残っても無害）

## Open Questions

なし（D7 で issue 側の保留を確定済み）
