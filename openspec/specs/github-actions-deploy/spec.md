# github-actions-deploy Specification

## Purpose
TBD - created by archiving change github-actions-workflows. Update Purpose after archive.
## Requirements
### Requirement: ci.yml が存在し正しいトリガーを持つ

`.github/workflows/ci.yml` SHALL 存在し、トリガーは「PR ラベル `preview` 付与」「Merge Queue (`merge_group`)」「手動 (`workflow_dispatch`)」の 3 種類のみとし、push トリガーを MUST NOT 含めない。

#### Scenario: ci.yml のトリガー条件
- **WHEN** 運用者が `.github/workflows/ci.yml` の `on:` セクションを読む
- **THEN** `pull_request: types: [labeled]` + `merge_group` + `workflow_dispatch` の 3 トリガーが定義され、`pull_request: types: [synchronize]` や `push` は含まれていない

#### Scenario: ci.yml の label フィルタ
- **WHEN** 運用者が `.github/workflows/ci.yml` の各 job を読む
- **THEN** PR トリガー時に走る job には `if: github.event_name != 'pull_request' || github.event.label.name == 'preview'` 相当のガードがあり、`preview` ラベル以外では発火しない

#### Scenario: ci.yml に npm test step がある
- **WHEN** 運用者が `.github/workflows/ci.yml` を読む
- **THEN** `npm test` または `npm run test:run` を実行する step が含まれる（OAK Casino 版に無い Smitch 固有追加）

#### Scenario: ci.yml に actionlint job がある
- **WHEN** 運用者が `.github/workflows/ci.yml` を読む
- **THEN** `rhysd/actionlint` Docker image を使った actionlint job が定義されている

### Requirement: deploy-preview.yml が存在し Fork PR ガードを持つ

`.github/workflows/deploy-preview.yml` SHALL 存在し、トリガーは PR ラベル `preview` 付与のみで、job レベルに `preview` ラベル名フィルタと Fork PR ガードの両方を MUST 持つ。

#### Scenario: deploy-preview.yml の job-level if
- **WHEN** 運用者が `.github/workflows/deploy-preview.yml` の job 定義を読む
- **THEN** `if:` 句に `github.event.label.name == 'preview'` と `github.event.pull_request.head.repo.full_name == github.repository` の両方が AND で記述されている

#### Scenario: deploy-preview.yml の Preview URL コメント機能
- **WHEN** 運用者が `.github/workflows/deploy-preview.yml` を読む
- **THEN** `actions/github-script@v7` で Preview URL を PR コメントとして投稿する step が存在する

### Requirement: deploy-staging.yml が main push で発火し prod Supabase に override する

`.github/workflows/deploy-staging.yml` SHALL `push: branches: [main]` で発火し、Preview env を pull した上で Supabase 関連 env を prod に MUST 上書きし、`staging.s-mitch.com` へ alias する。

#### Scenario: deploy-staging.yml の env override
- **WHEN** 運用者が `.github/workflows/deploy-staging.yml` を読む
- **THEN** `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`, `PROD_SUPABASE_SERVICE_ROLE_KEY` を `sed` で `.vercel/.env.preview.local` に上書きする step + `vercel deploy` の `-e` フラグで runtime env も override する step の両方が存在し、LIFF 関連の env 上書きは一切含まれない

#### Scenario: deploy-staging.yml の staging.s-mitch.com alias
- **WHEN** 運用者が `.github/workflows/deploy-staging.yml` を読む
- **THEN** `vercel alias "$DEPLOY_URL" "$STAGING_DOMAIN"` step + `concurrency: group: staging-deploy` が定義されている

### Requirement: deploy-production.yml が workflow_dispatch + Environment approval を持つ

`.github/workflows/deploy-production.yml` SHALL `workflow_dispatch` でのみ発火し、`confirm=true` input + GitHub Environment "Production" の approval gate を MUST 持つ。

#### Scenario: deploy-production.yml の trigger と input
- **WHEN** 運用者が `.github/workflows/deploy-production.yml` を読む
- **THEN** `on: workflow_dispatch:` のみで、`inputs.confirm` (type: boolean, default: false) が定義されている

#### Scenario: deploy-production.yml の Environment 指定
- **WHEN** 運用者が `.github/workflows/deploy-production.yml` の job 定義を読む
- **THEN** `environment: name: Production` が指定されており、`url: https://${{ vars.PRODUCTION_DOMAIN }}` が紐づいている

#### Scenario: deploy-production.yml の confirm validation
- **WHEN** 運用者が `.github/workflows/deploy-production.yml` を読む
- **THEN** 最初の step に `confirm != 'true'` のときに `exit 1` するバリデーションがある

### Requirement: 4 workflow すべてが actionlint で構文エラーゼロ

すべての workflow YAML は actionlint で構文チェックを MUST 通過する。

#### Scenario: actionlint PASS
- **WHEN** 運用者が `docker run --rm -v "$(pwd):/repo" --workdir /repo rhysd/actionlint:latest -color` を実行する
- **THEN** exit code 0 で完了し、エラーメッセージが出力されない

