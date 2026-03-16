# Spec: Article Feedback

## Requirements

### REQ-AF-01: Feedback Table
article_feedbacks テーブルを作成。カラム: id (uuid PK), user_id (FK), article_id (text), type ('bad' | 'comment'), content (text?), created_at (timestamptz)。

### REQ-AF-02: RLS Policies
ユーザーは自分のフィードバックのみ INSERT/SELECT/DELETE 可能。

### REQ-AF-03: Stats View
article_feedback_stats ビューを作成。article_id ごとに bad_count, comment_count, last_feedback_at を集計。

### REQ-AF-04: Bad Mark Toggle
バッドマークボタンは同一ユーザー・同一記事で1回まで。再タップで取消（トグル式）。

### REQ-AF-05: Comment Submission
バッドマーク済みの場合、自由入力コメント欄が表示され、送信できる。コメントは複数投稿可。

### REQ-AF-06: Feedback UI Position
フィードバックUIは計算ロジックセクションの下に配置。「この数値に疑問がありますか？」テキスト + ThumbsDown ボタン。

### REQ-AF-07: Data Layer Functions
以下の関数を実装:
- submitBadMark(articleId) — バッドマーク投稿
- removeBadMark(articleId) — バッドマーク取消
- submitComment(articleId, content) — コメント投稿
- getUserFeedback(articleId) — 自分のバッドマーク状態取得

## Scenarios

### SCENARIO-AF-01: Submit bad mark
- WHEN: ユーザーがバッドマークボタンをタップする
- THEN: article_feedbacks に type='bad' のレコードが作成される
- AND: ボタンの色が変わる（アクティブ状態）

### SCENARIO-AF-02: Remove bad mark
- WHEN: バッドマーク済みのユーザーがボタンを再タップする
- THEN: article_feedbacks から type='bad' のレコードが削除される
- AND: ボタンが非アクティブ状態に戻る

### SCENARIO-AF-03: Show comment input after bad mark
- WHEN: バッドマークがアクティブ状態
- THEN: コメント入力欄（textarea + 送信ボタン）が表示される

### SCENARIO-AF-04: Submit comment
- WHEN: ユーザーがコメントを入力して送信ボタンを押す
- THEN: article_feedbacks に type='comment' のレコードが作成される
- AND: 「フィードバックありがとうございます」トーストが表示される
- AND: コメント入力欄がクリアされる

### SCENARIO-AF-05: Multiple comments allowed
- WHEN: ユーザーが同じ記事に対して2回コメントを送信する
- THEN: 2つの type='comment' レコードが作成される

### SCENARIO-AF-06: RLS enforcement
- WHEN: ユーザーAが自分のフィードバックを取得する
- THEN: ユーザーAのレコードのみ返される
- AND: ユーザーBのフィードバックは見えない

### SCENARIO-AF-07: Stats view aggregation
- WHEN: article_feedback_stats ビューを service_role キーで参照する
- THEN: 全ユーザーのフィードバックが article_id ごとに bad_count と comment_count で集計されている
- NOTE: クライアント（anon キー）からはRLSにより自分のデータのみ見える。全体集計は service_role 経由でのみ取得可能

### SCENARIO-AF-08: submitBadMark failure handling
- WHEN: submitBadMark のネットワーク呼び出しが失敗する
- THEN: エラーがコンソールに記録される
- AND: UIのバッドマーク状態はロールバックされる（楽観的更新の取消）

### SCENARIO-AF-09: getUserFeedback on sheet open
- WHEN: evidence-article-sheet が開かれる
- THEN: getUserFeedback が呼び出され、hasBadMark の状態が React state に反映される
- AND: 取得失敗時は hasBadMark = false として扱う（エラーは無視）
