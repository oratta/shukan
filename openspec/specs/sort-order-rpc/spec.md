## ADDED Requirements

### Requirement: Batch sort order update via RPC

Habit の sort_order を一括更新する PostgreSQL RPC 関数を提供する。クライアントから1回のリクエストで複数habitの並び順を更新できる。

#### Scenario: ユーザーがドラッグ&ドロップで並び替えた場合
- **WHEN** クライアントが `update_habit_sort_orders` RPCを `[{id, sortOrder}, ...]` の配列で呼び出す
- **THEN** 指定された全habitの sort_order が一括で更新される
- **THEN** リクエストは1回のみ（N+1ではない）

#### Scenario: 他ユーザーのhabitを更新しようとした場合
- **WHEN** updates配列に自分以外のユーザーのhabit IDが含まれている
- **THEN** そのhabitは更新されない（auth.uid() チェックで弾かれる）
- **THEN** エラーは返さず、自分のhabitのみ更新される

#### Scenario: 空の配列を渡した場合
- **WHEN** 空の updates 配列で RPC を呼び出す
- **THEN** 何も更新されず、エラーも発生しない
