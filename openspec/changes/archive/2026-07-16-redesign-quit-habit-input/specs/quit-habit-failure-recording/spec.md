# quit-habit-failure-recording Delta Specification

## REMOVED Requirements

### Requirement: Quit 習慣のリングをタップして VS モーダルを開く
**Reason**: 「誘惑が来た瞬間にアプリを開く」前提が実使用に耐えず、リングタップ＝モーダル起動は positive のタップ＝達成記録と意味論が衝突するため。入力体系を habit-input-actions のタップ二値トグル＋長押しアクションシートに統一する。
**Migration**: quit の StatusIndicator は positive と同一の達成トグルボタンになる。VsTemptationModal・誘惑カウントリングは削除。

### Requirement: VS モーダルに「負けた」ボタンを表示する
**Reason**: VS モーダル自体を撤去するため。失敗記録の導線はアクションシートの「失敗した」に置き換わり、quit では続けて我慢率（resist_rate）を任意入力できる。
**Migration**: 失敗の記録は habit-input-actions の「失敗の記録とquit の我慢率入力」Requirement を参照。

### Requirement: カード行から独立した VS ボタンを削除する
**Reason**: VS モーダルへのエントリーポイントという概念自体が消滅するため（削除済みの VS ボタンが復活するわけではない）。
**Migration**: なし（UI 上の VS 系要素は全廃）。

### Requirement: i18n 対応
**Reason**: VS モーダル専用文言（habits.iGaveIn 等）が不要になるため。
**Migration**: アクションシート・我慢率チップの文言は habit-input-actions の「i18n 対応」Requirement で定義する。
