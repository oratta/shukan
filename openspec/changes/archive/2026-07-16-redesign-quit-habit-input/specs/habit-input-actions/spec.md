# habit-input-actions Delta Specification

## ADDED Requirements

### Requirement: タップは達成の二値トグルである

システムは、習慣タイプ（positive / quit、daily / weekly）を問わず、カード左のステータスボタンおよび過去日の週ドットのタップを「達成の二値トグル」として扱わなければならない（MUST）。3値サイクル（none→completed→failed→none）は存在してはならない（MUST NOT）。

#### Scenario: 未入力をタップすると達成になる
- **WHEN** 対象日のステータスが `none` の状態でステータスボタン（または週ドット）をタップする
- **THEN** `setDayStatus(habitId, date, 'completed')` が呼ばれ、ステータスが `completed` になる

#### Scenario: 達成をタップすると未入力に戻る
- **WHEN** 対象日のステータスが `completed` または `rocket_used` の状態でタップする
- **THEN** ステータスが `none` に戻る（completion レコード削除）

#### Scenario: 失敗・スキップをタップすると未入力に戻る
- **WHEN** 対象日のステータスが `failed` または `skipped` の状態でタップする
- **THEN** ステータスが `none` に戻る
- **THEN** タップだけで `failed` が記録される経路は存在しない

#### Scenario: quit 習慣のタップは「守れた」を意味する
- **WHEN** quit 習慣のステータスボタンをタップする
- **THEN** positive と同一の二値トグルとして動作する（誘惑カウントリング・VSモーダル起動は存在しない）

### Requirement: 長押しでアクションシートが開く

システムは、ステータスボタンおよび週ドットの長押し（500ms）で、対象習慣・対象日のアクションシート（失敗した / スキップ / メモ）を開かなければならない（MUST）。シートの構成は positive / quit で共通でなければならない（MUST）。

#### Scenario: 長押しでシートが開く
- **WHEN** ステータスボタンを 500ms 以上押し続ける
- **THEN** ボトムシートが開き、「失敗した」「スキップ」「メモ」の選択肢が表示される
- **THEN** 長押し解放後のタップイベントで達成トグルが誤発火しない

#### Scenario: 過去日の週ドットの長押し
- **WHEN** 過去日の週ドットを 500ms 以上押し続ける
- **THEN** その日付を対象としたアクションシートが開く
- **THEN** 週ドットのタッチターゲットは 24px 以上確保される

#### Scenario: スキップ済みの日はスキップ解除が表示される
- **WHEN** 対象日が `skipped` の状態でアクションシートを開く
- **THEN** 「スキップ」の代わりに「スキップ解除」が表示される

#### Scenario: メモの入力
- **WHEN** アクションシートで「メモ」を選ぶ
- **THEN** シート内でテキスト入力ができ、保存すると completion の note が更新される

#### Scenario: 長押しはドラッグ&ドロップと競合しない
- **WHEN** ステータスボタンを長押しする
- **THEN** カードのドラッグ（GripVertical ハンドル起点）は発火しない

### Requirement: 失敗の記録とquit の我慢率入力

システムは、アクションシートの「失敗した」タップで対象日を即座に `failed` として記録しなければならない（MUST）。quit 習慣の場合は続けて我慢率の4択チップを表示し、選択された値を `habit_completions.resist_rate` に保存しなければならない（MUST）。チップ入力は任意であり、入力せず閉じても `failed` の記録は維持されなければならない（MUST）。

#### Scenario: positive の失敗記録
- **WHEN** positive 習慣のアクションシートで「失敗した」をタップする
- **THEN** `setDayStatus(habitId, date, 'failed')` が呼ばれ、シートが閉じる（チップは表示されない）

#### Scenario: quit の失敗記録と我慢率チップ
- **WHEN** quit 習慣のアクションシートで「失敗した」をタップする
- **THEN** 対象日が即座に `failed` として記録される
- **THEN** シート内容が「どれくらい我慢できた？」の4択チップに切り替わる: 完全にダメだった 0% / 少しは耐えた 25% / 半分くらい 50% / ほとんど耐えた 75%

#### Scenario: チップ選択で resist_rate が保存される
- **WHEN** 我慢率チップ（例: 75%）をタップする
- **THEN** 対象日の completion レコードの `resist_rate` が 75 で更新され、シートが閉じる

