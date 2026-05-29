# github-setup-guide Specification

## Purpose
TBD - created by archiving change github-setup-guide. Update Purpose after archive.
## Requirements
### Requirement: GitHub Secrets と Vars の登録手順が記載されている

`docs/infrastructure/github-setup.md` SHALL 必要な Secrets / Vars のキー名・取得元・登録コマンドを MUST 記載する。

#### Scenario: 必要な Secrets/Vars が網羅されている
- **WHEN** 運用者が `docs/infrastructure/github-setup.md` を読む
- **THEN** Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `PROD_SUPABASE_SERVICE_ROLE_KEY` の 9 件と、Vars: `STAGING_DOMAIN`, `PRODUCTION_DOMAIN` の 2 件が全て記載されている

#### Scenario: gh CLI コマンド例がある
- **WHEN** 運用者がドキュメント内を `gh secret set` で検索する
- **THEN** `gh secret set VERCEL_TOKEN` などの一括登録例が記載されている

### Requirement: Branch Protection の非標準設計理由が明記されている

「PR 上では `ci` を Required Status Check に**しない**」という非標準設計の理由は、ドキュメント内に MUST 明記する。

#### Scenario: PR 上で ci を Required にしない理由
- **WHEN** 運用者が `docs/infrastructure/github-setup.md` の Branch Protection セクションを読む
- **THEN** 「`preview` ラベル未付与時は `ci` が走らないため、Required Status Check に指定すると pending のままマージ不可になる」「代わりに Merge Queue 経由（`merge_group` イベント）の `ci` PASS を Required にする」設計理由が記載されている

#### Scenario: Merge Queue の Required Status Check 設定手順
- **WHEN** 運用者がドキュメント内の Merge Queue 設定セクションを読む
- **THEN** Merge Queue 側で `ci` を Required Status Check として指定する手順が `gh` コマンドまたは UI 操作で記述されている

### Requirement: GitHub Environment "Production" 設定手順がある

GitHub Environment "Production" の作成と Required reviewers 設定の手順は MUST 記載する。

#### Scenario: Environment 作成手順
- **WHEN** 運用者がドキュメントを読む
- **THEN** Environment "Production" の作成方法と、Required reviewers に oratta を指定する手順（UI または `gh api` 経由）が記載されている

### Requirement: PR ラベル preview の作成手順とタイミング警告がある

`gh label create preview` のコマンドと、「ワークフロー merge 前に作成する必要がある」旨の警告は MUST 記載する。

#### Scenario: ラベル作成コマンドの存在
- **WHEN** 運用者がドキュメント内を `gh label create preview` で検索する
- **THEN** `gh label create preview --color ededed --description "Trigger preview deploy and CI"` 相当のコマンドが記載されている

#### Scenario: ラベル作成タイミングの警告
- **WHEN** 運用者がラベル作成セクションを読む
- **THEN** 「ワークフロー merge より前に行うこと（ラベル不在では付与操作自体ができないため）」が太字または明示的な警告として記述されている

### Requirement: Vercel env 手動登録手順がある

OAK Casino の `setup-vercel-env.yml` 相当を `vercel env add` の手動手順で代替するため、Vercel 側に直接登録する env のキー一覧と登録コマンドは MUST 記載する。

#### Scenario: Vercel env 登録コマンド
- **WHEN** 運用者がドキュメント内を `vercel env add` で検索する
- **THEN** Preview スコープへ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` を登録する `vercel env add <KEY> preview` 形式のコマンド例が記載されている

