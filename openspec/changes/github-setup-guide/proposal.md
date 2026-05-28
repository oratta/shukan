## Why

change-B でワークフローを配置しても、GitHub 側の Secrets / Vars / Environment / Branch Protection / Merge Queue / ラベル設定が無いと動作しない。これらは UI 操作と `gh` CLI 両方で設定可能だが、何をどの順序でどんな値で設定するかが明文化されていないと、後日の運用者（=自分）が再現できない。特に「PR 上では `ci` を Required Status Check にしない」という非標準設計の理由をドキュメント化することが重要。

## What Changes

- `docs/infrastructure/github-setup.md` を新規作成
  - GitHub Secrets / Vars 一覧と取得元
  - GitHub Environment "Production" 作成手順 + Required reviewers
  - Branch Protection Rule（main）設定手順（PR 上では `ci` を Required にしない設計理由を明記）
  - Merge Queue 設定手順（Required Status Check に `ci` を指定）
  - PR ラベル `preview` の作成手順（**ワークフロー merge 前に行う旨を太字警告**）
  - Vercel env 手動登録手順（OAK Casino の `setup-vercel-env.yml` 代替）

## Capabilities

### New Capabilities
- `github-setup-guide`: GitHub 側の設定（Secrets/Vars/Environment/Branch Protection/Merge Queue/ラベル）を再現可能にする手順書

### Modified Capabilities
（なし）

## Impact

- 影響範囲: `docs/infrastructure/github-setup.md` 新規追加のみ
- 既存コード変更: なし
- 依存関係: change-B 完了後（workflow ファイルが存在することで Required Status Check が意味を持つ）
