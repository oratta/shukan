# Decisions: 2026-06-12_onboarding-kpi

意思決定ログ。各判断には実行したコマンド・出力等のエビデンスを必須で記録する。

---

## D-BC1: Build Contract レビュー結果の取捨選択（2026-06-12）

- **レビュー結果**: APPROVE（BLOCKER 0件、1ラウンド目で通過）
- **採用した指摘**: 「対象は index.ts 登録の35記事のみ、`LLM/` 配下 md は対象外」を change-A に1行追記
  - 分類: (a) 事実誤認防止（Setup 調査の「37ファイル」は index.ts と未トラック素材 md を含む数。builder が37記事と誤認するリスクを排除）
  - エビデンス: reviewer が `src/data/impact-articles/index.ts` の登録数と `ArticleId` union が35件であることを確認済み
- **反論・不採用**: なし（嗜好レベルの指摘は出なかった。補足3点はすべて plan が既にハンドリング済みであることの確認）

---

## D-SR1: Spec Review 結果の取捨選択（2026-06-12）

- **レビュー結果**: 全3 change APPROVE（BLOCKER 0件、1ラウンド目で通過）
- **採用**: NOTE-C1（onboarding-flow tasks 4.6 に insertHabit 必須フィールドの既定値方針を追記。builder の独自判断＝既定値の発明リスクを排除）、NOTE-A1（kpi-data-foundation proposal.md の Impact に LifeImpactSavings の定義場所 src/types/impact.ts を明記。事実誤認の修正）
- **不採用**: NOTE-B1（nationality→country 読み替え）・NOTE-B2（余命表関数の country 引数有無）
  - 理由: reviewer 自身が「表は日本のみで country 引数は実装上使われない可能性が高く実害は出にくい」「B/C の着手時確認タスク（change-C tasks 1.1、change-B D6）で吸収される設計なので自律実行をブロックしない」と認定。spec 修正は過剰で、plan の「シンプルな方を選ぶ」方針を優先
- **エビデンス**: reviewer が src/types/impact.ts:138-165 / src/middleware.ts:70-78 / src/lib/supabase/habits.ts:170,506 / src/data/impact-articles/index.ts:38-84 をコードと突き合わせ済み

## D-BUILD1: 直列ビルド（per-change worktree を作らない）（2026-06-12）

- **判断**: change-A→B→C は完全直列依存（plan.md Changes分解: B は A 依存、C は A+B 依存）のため、per-change の git worktree は作らず、現ブランチ `onboarding-data-setup` 上で longrun-builder を順次実行する
- **理由**: SKILL の worktree 並列化は「依存関係がない change」向け。完全直列チェーンでは並列性ゼロのまま worktree 作成→マージのオーバーヘッドとコンフリクトリスクだけが増える。本リポジトリ自体が既に専用 worktree（~/.superset/worktrees/）である点も考慮
- **エビデンス**: plan.md L65「依存関係: 独立」(A) / L80「依存関係: change-A」(B) / L97「依存関係: change-A, change-B」(C)。`git branch --show-current` → `onboarding-data-setup`
- **担保**: 各 builder は change 完了ごとにコミットする（未コミット消失リスクは worktree 削除がないため低いが、コミット粒度は維持）

## D-BUILD2: builder の model 指定（2026-06-12）

- **判断**: メモリの「実装系 subagent は Opus 4.8 で」は、当時のデフォルトより強いモデルを使う意図。現セッションのメインモデルは Fable 5（Opus より上位）のため、model 指定を省略して Fable 5 を継承させる（意図の上位互換）

---
