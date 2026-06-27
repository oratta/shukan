# vercel-git-disable-config Specification

## Purpose
TBD - created by archiving change github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: vercel.json の github キーが enabled: false のみを持つ

`vercel.json` の `github` キーは `{ "enabled": false }` のみを MUST 含み、`autoAlias` キーは MUST NOT 含む。

#### Scenario: enabled: false が設定されている
- **WHEN** 運用者が `vercel.json` を読む
- **THEN** `github` キーが `{ "enabled": false }` として定義されている

#### Scenario: autoAlias が削除されている
- **WHEN** 運用者が `grep autoAlias vercel.json` を実行する
- **THEN** 0 件で返る（`autoAlias` は Git 連携前提のオプションで `enabled: false` 下では no-op になるため削除される）

