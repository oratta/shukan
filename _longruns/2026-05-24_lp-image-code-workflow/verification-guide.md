# verification-guide: lp-foundation (change-A)

各 Scenario の TDD 進捗チェック。テスト実装 → ロジック実装の順で進める。

## Spec: lp-foundation

### Requirement: DESIGN.md は LP 制作の権威ソースとして存在する

- Scenario: DESIGN.md が必要なセクションを全て含む
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: DESIGN.md の HEX が globals.css とスナップショット同期されている
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: DESIGN.md と globals.css の同期検証スクリプトが提供される

- Scenario: 同期が取れている場合は exit 0
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: 同期が崩れている場合は非ゼロで exit
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: brand-references ディレクトリは 16 枚 role-label 仕組みを README で明示する

- Scenario: README が 5 つの role を明示している
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: smitch-logo の参照メモが含まれる
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: Codex プロンプトテンプレートが Smitch 値で埋まった状態で配置される

- Scenario: テンプレートが Smitch 固定値を含む
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: NG ビジュアル 12 項目が Hard Constraints に列挙される
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: codex-image-gen.sh ラッパが必要な引数を受け取る

- Scenario: --help でヘルプを表示する
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: 必須引数欠落時はエラー終了
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: CLAUDE.md が Smitch コンセプトコアと hard rules を持つ

- Scenario: CLAUDE.md がコンセプトコアを含む
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: CLAUDE.md が hard rules を含む
  - [x] テスト実装完了
  - [x] ロジック実装完了

### Requirement: waitlist テーブル migration が plan の SQL Draft に準拠する

- Scenario: migration ファイルが必要な要素を全て含む
  - [x] テスト実装完了
  - [x] ロジック実装完了
- Scenario: willingness_to_pay_jpy の値域 check が存在する
  - [x] テスト実装完了
  - [x] ロジック実装完了

---

注: 本ファイルは TDD 進捗トラッカー。実装完了時に対応 Scenario のチェックを `[x]` に更新する。
全 Scenario が `[x]` になることが change-A 完了の必要条件 (十分条件は tasks.md 完了 + ビルド/lint PASS + コミット).

## 最終チェック

- [x] 全 tasks.md タスクが `[x]`
- [x] 全 vitest tests PASS (既存 197 + 新規)
- [x] `npm run lint` PASS
- [x] `npm run build` PASS
- [x] `openspec validate lp-foundation` PASS
- [x] worktree (lp-image-code-workflow ブランチ) にコミット済み
