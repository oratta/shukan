# habit-skip Delta Specification

## ADDED Requirements

### Requirement: アクションシートからのスキップ

システムは長押しアクションシート（habit-input-actions）からも今日および過去日のスキップ／スキップ解除を実行できなければならない（MUST）。既存の展開ボディの Skip / Unskip ボタン（REQ-SK-03）は維持されなければならない（MUST）。

#### Scenario: アクションシートからスキップする
- **WHEN** 未スキップの習慣のアクションシートで「スキップ」をタップする
- **THEN** `setDayStatus(habitId, date, 'skipped')` が呼ばれ、既存のスキップ動作（REQ-SK-01）と同一の結果になる

#### Scenario: アクションシートからスキップ解除する
- **WHEN** 対象日が `skipped` の習慣のアクションシートで「スキップ解除」をタップする
- **THEN** 対象日のレコードが削除され `none` に戻る

#### Scenario: 過去日のスキップ
- **WHEN** 過去日の週ドット長押しから開いたアクションシートで「スキップ」をタップする
- **THEN** その過去日が `skipped` として記録される
