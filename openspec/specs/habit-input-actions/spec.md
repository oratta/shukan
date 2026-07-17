# habit-input-actions Specification

## Purpose
やる系・やらない系（quit）で一貫した習慣入力体系を定義する。今日＝ステータスボタンのタップで達成二値トグル・長押しでアクションシート、過去日＝週ドットのタップでアクションシート（小ターゲットに精密操作を要求しない・案A）、quit 失敗時の我慢率（resist_rate）入力とそのグラデーション表示、quit 達成判定の completion レコード一本化を含む（issue #104 / change redesign-quit-habit-input）。
## Requirements
### Requirement: 今日のタップは達成の二値トグルである

システムは、習慣タイプ（positive / quit、daily / weekly）を問わず、カード左のステータスボタンのタップを「今日の達成の二値トグル」として扱わなければならない（MUST）。3値サイクル（none→completed→failed→none）は存在してはならない（MUST NOT）。詳細モーダルのカレンダーセル（十分な大きさを持つ）のタップも同じ二値トグルとする。

#### Scenario: 未入力をタップすると達成になる
- **WHEN** 今日のステータスが `none` の状態でステータスボタンをタップする
- **THEN** `setDayStatus(habitId, date, 'completed')` が呼ばれ、ステータスが `completed` になる

#### Scenario: 達成をタップすると未入力に戻る
- **WHEN** 今日のステータスが `completed` または `rocket_used` の状態でタップする
- **THEN** ステータスが `none` に戻る（completion レコード削除）

#### Scenario: 失敗・スキップをタップすると未入力に戻る
- **WHEN** 今日のステータスが `failed` または `skipped` の状態でタップする
- **THEN** ステータスが `none` に戻る
- **THEN** タップだけで `failed` が記録される経路は存在しない

#### Scenario: quit 習慣のタップは「守れた」を意味する
- **WHEN** quit 習慣のステータスボタンをタップする
- **THEN** positive と同一の二値トグルとして動作する（誘惑カウントリング・VSモーダル起動は存在しない）

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

### Requirement: アクションシートの入口（今日=長押し）と過去日ドットの表示専用化

システムは、ステータスボタンの長押し（500ms）で今日のアクションシートを開かなければならない（MUST）。過去日の週ドットは表示専用であり、ドット単位のタップ・トグル・長押し操作を持ってはならない（MUST NOT）。過去日の入力はドット領域タップで開く一括編集シート（`bulk-past-day-editing`）と、その行末「…」から開く1日分アクションシートで行う。アクションシートの構成は positive / quit で共通でなければならない（MUST）。

#### Scenario: 長押しで今日のシートが開く
- **WHEN** ステータスボタンを 500ms 以上押し続ける
- **THEN** ボトムシートが開き、「達成した」「失敗した」「スキップ」（記録がある日は「メモ」「未入力に戻す」も）が表示される
- **THEN** 長押し解放後のタップイベントで達成トグルが誤発火しない

#### Scenario: 過去日ドット個別のタップは何も起こさない
- **WHEN** 過去日の週ドット1個ぶんの位置をタップする
- **THEN** ステータスは変化せず、1日分のアクションシートも開かない（ドット領域全体のタップとして一括編集シートが開く）

#### Scenario: シートから達成を記録する
- **WHEN** 未達成の日のアクションシートで「達成した」をタップする
- **THEN** その日が `completed` として記録され、シートが閉じる
- **THEN** 達成済みの日のシートには「達成した」は表示されない

#### Scenario: シートから未入力に戻す
- **WHEN** 何らかの記録がある日のアクションシートで「未入力に戻す」をタップする
- **THEN** その日のレコードが削除され `none` に戻り、シートが閉じる
- **THEN** 未入力の日のシートには「未入力に戻す」は表示されない

#### Scenario: スキップ済みの日はスキップ解除が表示される
- **WHEN** 対象日が `skipped` の状態でアクションシートを開く
- **THEN** 「スキップ」の代わりに「スキップ解除」が表示される

#### Scenario: メモの入力
- **WHEN** アクションシートで「メモ」を選ぶ
- **THEN** シート内でテキスト入力ができ、保存すると completion の note が更新される

#### Scenario: 長押しはドラッグ&ドロップと競合しない
- **WHEN** ステータスボタンを長押しする
- **THEN** カードのドラッグ（GripVertical ハンドル起点）は発火しない

### Requirement: 過去日の編集可能枠は7日・ロケットは8日以上前が対象

システムは、過去日のステータス編集可能枠を「今日+過去7日」としなければならない（MUST）。一括編集シートの対象日・詳細モーダルカレンダーのタップ可能日はこの枠に従う（MUST）。ロケット救済の対象は「8日以上前（今日との日数差が7を超える）の failed 日」でなければならず（MUST）、編集可能枠とロケット対象の間に「どちらの手段でも変更できない日」が存在してはならない（MUST NOT）。未記録の過去日を失敗扱いで表示する自動失敗境界（`getAllDayStatuses`）も同じ境界に従い、編集可能枠内の未記録日は `none`（未入力）として表示されなければならない（MUST）。境界日数は単一の定数として定義し、複数箇所へのハードコードをしてはならない（MUST NOT）。

#### Scenario: 詳細モーダルで7日前まで編集できる
- **WHEN** 詳細モーダルのカレンダーで7日前のセルをタップする
- **THEN** 達成の二値トグルとして編集できる

#### Scenario: 5日前の失敗日が救済不能でなくなる（旧仕様の隙間解消）
- **WHEN** 5日前が `failed` の状態で一括編集シートまたは詳細モーダルを開く
- **THEN** その日を通常編集で `completed` に変更できる（旧仕様では編集枠外かつロケット対象外だった）

#### Scenario: 8日以上前の失敗日はロケット対象
- **WHEN** ロケットを1個以上保有し、8日前の `failed` 日を詳細モーダルで表示する
- **THEN** その日はロケット救済の対象として表示され、通常編集はできない

#### Scenario: 編集可能枠内の未記録日は自動失敗表示にならない
- **WHEN** 6日前に記録が無い状態で詳細モーダルのカレンダー・一括編集シートを表示する
- **THEN** その日は `none`（未入力）として表示され、タップ/行ボタンで `completed` にできる
- **THEN** 8日以上前の未記録日は従来どおり失敗扱いで表示される

#### Scenario: 境界は単一定数に集約される
- **WHEN** 編集可能枠の日数を変更する
- **THEN** 定数1箇所の変更で一括編集シート・詳細モーダル・ロケット判定のすべてに反映される