#### Scenario: チップを入力せずに閉じる
- **WHEN** チップ表示中にシートを閉じる（「入力せずに閉じる」または背景タップ）
- **THEN** `failed` の記録は維持され、`resist_rate` は null のままである

### Requirement: resist_rate のデータ保持

システムは `habit_completions.resist_rate` を 0〜100 の整数（nullable、CHECK 制約付き）として保持し、データ層で `resistRate` として camelCase マッピングしなければならない（MUST）。

#### Scenario: マイグレーションとマッピング
- **WHEN** `setDayStatus(habitId, date, 'failed', { resistRate: 50 })` を呼ぶ
- **THEN** `habit_completions` に `status='failed', resist_rate=50` が upsert される
- **THEN** 取得時に `HabitCompletion.resistRate === 50` として読める

#### Scenario: 範囲外の値は保存できない
- **WHEN** resist_rate に 0〜100 以外の値を書き込もうとする
- **THEN** DB の CHECK 制約により拒否される

### Requirement: 失敗日の我慢率グラデーション表示

システムは、quit 習慣の failed 日を「赤い面積 ＝ やってしまった度合い（100 − resist_rate）」の反転塗りで表示し、resist_rate 入りの失敗日を無抵抗の失敗日と視覚的に区別できなければならない（MUST）。この表示に緑を使ってはならない（MUST NOT）。

#### Scenario: 無抵抗の失敗日
- **WHEN** `resist_rate` が null または 0 の failed 日を週ドットに表示する
- **THEN** ドットは全面赤（現行の failed 表示と同等）で表示される

#### Scenario: 我慢率入りの失敗日
- **WHEN** `resist_rate = 75` の failed 日を週ドットに表示する
- **THEN** 円の 25% が赤、残り 75% がニュートラル色（グレー系）で表示される
- **THEN** 緑系の色は使われない

#### Scenario: 今日の failed 表示
- **WHEN** quit 習慣の今日が `resist_rate` 付きの failed である
- **THEN** ステータスボタン（size-8）が同じ反転塗りで表示され、中央に我慢率（例: 75%）が小さく表示される

### Requirement: quit の達成判定は completion レコードで行う

システムは quit 習慣の `completedToday` を positive と同一のロジック（今日の completion が `completed` または `rocket_used`）で判定しなければならない（MUST）。urge_logs・dailyTarget に基づく達成判定が存在してはならない（MUST NOT）。

#### Scenario: 誘惑記録ゼロでも達成にできる
- **WHEN** urge_logs が1件も無い quit 習慣のステータスボタンをタップする
- **THEN** 今日が `completed` になり `completedToday === true` になる

#### Scenario: urge_logs 依存コードの撤去
- **WHEN** コードベースを検索する
- **THEN** `isQuitHabitCompletedToday`・`todayUrgeCount`・urge_logs への新規書き込み（`startUrgeFlow` / `completeUrgeStep`）・`markQuitDailyDone` が存在しない
- **THEN** 過去の urge_logs / coping_steps データが DB に残っていても表示は壊れない

### Requirement: habit-form から quit 専用入力を撤去する

システムは習慣作成・編集フォームから dailyTarget（撃退ノルマ）入力と coping steps 入力（および必須バリデーション）を撤去しなければならない（MUST）。

#### Scenario: quit 習慣をコーピング手順なしで作成できる
- **WHEN** quit タイプを選択して習慣名のみ入力し保存する
- **THEN** coping steps 未入力でも保存が成功する
- **THEN** フォームに dailyTarget・coping steps の入力欄が表示されない

### Requirement: i18n 対応

システムはアクションシート・我慢率チップの文言を日英両言語で提供しなければならない（MUST）。ユーザー向け文言に「ストリーク」を使ってはならない（MUST NOT）。

#### Scenario: 新規文言の定義
- **WHEN** アプリを ja / en で表示する
- **THEN** 以下のキーが両言語で定義されている: 失敗した / スキップ / スキップ解除 / メモ / どれくらい我慢できた？ / 完全にダメだった / 少しは耐えた / 半分くらい / ほとんど耐えた / 入力せずに閉じる

#### Scenario: urge 系文言の削除
- **WHEN** messages/ja.json・en.json を検索する
- **THEN** VSモーダル専用の文言（iGaveIn / iResisted 等）が残っていない
