## MODIFIED Requirements

### Requirement: エビデンス付き習慣作成
システムは習慣作成時にエビデンスを紐付けて保存できなければならない（MUST）。

#### Scenario: Discoverからのプリフィル作成
- **WHEN** Discoverからエビデンスを選択して習慣作成する
- **THEN** 習慣名がエビデンスのhabitNameでプリフィルされる
- **THEN** 習慣タイプがエビデンスのdefaultHabitTypeで設定される
- **THEN** エビデンスがweight=100でプリフィルされる

#### Scenario: エビデンス付き習慣の保存
- **WHEN** エビデンス付きの習慣フォームを送信する
- **THEN** 習慣がhabitsテーブルに保存される
- **THEN** エビデンスがhabit_evidencesテーブルに保存される
- **THEN** 保存された習慣のevidences配列にエビデンスが含まれる
