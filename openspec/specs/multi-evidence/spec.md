## ADDED Requirements

### Requirement: マルチエビデンスデータモデル
システムは1つの習慣に複数のエビデンス記事を紐付けるデータモデルを提供しなければならない（MUST）。

#### Scenario: habit_evidencesテーブルの作成
- **WHEN** マイグレーションが適用される
- **THEN** habit_evidencesテーブルが作成される（id, habit_id, article_id, weight, created_at）
- **THEN** weightは1-100のCHECK制約を持つ
- **THEN** (habit_id, article_id) にUNIQUE制約がある
- **THEN** habit_id にON DELETE CASCADEが設定されている

#### Scenario: RLSポリシーの適用
- **WHEN** 認証済みユーザーがhabit_evidencesにアクセスする
- **THEN** 自分の習慣に紐付くエビデンスのみ操作可能（SELECT/INSERT/UPDATE/DELETE）
- **THEN** 他のユーザーのエビデンスにはアクセスできない

#### Scenario: 既存データのマイグレーション
- **WHEN** マイグレーションが適用される
- **THEN** 既存のhabits.impact_article_idがhabit_evidencesに移行される（weight=100）
- **THEN** 元のimpact_article_idカラムは維持される（後方互換性）

### Requirement: エビデンスCRUD操作
システムは習慣に対するエビデンスの追加・取得・更新・削除をサポートしなければならない（MUST）。

#### Scenario: エビデンスの取得
- **WHEN** 習慣一覧を取得する
- **THEN** 各習慣のevidences配列が紐付いたエビデンスで populated される

#### Scenario: エビデンスの追加
- **WHEN** 習慣にエビデンスを追加する（articleId, weight=100）
- **THEN** habit_evidencesにレコードが挿入される
- **THEN** 既に同じarticleIdが紐付いている場合はエラー（UNIQUE制約）

#### Scenario: エビデンスの重み更新
- **WHEN** エビデンスのweightを変更する（1-100の範囲）
- **THEN** habit_evidencesのweightが更新される

#### Scenario: エビデンスの削除
- **WHEN** エビデンスを削除する
- **THEN** habit_evidencesからレコードが削除される
- **THEN** 習慣自体は削除されない
